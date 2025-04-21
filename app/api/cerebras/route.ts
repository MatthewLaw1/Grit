import { NextRequest, NextResponse } from 'next/server';
import Cerebras from '@cerebras/cerebras_cloud_sdk';

interface ChatCompletionMessage {
  role: string;
  content: string;
}

interface ChatCompletion {
  choices: Array<{
    message: ChatCompletionMessage;
  }>;
}

interface Step {
  id: string;
  goal: string;
  reasoning: string;
  conclusion: string;
  children?: Step[];
  parentId?: string;
  score?: number;
}

interface StructuredResponse {
  steps: Step[];
  finalAnswer: string;
}

function buildTreeStructure(steps: Step[]): Step[] {
  const stepMap = new Map<string, Step>();
  const rootSteps: Step[] = [];

  // First pass: Create map of all steps
  steps.forEach(step => {
    stepMap.set(step.id, { ...step, children: [] });
  });

  // Second pass: Build tree structure
  steps.forEach(step => {
    const currentStep = stepMap.get(step.id)!;
    if (step.parentId && stepMap.has(step.parentId)) {
      const parentStep = stepMap.get(step.parentId)!;
      parentStep.children = parentStep.children || [];
      parentStep.children.push(currentStep);
    } else {
      rootSteps.push(currentStep);
    }
  });

  return rootSteps;
}

function filterStepsByScore(steps: Step[], threshold: number = 0.7): Step[] {
  return steps.map(step => ({
    ...step,
    children: step.children ? filterStepsByScore(step.children, threshold) : undefined,
  })).filter(step => (step.score || 0) >= threshold || (step.children && step.children.length > 0));
}

const client = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model, thoughtMode = 'chain' } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Prepare the system message based on thought mode
    const systemMessage = thoughtMode === 'chain'
      ? `You are an AI assistant that thinks through problems step-by-step. For each response:
1. First, break down the problem into AT LEAST 3-5 distinct steps or components
2. For EACH step:
   - State the specific goal for this step
   - Explain your detailed reasoning process
   - Provide a clear conclusion
3. Make sure to show the complete sequential process from start to finish
4. Each step should build on previous steps when relevant

Format your response as a JSON object with this structure. You MUST provide at least 3 steps:
{
  "steps": [
    {
      "goal": "What I'm trying to achieve",
      "reasoning": "My thought process",
      "conclusion": "What I determined",
      "id": "unique-step-id"
    }
  ],
  "finalAnswer": "The complete solution",
  "mode": "chain"
}`
      : `You are an AI assistant that thinks through problems using a tree-based approach. For each response:
1. First, identify the main goal and create a root step
2. For EACH step:
   - State the specific goal for this step
   - Explain your detailed reasoning process
   - Provide a clear conclusion
   - Break down into sub-steps when needed, creating a tree structure
3. Make sure to explore multiple branches of reasoning when appropriate
4. Each step should build on its parent step when relevant

Format your response as a JSON object with this structure:
{
  "steps": [
    {
      "goal": "What I'm trying to achieve",
      "reasoning": "My thought process",
      "conclusion": "What I determined",
      "id": "unique-step-id",
      "parentId": "parent-step-id",
      "children": [
        {
          "goal": "Sub-goal to achieve",
          "reasoning": "Sub-step thought process",
          "conclusion": "Sub-step conclusion",
          "id": "unique-substep-id",
          "parentId": "parent-id"
        }
      ]
    }
  ],
  "finalAnswer": "The complete solution",
  "mode": "tree"
}`;

    // Make request using Cerebras SDK
    console.log('Making request to Cerebras API with:', {
      model: 'deepseek-r1-distill-llama-70b',
      prompt,
      thoughtMode
    });

    const completion = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: "You MUST output ONLY a JSON object with this exact structure:\n" + systemMessage
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'deepseek-r1-distill-llama-70b',
      max_tokens: 2000,
      temperature: 0.7,
      top_p: 0.95
    });

    let parsedResponse: StructuredResponse;
    try {
      const response = completion as ChatCompletion;
      console.log('Raw Cerebras response:', response);
      let content = response.choices[0].message.content;
      console.log('Raw content:', content);

      // Extract JSON part if there's extra text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        content = jsonMatch[0];
      }
      console.log('Extracted JSON content:', content);
      
      try {
        // Try to parse the response content as JSON
        const rawResponse = JSON.parse(content);
        if (!rawResponse.steps || !Array.isArray(rawResponse.steps)) {
          throw new Error('Invalid response format');
        }
        parsedResponse = rawResponse;
      } catch {
        // If JSON parsing fails, create steps from text
        const lines = content.split('\n').filter(line => line.trim());
        const steps = [];
        let currentStep = null;

        for (const line of lines) {
          if (/^\d+\./.test(line)) {
            if (currentStep) {
              steps.push(currentStep);
            }
            currentStep = {
              id: String(steps.length + 1),
              goal: line.replace(/^\d+\.\s*/, ''),
              reasoning: '',
              conclusion: ''
            };
          } else if (currentStep) {
            if (!currentStep.reasoning) {
              currentStep.reasoning = line;
            } else {
              currentStep.conclusion = line;
            }
          }
        }
        if (currentStep) {
          steps.push(currentStep);
        }

        parsedResponse = {
          steps: steps.length > 0 ? steps : [{
            id: '1',
            goal: 'Process Response',
            reasoning: content,
            conclusion: content
          }],
          finalAnswer: lines[lines.length - 1] || content
        };
      }
    } catch (e) {
      throw new Error('Failed to process Cerebras API response');
    }

    return NextResponse.json({
      response: parsedResponse
    });
    
  } catch (error) {
    console.error('Cerebras API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

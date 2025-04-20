import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
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

    const systemPrompt = thoughtMode === 'chain'
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

    const message = await anthropic.messages.create({
      model: model || process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
      max_tokens: parseInt(process.env.MAX_TOKENS || '1000'),
      messages: [
        {
          role: 'user',
          content: `${systemPrompt}\n\nUser request: ${prompt}`,
        },
      ],
    });

    // Parse the response text as JSON
    const responseText = message.content[0].text;
    const parsedResponse = JSON.parse(responseText);
    
    return NextResponse.json({
      response: parsedResponse
    });
    
  } catch (error) {
    console.error('Anthropic API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
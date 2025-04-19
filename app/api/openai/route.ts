import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: model || process.env.OPENAI_MODEL || 'gpt-4o-2024-08-06',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that thinks through problems step-by-step. For each response:
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
      "conclusion": "What I determined"
    }
  ],
  "finalAnswer": "The complete solution"
}`
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: parseInt(process.env.MAX_TOKENS || '1000'),
      response_format: { type: "json_object" }
    });

    // The response is already JSON since we specified response_format
    const parsedResponse = JSON.parse(completion.choices[0].message.content || '{}');
    
    return NextResponse.json({
      response: parsedResponse
    });
    
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
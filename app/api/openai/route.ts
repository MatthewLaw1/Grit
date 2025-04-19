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
1. First, break down the problem into smaller components
2. Then, for each component:
   - State your current goal
   - Show your reasoning process
   - Explain your conclusion
3. Finally, combine your findings into a complete solution

Format your response as a JSON object with this structure. Break down the logic process into as long of a sequential process as possible:
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

    return NextResponse.json({ 
      response: completion.choices[0].message.content 
    });
    
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
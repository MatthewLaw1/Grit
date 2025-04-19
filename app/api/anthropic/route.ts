import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
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

    const systemPrompt = `You are an AI assistant that thinks through problems step-by-step. For each response:
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

    return NextResponse.json({ 
      response: message.content[0].text
    });
    
  } catch (error) {
    console.error('Anthropic API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
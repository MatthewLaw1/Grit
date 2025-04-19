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

    const message = await anthropic.messages.create({
      model: model || process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
      max_tokens: parseInt(process.env.MAX_TOKENS || '1000'),
      messages: [
        {
          role: 'user',
          content: prompt,
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
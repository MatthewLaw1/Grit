import { NextRequest, NextResponse } from 'next/server';

const TOT_API_URL = process.env.TOT_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, thoughtMode } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Call the Tree of Thought Python API
    const totResponse = await fetch(`${TOT_API_URL}/solve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        temperature: 0.7,
        n_generate_sample: 3,
        n_evaluate_sample: 3,
        n_select_sample: 3,
        method_generate: 'sample',
        method_evaluate: 'value',
        method_select: 'greedy',
        prompt_sample: 'cot'
      }),
    });

    if (!totResponse.ok) {
      throw new Error('Failed to get response from Tree of Thought service');
    }

    const data = await totResponse.json();
    
    // Transform the response into our frontend format
    const steps = data.steps.map((step: any, index: number) => ({
      id: `step-${index}`,
      goal: `Step ${index + 1}`,
      reasoning: step.new_ys.join('\n'),
      conclusion: step.select_new_ys.join('\n'),
      children: step.values.map((value: number, i: number) => ({
        id: `step-${index}-${i}`,
        parentId: `step-${index}`,
        goal: `Option ${i + 1}`,
        reasoning: step.new_ys[i],
        conclusion: `Confidence: ${value.toFixed(2)}`
      }))
    }));

    return NextResponse.json({
      response: {
        steps,
        finalAnswer: data.final_output.join('\n'),
        mode: 'tree'
      }
    });
    
  } catch (error) {
    console.error('Tree of Thought API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
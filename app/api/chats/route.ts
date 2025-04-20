import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase-client';

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Supabase admin client not available' },
      { status: 500 }
    );
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('chats')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching chats:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/chats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Supabase admin client not available' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { title, subheading } = body;

    // Insert new chat using the admin client
    const { data, error } = await supabaseAdmin
      .from('chats')
      .insert([
        {
          title,
          subheading,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating chat:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/chats:', error);
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    );
  }
}

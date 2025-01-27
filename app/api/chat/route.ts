import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from "@supabase/ssr";

export async function POST(request: Request) {
  try {
    const { message, sessionId } = await request.json()
    const cookieStore = cookies()
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Call Langflow API
    const response = await fetch(process.env.LANGFLOW_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LANGFLOW_API_KEY}`
      },
      body: JSON.stringify({
        input_value: message,
        output_type: "chat",
        input_type: "chat",
        tweaks: {
          "ChatInput-PcmTm": {
            session_id: sessionId
          }
        }
      })
    })

    // Log the response status and body
    console.log('Langflow API response status:', response.status);
    const responseBody = await response.json();
    console.log('Langflow API response body:', responseBody);

    const aiMessage = responseBody.outputs[0].outputs[0].artifacts.message

    // Save both messages to database
    await supabase.from('chat_sessions').insert([
      {
        session_id: sessionId,
        user_id: user.id,
        title: 'Chat',
        sender: 'user',
        content: message
      },
      {
        session_id: sessionId,
        user_id: user.id,
        title: 'Chat',
        sender: 'assistant',
        content: aiMessage
      }
    ])

    return NextResponse.json({ message: aiMessage })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 
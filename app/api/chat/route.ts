import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)
    let requestBody;
    
    try {
      requestBody = await request.json()
    } catch (error) {
      console.error('Error parsing request body:', error)
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { message, sessionId } = requestBody
    if (!message?.trim() || !sessionId) {
      return NextResponse.json({ error: 'Message and sessionId are required' }, { status: 400 })
    }

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('Auth error:', userError)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }

    // Create chat title from the message
    const chatTitle = message.length > 30 ? message.substring(0, 30) + '...' : message

    // First save the user's message
    console.log('Saving user message to Supabase:', { sessionId, message })
    const { error: userMessageError } = await supabase
      .from('chat_sessions')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        timestamp: new Date().toISOString(),
        title: chatTitle,
        sender: user.email || 'user',
        content: message
      })

    if (userMessageError) {
      console.error('Error saving user message:', userMessageError)
      return NextResponse.json({ error: 'Failed to save user message' }, { status: 500 })
    }

    // Call Langflow API
    console.log('Calling Langflow API...')
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
        tweaks: {}
      })
    })

    if (!response.ok) {
      console.error('Langflow API error:', response.status)
      return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 })
    }

    const responseBody = await response.json()
    console.log('Langflow API response:', JSON.stringify(responseBody, null, 2))

    // Extract the AI message and timestamp
    const timestamp = responseBody.outputs?.[0]?.outputs?.[0]?.results?.message?.timestamp || new Date().toISOString()
    const aiMessage = responseBody.outputs?.[0]?.outputs?.[0]?.artifacts?.message

    if (!aiMessage) {
      console.error('No message in Langflow response:', responseBody)
      return NextResponse.json({ error: 'Invalid response from AI' }, { status: 500 })
    }

    // Save AI response
    console.log('Saving AI response to Supabase:', aiMessage)
    const { error: aiMessageError } = await supabase
      .from('chat_sessions')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        timestamp: timestamp,
        title: chatTitle,
        sender: 'Machine',
        content: aiMessage
      })

    if (aiMessageError) {
      console.error('Error saving AI message:', aiMessageError)
      // Continue anyway since we have the AI response
    }

    return NextResponse.json({
      message: aiMessage,
      timestamp,
      sender: 'Machine',
      session_id: sessionId,
      flow_id: responseBody.session_id
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error: ' + (error as Error).message 
    }, { status: 500 })
  }
}
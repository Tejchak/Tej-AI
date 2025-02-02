import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    let requestBody;
    
    try {
      requestBody = await request.json()
    } catch (error) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { message, sessionId, userId } = requestBody
    if (!message?.trim() || !sessionId || !userId) {
      return NextResponse.json({ error: 'Message, sessionId, and userId are required' }, { status: 400 })
    }

    console.log('Saving user message to Supabase:', { sessionId, message })

    // Call Langflow API
    console.log('Calling Langflow API...')
    if (!process.env.LANGFLOW_API_URL || !process.env.LANGFLOW_API_KEY) {
      throw new Error('Langflow API configuration missing')
    }

    const langflowResponse = await fetch(process.env.LANGFLOW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LANGFLOW_API_KEY}`
      },
      body: JSON.stringify({
        input_value: message,
        flow_id: process.env.LANGFLOW_FLOW_ID,
        tweaks: {},
        chat_history: []
      })
    })

    if (!langflowResponse.ok) {
      const errorText = await langflowResponse.text()
      console.error('Langflow API error:', {
        status: langflowResponse.status,
        statusText: langflowResponse.statusText,
        error: errorText
      })
      throw new Error(`Failed to get response from Langflow: ${langflowResponse.status} ${langflowResponse.statusText}`)
    }

    const data = await langflowResponse.json()
    console.log('Langflow API response:', JSON.stringify(data, null, 2))

    // Extract the actual message from the Langflow response
    const aiMessage = data.outputs?.[0]?.outputs?.[0]?.artifacts?.message

    if (!aiMessage) {
      console.error('Invalid Langflow response format:', data)
      throw new Error('Invalid response format from Langflow')
    }

    console.log('Saving AI response to Supabase:', aiMessage)

    return NextResponse.json({ response: aiMessage })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}
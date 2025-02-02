import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    console.log('API Route - Starting request processing')
    const supabase = await createClient()
    let requestBody;
    
    try {
      requestBody = await request.json()
      console.log('Received request body:', requestBody)
    } catch (error) {
      console.error('Failed to parse request body:', error)
      return NextResponse.json({ 
        error: 'Invalid request format',
        details: error instanceof Error ? error.message : 'Unknown parsing error'
      }, { status: 400 })
    }

    const { message, sessionId, userId } = requestBody
    if (!message?.trim() || !sessionId || !userId) {
      console.error('Missing required fields:', { message, sessionId, userId })
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: {
          message: !message?.trim() ? 'Missing message' : undefined,
          sessionId: !sessionId ? 'Missing sessionId' : undefined,
          userId: !userId ? 'Missing userId' : undefined
        }
      }, { status: 400 })
    }

    console.log('Calling Langflow API with URL:', process.env.LANGFLOW_API_URL)
    
    if (!process.env.LANGFLOW_API_URL || !process.env.LANGFLOW_API_KEY) {
      console.error('Missing environment variables:', {
        hasApiUrl: !!process.env.LANGFLOW_API_URL,
        hasApiKey: !!process.env.LANGFLOW_API_KEY
      })
      return NextResponse.json({ 
        error: 'Configuration error',
        details: 'Missing API configuration'
      }, { status: 500 })
    }

    const langflowResponse = await fetch(process.env.LANGFLOW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LANGFLOW_API_KEY}`,
        'Origin': process.env.VERCEL_URL || 'http://localhost:3000'
      },
      body: JSON.stringify({
        input_value: message,
        tweaks: {},
        chat_history: []
      })
    })

    console.log('Langflow API Response Status:', langflowResponse.status)
    
    if (!langflowResponse.ok) {
      const errorText = await langflowResponse.text()
      console.error('Langflow API error:', {
        status: langflowResponse.status,
        statusText: langflowResponse.statusText,
        headers: Object.fromEntries(langflowResponse.headers.entries()),
        error: errorText
      })
      return NextResponse.json({ 
        error: 'AI service error',
        details: {
          status: langflowResponse.status,
          message: errorText
        }
      }, { status: langflowResponse.status })
    }

    const data = await langflowResponse.json()
    console.log('Langflow API response data:', JSON.stringify(data, null, 2))

    // Extract the actual message from the Langflow response
    const aiMessage = data.outputs?.[0]?.outputs?.[0]?.artifacts?.message

    if (!aiMessage) {
      console.error('Failed to extract AI message from response:', data)
      return NextResponse.json({ 
        error: 'Invalid AI response',
        details: 'Could not extract message from AI response'
      }, { status: 500 })
    }

    console.log('Successfully processed AI response:', aiMessage)
    return NextResponse.json({ response: aiMessage })
  } catch (error) {
    console.error('Unexpected error in API route:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error occurred',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    }, { status: 500 })
  }
}
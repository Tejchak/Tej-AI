import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from "@supabase/ssr";

export async function POST(request: Request) {
  try {
    // Log environment variables (without exposing sensitive data)
    console.log('Environment check:', {
      hasLangflowUrl: !!process.env.LANGFLOW_API_URL,
      hasLangflowKey: !!process.env.LANGFLOW_API_KEY
    })

    // Check for required environment variables
    const langflowApiUrl = process.env.LANGFLOW_API_URL?.trim()
    const langflowApiKey = process.env.LANGFLOW_API_KEY?.trim()

    if (!langflowApiUrl || !langflowApiKey) {
      console.error('Missing environment variables:', {
        hasUrl: !!langflowApiUrl,
        hasKey: !!langflowApiKey
      })
      return NextResponse.json(
        { error: 'Server configuration error - missing Langflow API credentials' },
        { status: 500 }
      )
    }

    // Validate URL format
    try {
      new URL(langflowApiUrl)
    } catch (error) {
      console.error('Invalid Langflow API URL:', error)
      return NextResponse.json(
        { error: 'Server configuration error - invalid Langflow API URL' },
        { status: 500 }
      )
    }

    const requestData = await request.json()
    console.log('Request data:', {
      hasMessage: !!requestData.message,
      hasSessionId: !!requestData.sessionId
    })

    const { message, sessionId } = requestData
    const cookieStore = cookies()
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('Auth error:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Attempting Langflow API call to:', langflowApiUrl)
    
    // Call Langflow API
    const response = await fetch(langflowApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${langflowApiKey}`
      },
      body: JSON.stringify({
        messages: [{
          content: message,
          role: "user"
        }],
        stream: false
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Langflow API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      return NextResponse.json(
        { error: 'Failed to get response from AI service', details: errorText },
        { status: response.status }
      )
    }

    // Log the response status and body
    console.log('Langflow API response status:', response.status)
    const responseBody = await response.json()
    console.log('Langflow API response structure:', Object.keys(responseBody))

    // Store the message in Supabase
    const { error: dbError } = await supabase
      .from('chat_sessions')
      .insert([
        {
          session_id: sessionId,
          user_id: user.id,
          timestamp: new Date().toISOString(),
          sender: user.email || 'user',
          content: message
        }
      ])

    if (dbError) {
      console.error('Database error:', dbError)
      // Continue anyway since we have the AI response
    }

    return NextResponse.json({ message: responseBody.message || responseBody.choices?.[0]?.message?.content })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
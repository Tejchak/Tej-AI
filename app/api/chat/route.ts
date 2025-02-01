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
        input_value: message,
        output_type: "chat",
        input_type: "chat",
        tweaks: {
          "OpenAIToolsAgent-FJkgE": {},
          "PythonREPLTool-trBxe": {},
          "YahooFinanceTool-vPwJs": {},
          "WikipediaAPI-Czz1N": {},
          "OpenAIModel-4oJMD": {},
          "ChatInput-PcmTm": {
            "session_id": sessionId
          },
          "Prompt-fTO3j": {},
          "ChatOutput-L5AHB": {},
          "PerplexityModel-SEw4i": {}
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Langflow API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url: response.url,
        headers: Object.fromEntries(response.headers)
      })
      return NextResponse.json(
        { error: 'Failed to get response from AI service', details: errorText },
        { status: response.status }
      )
    }

    // Parse the response
    const responseBody = await response.json()
    
    // Extract the AI message from the response
    const aiMessage = responseBody.outputs?.[0]?.outputs?.[0]?.artifacts?.message
    const timestamp = responseBody.outputs?.[0]?.outputs?.[0]?.results?.message?.timestamp || new Date().toISOString()

    // Store both user and AI messages in Supabase
    const { error: dbError } = await supabase
      .from('chat_sessions')
      .insert([
        // User message
        {
          session_id: sessionId,
          user_id: user.id,
          timestamp: new Date().toISOString(),
          sender: user.email || 'user',
          content: message,
          sender_name: 'User'
        },
        // AI response
        {
          session_id: sessionId,
          user_id: user.id,
          timestamp: timestamp,
          sender: 'Machine',
          content: aiMessage,
          sender_name: 'AI'
        }
      ])

    if (dbError) {
      console.error('Database error:', dbError)
      // Continue anyway since we have the AI response
    }

    return NextResponse.json({
      message: aiMessage,
      timestamp,
      sender: 'Machine',
      sender_name: 'AI',
      session_id: sessionId,
      flow_id: responseBody.session_id
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
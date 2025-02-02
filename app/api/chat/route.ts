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
      return NextResponse.json({ 
        response: "I apologize, but I couldn't process that request. Could you try again?" 
      })
    }

    const { message, sessionId, userId } = requestBody
    if (!message?.trim() || !sessionId || !userId) {
      return NextResponse.json({ 
        response: "I apologize, but something went wrong. Please try again or refresh the page." 
      })
    }

    console.log('Saving user message to Supabase:', { sessionId, message })

    // Call Langflow API
    console.log('Calling Langflow API...')
    if (!process.env.LANGFLOW_API_URL || !process.env.LANGFLOW_API_KEY) {
      return NextResponse.json({ 
        response: "I apologize, but I'm having trouble connecting to my services right now. Please try again in a moment." 
      })
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
      return NextResponse.json({ 
        response: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment." 
      })
    }

    const data = await langflowResponse.json()
    console.log('Langflow API response:', JSON.stringify(data, null, 2))

    // Extract the actual message from the Langflow response
    const aiMessage = data.outputs?.[0]?.outputs?.[0]?.artifacts?.message

    if (!aiMessage) {
      return NextResponse.json({ 
        response: "I apologize, but I couldn't generate a proper response. Could you rephrase your question?" 
      })
    }

    console.log('Saving AI response to Supabase:', aiMessage)

    return NextResponse.json({ response: aiMessage })
  } catch (error) {
    // Return a user-friendly error message instead of exposing the error
    return NextResponse.json({ 
      response: "I apologize, but something unexpected happened. Please try again in a moment." 
    })
  }
}
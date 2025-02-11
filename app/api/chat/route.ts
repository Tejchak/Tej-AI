import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { predefinedResponses } from '@/utils/predefinedResponses'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    let requestBody;
    
    try {
      requestBody = await request.json()
    } catch (error) {
      console.error('Request parsing error:', error)
      return NextResponse.json({ 
        response: "I apologize, but I couldn't process that request. Could you try again?" 
      })
    }

    const { message, sessionId, userId } = requestBody
    if (!message?.trim() || !sessionId || !userId) {
      console.error('Missing required fields:', { message, sessionId, userId })
      return NextResponse.json({ 
        response: "I apologize, but something went wrong. Please try again or refresh the page." 
      })
    }

    // Proceed with Langflow API first
    console.log('Calling Langflow API...')
    if (!process.env.LANGFLOW_API_URL || !process.env.LANGFLOW_API_KEY) {
      console.error('Missing API configuration')
      return NextResponse.json({ 
        response: "I apologize, but I'm having trouble connecting to my services right now. Please try again in a moment." 
      })
    }

    // Set up timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const langflowResponse = await fetch(process.env.LANGFLOW_API_URL, {
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
            "OpenAIToolsAgent-FJkgE": {},
            "PythonREPLTool-trBxe": {},
            "YahooFinanceTool-vPwJs": {},
            "WikipediaAPI-Czz1N": {},
            "OpenAIModel-4oJMD": {},
            "ChatInput-PcmTm": {
              "session_id": sessionId
            },
            "Prompt-fTO3j": {},
            "ChatOutput-L5AHB": {}
          }
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId);

      if (!langflowResponse.ok) {
        console.error('Langflow API error:', {
          status: langflowResponse.status,
          statusText: langflowResponse.statusText
        })

        // Check for fallback responses when API fails
        const fallbackResponse = predefinedResponses.find(pr => 
          pr.fallbackOnly && message.toLowerCase().includes(pr.query.toLowerCase())
        )
        if (fallbackResponse) {
          console.log('Using fallback response for query:', message)
          return NextResponse.json({ response: fallbackResponse.response })
        }

        return NextResponse.json({ 
          response: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment." 
        })
      }

      const data = await langflowResponse.json()
      console.log('Langflow API response:', JSON.stringify(data, null, 2))

      // Extract the actual message from the Langflow response
      const aiMessage = data.outputs?.[0]?.outputs?.[0]?.artifacts?.message

      if (!aiMessage) {
        console.error('Failed to extract message from response')
        
        // Also check fallback responses if we can't extract a message
        const fallbackResponse = predefinedResponses.find(pr => 
          pr.fallbackOnly && message.toLowerCase().includes(pr.query.toLowerCase())
        )
        if (fallbackResponse) {
          console.log('Using fallback response for query:', message)
          return NextResponse.json({ response: fallbackResponse.response })
        }

        return NextResponse.json({ 
          response: "I apologize, but I couldn't generate a proper response. Could you rephrase your question?" 
        })
      }

      return NextResponse.json({ response: aiMessage })
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      // Handle timeout or other fetch errors
      if (typeof error?.name === 'string' && error.name.includes('AbortError')) {
        console.error('Langflow API timeout after 15 seconds')
      } else {
        console.error('Unexpected error:', error)
      }

      // Check for fallback responses when request fails
      const fallbackResponse = predefinedResponses.find(pr => 
        pr.fallbackOnly && message.toLowerCase().includes(pr.query.toLowerCase())
      )
      if (fallbackResponse) {
        console.log('Using fallback response for query:', message)
        return NextResponse.json({ response: fallbackResponse.response })
      }

      return NextResponse.json({ 
        response: "I apologize, but I'm having trouble getting a response right now. Please try again in a moment." 
      })
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      response: "I apologize, but something unexpected went wrong. Please try again." 
    })
  }
}
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Auth error:', userError)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }

    // Generate a UUID for session_id
    const sessionId = randomUUID()

    // Create a new chat session in the database
    const { data, error: dbError } = await supabase
      .from('chat_sessions')
      .insert([
        {
          session_id: sessionId,
          user_id: user.id,
          timestamp: new Date().toISOString(),
          title: 'New Chat',
          sender: user.email || 'user',
          content: ''
        }
      ])
      .select('id, session_id')

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    return NextResponse.json({ 
      id: data[0].id,
      sessionId: data[0].session_id 
    })
  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { nanoid } from 'nanoid'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Auth error:', userError)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }

    // Generate a new session ID
    const sessionId = nanoid()

    // Create a new chat session in the database
    const { error: dbError } = await supabase
      .from('chat_sessions')
      .insert([
        {
          session_id: sessionId,
          user_id: user.id,
          created_at: new Date().toISOString(),
        }
      ])

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    return NextResponse.json({ sessionId })
  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 
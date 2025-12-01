import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Lazy initialization to avoid build-time errors when OPENAI_API_KEY is not set
const getOpenAI = () => new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  const openai = getOpenAI()
  try {
    const { messages, formality } = await request.json()

    const systemPrompt = `You are an expert communication analyst. Analyze the provided messages and create a detailed user profile. Focus on:

1. Writing style (formal/informal, punctuation habits, capitalization patterns)
2. Message patterns (length, frequency, response style)
3. Vocabulary and language preferences (abbreviations, emojis, slang)
4. Communication tempo and rhythm
5. Emotional expression patterns
6. Topic preferences and conversational flow

Return a JSON object with:
- writingStyle: Brief description of their writing style (as a string)
- messagePatterns: Their typical messaging patterns (as a string, not an object)
- characteristics: Array of key characteristics (array of strings)
- personalizedGreeting: A greeting that matches their communication style (as a string)

The user has indicated their formality preference as ${formality}/100 (0=very casual, 100=very formal).`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze these messages:\n\n${messages}` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const profile = JSON.parse(completion.choices[0].message.content || '{}')

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error analyzing messages:', error)
    return NextResponse.json(
      { error: 'Failed to analyze messages' },
      { status: 500 }
    )
  }
}
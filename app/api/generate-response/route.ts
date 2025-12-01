import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Lazy initialization to avoid build-time errors when OPENAI_API_KEY is not set
const getOpenAI = () => new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const openai = getOpenAI()
    const { chatId, userProfile, previousMessages } = await request.json()

    const lastAssistantMessage = previousMessages
      .filter((msg: any) => msg.role === 'assistant')
      .pop()

    if (!lastAssistantMessage) {
      return NextResponse.json({ 
        suggestion: "Hi! How are you doing today?" 
      })
    }

    const systemPrompt = `Based on the user's communication profile and the conversation context, generate a natural response that the user might send. 

User Profile:
- Writing Style: ${userProfile.writingStyle}
- Message Patterns: ${userProfile.messagePatterns}
- Characteristics: ${userProfile.characteristics.join(', ')}

Generate a response that:
1. Matches their typical message length and style
2. Uses their vocabulary and abbreviation patterns
3. Reflects their emotional expression style
4. Continues the conversation naturally

The response should feel like something they would actually write.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        ...previousMessages.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        })),
        { 
          role: 'user', 
          content: 'Generate a natural response that I might send in this conversation.' 
        }
      ],
      temperature: 0.8,
      max_tokens: 100,
    })

    const suggestion = completion.choices[0].message.content

    return NextResponse.json({ suggestion })
  } catch (error) {
    console.error('Error generating response:', error)
    return NextResponse.json(
      { error: 'Failed to generate response suggestion' },
      { status: 500 }
    )
  }
}
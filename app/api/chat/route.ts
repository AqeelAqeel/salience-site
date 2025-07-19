import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { message, chatId, userProfile, previousMessages } = await request.json()

    let systemPrompt = ''

    if (chatId === 'chat1') {
      systemPrompt = `You are a helpful AI assistant. Respond naturally and be conversational.`
    } else {
      systemPrompt = `You are an AI assistant that has analyzed the user's communication style. Adapt your responses to match their patterns:

Writing Style: ${userProfile.writingStyle}
Message Patterns: ${userProfile.messagePatterns}
Key Characteristics: ${userProfile.characteristics.join(', ')}

Mirror their:
- Capitalization patterns (all lowercase, proper case, etc.)
- Punctuation usage (minimal, proper, excessive)
- Message length and structure
- Vocabulary and abbreviation preferences
- Emotional expression style
- Response tempo and energy level

Important: Match their communication style naturally without explicitly mentioning that you're doing so. If they write in all lowercase with minimal punctuation, do the same. If they use lots of emojis and exclamation points, mirror that energy. The goal is to make the conversation feel natural and comfortable for them.`
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...previousMessages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature: chatId === 'chat1' ? 0.7 : 0.8,
      max_tokens: 150,
    })

    const response = completion.choices[0].message.content

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Error in chat:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
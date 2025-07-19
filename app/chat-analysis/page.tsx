'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Sparkles, MessageSquare, Circle } from 'lucide-react'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

type UserProfile = {
  writingStyle: string
  messagePatterns: string
  formality: number
  characteristics: string[]
}

type Step = 'input' | 'chat'

export default function ChatAnalysisPage() {
  const [uploadedMessages, setUploadedMessages] = useState('')
  const [formality, setFormality] = useState<number[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [chat1Messages, setChat1Messages] = useState<Message[]>([])
  const [chat2Messages, setChat2Messages] = useState<Message[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [chat1Input, setChat1Input] = useState('')
  const [chat2Input, setChat2Input] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedChat, setSelectedChat] = useState<'chat1' | 'chat2' | null>(null)
  const [currentStep, setCurrentStep] = useState<Step>('input')
  const [isChat1Loading, setIsChat1Loading] = useState(false)
  const [isChat2Loading, setIsChat2Loading] = useState(false)
  const [showInitialInput, setShowInitialInput] = useState(true)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile')
    const savedChat1 = localStorage.getItem('chat1Messages')
    const savedChat2 = localStorage.getItem('chat2Messages')
    const savedShowInitial = localStorage.getItem('showInitialInput')
    
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile))
      setCurrentStep('chat')
    }
    if (savedChat1) {
      const messages = JSON.parse(savedChat1)
      setChat1Messages(messages)
      if (messages.length > 0) {
        setShowInitialInput(false)
      }
    }
    if (savedChat2) {
      const messages = JSON.parse(savedChat2)
      setChat2Messages(messages)
    }
    if (savedShowInitial !== null) {
      setShowInitialInput(JSON.parse(savedShowInitial))
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('userProfile', JSON.stringify(userProfile))
    }
  }, [userProfile])

  useEffect(() => {
    if (chat1Messages.length > 0) {
      localStorage.setItem('chat1Messages', JSON.stringify(chat1Messages))
    }
  }, [chat1Messages])

  useEffect(() => {
    if (chat2Messages.length > 0) {
      localStorage.setItem('chat2Messages', JSON.stringify(chat2Messages))
    }
  }, [chat2Messages])

  useEffect(() => {
    localStorage.setItem('showInitialInput', JSON.stringify(showInitialInput))
  }, [showInitialInput])

  const analyzeMessages = async () => {
    if (!uploadedMessages.trim()) return
    
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/analyze-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: uploadedMessages,
          formality: formality[0] || 50
        })
      })
      
      const data = await response.json()
      setUserProfile(data.profile)
      setCurrentStep('chat')
    } catch (error) {
      console.error('Error analyzing messages:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const sendInitialMessage = async () => {
    if (!currentInput.trim() || !userProfile) return
    
    const userMessage: Message = {
      role: 'user',
      content: currentInput
    }
    
    // Add user message to both chats
    setChat1Messages([userMessage])
    setChat2Messages([userMessage])
    setShowInitialInput(false)
    setCurrentInput('')
    
    // Send to both chats
    setIsChat1Loading(true)
    setIsChat2Loading(true)
    
    // Chat 1 (Standard)
    try {
      const response1 = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          chatId: 'chat1',
          userProfile,
          previousMessages: []
        })
      })
      
      const data1 = await response1.json()
      setChat1Messages(prev => [...prev, {
        role: 'assistant',
        content: data1.response
      }])
    } catch (error) {
      console.error('Error sending to chat1:', error)
    } finally {
      setIsChat1Loading(false)
    }
    
    // Chat 2 (Personalized)
    try {
      const response2 = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          chatId: 'chat2',
          userProfile,
          previousMessages: []
        })
      })
      
      const data2 = await response2.json()
      setChat2Messages(prev => [...prev, {
        role: 'assistant',
        content: data2.response
      }])
    } catch (error) {
      console.error('Error sending to chat2:', error)
    } finally {
      setIsChat2Loading(false)
    }
  }

  const sendMessage = async (chatId: 'chat1' | 'chat2', message: string) => {
    if (!message.trim() || !userProfile) return
    
    const newMessage: Message = {
      role: 'user',
      content: message
    }
    
    if (chatId === 'chat1') {
      setChat1Messages(prev => [...prev, newMessage])
      setChat1Input('')
      setIsChat1Loading(true)
    } else {
      setChat2Messages(prev => [...prev, newMessage])
      setChat2Input('')
      setIsChat2Loading(true)
    }
    
    // Send to API
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          chatId,
          userProfile,
          previousMessages: chatId === 'chat1' ? chat1Messages : chat2Messages
        })
      })
      
      const data = await response.json()
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response
      }
      
      if (chatId === 'chat1') {
        setChat1Messages(prev => [...prev, assistantMessage])
      } else {
        setChat2Messages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      if (chatId === 'chat1') {
        setIsChat1Loading(false)
      } else {
        setIsChat2Loading(false)
      }
    }
  }


  const getFormalityEmoji = (value: number) => {
    if (value < 20) return '😈'
    if (value < 40) return '😎'
    if (value < 60) return '😊'
    if (value < 80) return '🤵'
    return '👼'
  }

  const clearData = () => {
    localStorage.removeItem('userProfile')
    localStorage.removeItem('chat1Messages')
    localStorage.removeItem('chat2Messages')
    localStorage.removeItem('showInitialInput')
    setUserProfile(null)
    setChat1Messages([])
    setChat2Messages([])
    setCurrentStep('input')
    setUploadedMessages('')
    setFormality([])
    setShowInitialInput(true)
    setChat1Input('')
    setChat2Input('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 py-12 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            What if we could use chat and behavioral messaging to understand you?
          </h1>
          <p className="text-zinc-400 text-lg max-w-3xl mx-auto">
            Upload your messages and experience how AI can adapt to your unique communication style
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'input' ? 'bg-yellow-500' : 'bg-green-500'
              }`}>
                <Circle className="w-4 h-4 text-white fill-white" />
              </div>
              <span className={`text-sm font-medium ${
                currentStep === 'input' ? 'text-white' : 'text-zinc-400'
              }`}>
                Part 1: Input Your Info
              </span>
            </div>
            <div className="w-16 h-0.5 bg-zinc-700" />
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'chat' ? 'bg-green-500' : currentStep === 'input' && isAnalyzing ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                <Circle className="w-4 h-4 text-white fill-white" />
              </div>
              <span className={`text-sm font-medium ${
                currentStep === 'chat' ? 'text-white' : 'text-zinc-400'
              }`}>
                Part 2: See Before/After Chat
              </span>
            </div>
          </div>
        </div>

        {!userProfile ? (
          <Card className="max-w-3xl mx-auto border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-white">Upload Your Messages</CardTitle>
              <CardDescription className="text-zinc-400">
                Paste your messages below to help us understand your writing style
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="messages" className="text-white mb-2 block">
                  Your Messages
                </Label>
                <Textarea
                  id="messages"
                  placeholder="Paste your messages here..."
                  value={uploadedMessages}
                  onChange={(e) => setUploadedMessages(e.target.value)}
                  className="min-h-[200px] bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
                <p className="mt-2 text-sm text-zinc-400">
                  <strong>Tip:</strong> Copy and paste from iMessage, email threads, or Twitter exchanges 
                  to capture your authentic writing style
                </p>
              </div>

              <div>
                <Label className="text-white mb-4 block">
                  Formality Level (Optional)
                </Label>
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">😈</span>
                  <div className="flex-1 relative py-3">
                    <div className="relative">
                      {/* Track */}
                      <div className="w-full h-2 bg-zinc-800 rounded-full relative">
                        {/* Custom range fill from center */}
                        {formality.length > 0 && (
                          <div 
                            className="absolute h-full bg-white rounded-full transition-all duration-200"
                            style={{
                              left: formality[0] < 50 ? `${formality[0]}%` : '50%',
                              right: formality[0] > 50 ? `${100 - formality[0]}%` : '50%',
                            }}
                          />
                        )}
                      </div>
                      {/* Thumb container with proper positioning */}
                      <div 
                        className="absolute top-0 w-full h-2"
                        style={{ marginTop: '-8px' }}
                      >
                        <div 
                          className="absolute w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-200 cursor-pointer border-2 border-zinc-900"
                          style={{
                            left: formality.length > 0 ? `${formality[0]}%` : '50%',
                            transform: 'translateX(-50%)',
                          }}
                        />
                      </div>
                      {/* Invisible slider for interaction */}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formality.length > 0 ? formality[0] : 50}
                        onChange={(e) => setFormality([parseInt(e.target.value)])}
                        className="absolute inset-0 w-full h-8 -mt-3 opacity-0 cursor-pointer"
                        style={{ zIndex: 10 }}
                      />
                    </div>
                  </div>
                  <span className="text-2xl">👼</span>
                </div>
                <div className="flex justify-between mt-2 text-xs text-zinc-500">
                  <span>Casual/Unhinged</span>
                  <span>Formal/Professional</span>
                </div>
                {formality.length > 0 && (
                  <div className="text-center mt-2">
                    <span className="text-2xl">{getFormalityEmoji(formality[0])}</span>
                    <p className="text-xs text-zinc-400 mt-1">Click to adjust</p>
                  </div>
                )}
              </div>

              <Button
                onClick={analyzeMessages}
                disabled={!uploadedMessages.trim() || isAnalyzing}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze My Messages'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Profile Card - Only show when initial input is visible */}
            {showInitialInput && (
              <Card className="border-zinc-800 bg-zinc-900/50 max-w-3xl mx-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Your Communication Profile</CardTitle>
                  <Button
                    onClick={clearData}
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    Start Over
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-zinc-400">Writing Style:</span>
                      <p className="text-white">{userProfile.writingStyle}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">Message Patterns:</span>
                      <p className="text-white">
                        {typeof userProfile.messagePatterns === 'string' 
                          ? userProfile.messagePatterns 
                          : JSON.stringify(userProfile.messagePatterns)}
                      </p>
                    </div>
                  </div>
                  {userProfile.characteristics && userProfile.characteristics.length > 0 && (
                    <div className="mt-4">
                      <span className="text-zinc-400 text-sm">Key Characteristics:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {userProfile.characteristics.map((char, idx) => (
                          <span key={idx} className="px-2 py-1 bg-zinc-800 text-white text-xs rounded">
                            {char}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Initial message input */}
            {showInitialInput && (
              <div className="max-w-2xl mx-auto">
                <Card className="border-zinc-800 bg-zinc-900/50">
                  <CardHeader>
                    <CardTitle className="text-white text-center">Start Your Conversation</CardTitle>
                    <CardDescription className="text-zinc-400 text-center">
                      Send your first message to see how both AI assistants respond differently
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            sendInitialMessage()
                          }
                        }}
                        placeholder="Type your message..."
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                      <Button
                        onClick={sendInitialMessage}
                        disabled={!currentInput.trim()}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Split chat view */}
            {!showInitialInput && (
              <div className="grid grid-cols-2 gap-8">
                {/* Standard Chat */}
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white flex items-center justify-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Standard Chat
                    </h3>
                    <p className="text-sm text-zinc-400">Regular AI assistant</p>
                  </div>
                  
                  <Card className="border-zinc-800 bg-zinc-900/50 h-[600px] flex flex-col">
                    <CardContent className="flex-1 p-4 overflow-hidden">
                      <ScrollArea className="h-full">
                        <div className="space-y-4 px-4">
                          {chat1Messages.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`flex ${
                                msg.role === 'user' ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div
                                className={`max-w-[80%] p-3 rounded-lg ${
                                  msg.role === 'user'
                                    ? 'bg-blue-600 text-white ml-auto'
                                    : 'bg-zinc-700 text-white'
                                }`}
                              >
                                {msg.content}
                              </div>
                            </div>
                          ))}
                          {isChat1Loading && (
                            <div className="flex justify-start">
                              <div className="bg-zinc-700 text-white p-3 rounded-lg">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                    <div className="p-4 border-t border-zinc-800">
                      <div className="flex gap-2">
                        <Input
                          value={chat1Input}
                          onChange={(e) => setChat1Input(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              sendMessage('chat1', chat1Input)
                            }
                          }}
                          placeholder="Type your message..."
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                          disabled={isChat1Loading}
                        />
                        <Button
                          onClick={() => sendMessage('chat1', chat1Input)}
                          disabled={!chat1Input.trim() || isChat1Loading}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Personalized Chat */}
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white flex items-center justify-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      Personalized Chat
                    </h3>
                    <p className="text-sm text-zinc-400">Adapts to your style</p>
                  </div>
                  
                  <Card className="border-zinc-800 bg-zinc-900/50 h-[600px] flex flex-col">
                    <CardContent className="flex-1 p-4 overflow-hidden">
                      <ScrollArea className="h-full">
                        <div className="space-y-4 px-4">
                          {chat2Messages.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`flex ${
                                msg.role === 'user' ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div
                                className={`max-w-[80%] p-3 rounded-lg ${
                                  msg.role === 'user'
                                    ? 'bg-purple-600 text-white ml-auto'
                                    : 'bg-zinc-700 text-white'
                                }`}
                              >
                                {msg.content}
                              </div>
                            </div>
                          ))}
                          {isChat2Loading && (
                            <div className="flex justify-start">
                              <div className="bg-zinc-700 text-white p-3 rounded-lg">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                    <div className="p-4 border-t border-zinc-800">
                      <div className="flex gap-2">
                        <Input
                          value={chat2Input}
                          onChange={(e) => setChat2Input(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              sendMessage('chat2', chat2Input)
                            }
                          }}
                          placeholder="Type your message..."
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                          disabled={isChat2Loading}
                        />
                        <Button
                          onClick={() => sendMessage('chat2', chat2Input)}
                          disabled={!chat2Input.trim() || isChat2Loading}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Start Over button when chat is active */}
            {!showInitialInput && (
              <div className="text-center mt-6">
                <Button
                  onClick={clearData}
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  Start Over
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
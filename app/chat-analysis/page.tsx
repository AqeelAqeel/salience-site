'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ChatBubble, ChatInput, ChatContainer, ChatHeader, ChatMessages } from '@/components/ui/chat-bubble'
import { Send, Sparkles, MessageSquare, Circle, Bot, User } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 py-16 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            <span className="sun-gradient-text">Personalized AI</span>
            <br />
            <span className="text-foreground">That Understands You</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            Upload your messages and experience how AI can adapt to your unique communication style
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                currentStep === 'input' ? 'bg-primary shadow-lg shadow-primary/25' : 'bg-primary/20 border-2 border-primary'
              }`}>
                <Circle className="w-5 h-5 text-primary-foreground" fill="currentColor" />
              </div>
              <span className={`text-sm font-medium transition-colors ${
                currentStep === 'input' ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                Upload Your Messages
              </span>
            </div>
            <Separator className="w-20" />
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                currentStep === 'chat' ? 'bg-primary shadow-lg shadow-primary/25' : currentStep === 'input' && isAnalyzing ? 'bg-primary/50' : 'bg-muted'
              }`}>
                <Circle className="w-5 h-5 text-primary-foreground" fill="currentColor" />
              </div>
              <span className={`text-sm font-medium transition-colors ${
                currentStep === 'chat' ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                Experience Personalized Chat
              </span>
            </div>
          </div>
        </div>

        {!userProfile ? (
          <Card className="max-w-3xl mx-auto border-border/50 shadow-xl bg-card/80 backdrop-blur-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">Upload Your Messages</CardTitle>
              <CardDescription className="text-base">
                Paste your messages below to help us understand your writing style
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="messages" className="text-base font-medium">
                  Your Messages
                </Label>
                <Textarea
                  id="messages"
                  placeholder="Paste your messages here..."
                  value={uploadedMessages}
                  onChange={(e) => setUploadedMessages(e.target.value)}
                  className="min-h-[240px] bg-secondary/30 border-border/50 focus:border-primary/50 transition-colors resize-none"
                />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">Tip:</span> Copy and paste from iMessage, email threads, or social media 
                  to capture your authentic writing style
                </p>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">
                  Formality Level (Optional)
                </Label>
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">😈</span>
                  <div className="flex-1 relative py-3">
                    <div className="relative">
                      {/* Track */}
                      <div className="w-full h-3 bg-secondary rounded-full relative overflow-hidden">
                        {/* Custom range fill from center */}
                        {formality.length > 0 && (
                          <div 
                            className="absolute h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300 ease-out"
                            style={{
                              left: formality[0] < 50 ? `${formality[0]}%` : '50%',
                              right: formality[0] > 50 ? `${100 - formality[0]}%` : '50%',
                            }}
                          />
                        )}
                      </div>
                      {/* Thumb container with proper positioning */}
                      <div 
                        className="absolute top-0 w-full h-3"
                        style={{ marginTop: '-10px' }}
                      >
                        <div 
                          className="absolute w-7 h-7 bg-primary rounded-full shadow-lg transition-all duration-200 cursor-pointer border-2 border-background hover:scale-110"
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
                <div className="flex justify-between mt-3 text-xs text-muted-foreground font-medium">
                  <span>Casual</span>
                  <span>Professional</span>
                </div>
                {formality.length > 0 && (
                  <div className="text-center mt-4">
                    <span className="text-3xl">{getFormalityEmoji(formality[0])}</span>
                    <p className="text-xs text-muted-foreground mt-2">Drag to adjust</p>
                  </div>
                )}
              </div>

              <Button
                onClick={analyzeMessages}
                disabled={!uploadedMessages.trim() || isAnalyzing}
                className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    Analyzing Your Style...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Analyze My Messages
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Profile Card - Only show when initial input is visible */}
            {showInitialInput && (
              <Card className="border-border/50 shadow-xl bg-card/80 backdrop-blur-sm max-w-3xl mx-auto">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-2xl">Your Communication Profile</CardTitle>
                  <Button
                    onClick={clearData}
                    variant="outline"
                    size="sm"
                    className="hover:bg-secondary"
                  >
                    Start Over
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">Writing Style</span>
                      <p className="text-base font-medium">{userProfile.writingStyle}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">Message Patterns</span>
                      <p className="text-base font-medium">
                        {typeof userProfile.messagePatterns === 'string' 
                          ? userProfile.messagePatterns 
                          : JSON.stringify(userProfile.messagePatterns)}
                      </p>
                    </div>
                  </div>
                  {userProfile.characteristics && userProfile.characteristics.length > 0 && (
                    <div className="space-y-3">
                      <span className="text-sm font-medium text-muted-foreground">Key Characteristics</span>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.characteristics.map((char, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-secondary text-secondary-foreground text-sm font-medium rounded-full">
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
                <Card className="border-border/50 shadow-xl bg-card/80 backdrop-blur-sm">
                  <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl">Start Your Conversation</CardTitle>
                    <CardDescription className="text-base">
                      Send your first message to see how both AI assistants respond differently
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      <Input
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            sendInitialMessage()
                          }
                        }}
                        placeholder="Type your message..."
                        className="h-12 bg-secondary/30 border-border/50 focus:border-primary/50 transition-colors"
                      />
                      <Button
                        onClick={sendInitialMessage}
                        disabled={!currentInput.trim()}
                        className="h-12 px-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Split chat view */}
            {!showInitialInput && (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Standard Chat */}
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
                      <Bot className="h-5 w-5 text-muted-foreground" />
                      Standard Assistant
                    </h3>
                    <p className="text-sm text-muted-foreground">Generic AI responses</p>
                  </div>
                  
                  <ChatContainer height="700px">
                    <ChatHeader
                      title="AI Assistant"
                      subtitle="Standard responses"
                      avatar={{ fallback: "AI" }}
                      status="online"
                    />
                    <ChatMessages>
                      {chat1Messages.map((msg, idx) => (
                        <ChatBubble
                          key={idx}
                          variant={msg.role === 'user' ? 'sent' : 'received'}
                          avatar={msg.role === 'assistant' ? { fallback: "AI" } : undefined}
                          timestamp={new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        >
                          {msg.content}
                        </ChatBubble>
                      ))}
                      {isChat1Loading && (
                        <ChatBubble
                          variant="received"
                          avatar={{ fallback: "AI" }}
                          isTyping
                        />
                      )}
                    </ChatMessages>
                    <ChatInput
                      onSend={(message) => sendMessage('chat1', message)}
                      disabled={isChat1Loading}
                      placeholder="Type your message..."
                    />
                  </ChatContainer>
                </div>

                {/* Personalized Chat */}
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Personalized Assistant
                    </h3>
                    <p className="text-sm text-muted-foreground">Adapts to your communication style</p>
                  </div>
                  
                  <ChatContainer height="700px" className="border-primary/20">
                    <ChatHeader
                      title="Personalized AI"
                      subtitle="Matches your style"
                      avatar={{ fallback: "ME" }}
                      status="online"
                    />
                    <ChatMessages>
                      {chat2Messages.map((msg, idx) => (
                        <ChatBubble
                          key={idx}
                          variant={msg.role === 'user' ? 'sent' : 'received'}
                          avatar={msg.role === 'assistant' ? { fallback: "ME" } : undefined}
                          timestamp={new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        >
                          {msg.content}
                        </ChatBubble>
                      ))}
                      {isChat2Loading && (
                        <ChatBubble
                          variant="received"
                          avatar={{ fallback: "ME" }}
                          isTyping
                        />
                      )}
                    </ChatMessages>
                    <ChatInput
                      onSend={(message) => sendMessage('chat2', message)}
                      disabled={isChat2Loading}
                      placeholder="Type your message..."
                    />
                  </ChatContainer>
                </div>
              </div>
            )}

            {/* Start Over button when chat is active */}
            {!showInitialInput && (
              <div className="text-center mt-8">
                <Button
                  onClick={clearData}
                  variant="outline"
                  size="lg"
                  className="hover:bg-secondary"
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
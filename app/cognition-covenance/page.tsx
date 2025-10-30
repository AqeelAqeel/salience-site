"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Send, Brain, BarChart3, Loader2, RefreshCw, Undo2, Upload } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface UserContext {
  contextData: string;
  contextCompleteness: number;
  lastUpdated: Date | null;
}

interface UserAnalysis {
  tone: string;
  demographics: string;
  emotionalState: string;
  interests: string[];
  concerns: string[];
  values: string[];
  attachmentPatterns: string;
}

export default function CognitionCovenancePage() {
  const [activeTab, setActiveTab] = useState<"chat" | "analysis">("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userContext, setUserContext] = useState<UserContext>({
    contextData: "",
    contextCompleteness: 0,
    lastUpdated: null,
  });
  const [userAnalysis, setUserAnalysis] = useState<UserAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previousState, setPreviousState] = useState<{
    messages: Message[];
    userContext: UserContext;
  } | null>(null);
  const [showContextInput, setShowContextInput] = useState(false);
  const [contextInput, setContextInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user context from localStorage on mount
  useEffect(() => {
    const savedContext = localStorage.getItem("userContext");
    const savedMessages = localStorage.getItem("chatMessages");
    
    if (savedContext) {
      setUserContext(JSON.parse(savedContext));
    }
    
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const calculateContextCompleteness = (text: string): number => {
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const targetWords = 200; // Target word count for "complete" context
    return Math.min((wordCount / targetWords) * 100, 100);
  };

  const handleReset = () => {
    // Save current state before resetting
    setPreviousState({
      messages: [...messages],
      userContext: { ...userContext },
    });

    // Clear everything
    setMessages([]);
    setUserContext({
      contextData: "",
      contextCompleteness: 0,
      lastUpdated: null,
    });
    setUserAnalysis(null);
    localStorage.removeItem("chatMessages");
    localStorage.removeItem("userContext");
  };

  const handleUndo = () => {
    if (previousState) {
      setMessages(previousState.messages);
      setUserContext(previousState.userContext);
      localStorage.setItem("chatMessages", JSON.stringify(previousState.messages));
      localStorage.setItem("userContext", JSON.stringify(previousState.userContext));
      setPreviousState(null);
    }
  };

  const handleContextSubmit = () => {
    if (!contextInput.trim()) return;

    const newContextData = userContext.contextData 
      ? userContext.contextData + "\n\n" + contextInput 
      : contextInput;
    
    const newCompleteness = calculateContextCompleteness(newContextData);
    const newContext = {
      contextData: newContextData,
      contextCompleteness: newCompleteness,
      lastUpdated: new Date(),
    };
    
    setUserContext(newContext);
    localStorage.setItem("userContext", JSON.stringify(newContext));
    setContextInput("");
    setShowContextInput(false);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userContext: userContext.contextData,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update context if this is early in the conversation
      if (userContext.contextCompleteness < 100) {
        const newContextData = userContext.contextData + "\n" + input;
        const newCompleteness = calculateContextCompleteness(newContextData);
        const newContext = {
          contextData: newContextData,
          contextCompleteness: newCompleteness,
          lastUpdated: new Date(),
        };
        setUserContext(newContext);
        localStorage.setItem("userContext", JSON.stringify(newContext));
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (messages.length === 0 || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          userContext: userContext.contextData,
        }),
      });

      if (!response.ok) throw new Error("Failed to analyze");

      const analysis = await response.json();
      setUserAnalysis(analysis);
    } catch (error) {
      console.error("Error analyzing:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Cognition Covenance
        </h1>

        {/* Tab Navigation and Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <Button
              variant={activeTab === "chat" ? "default" : "outline"}
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-2 ${
                activeTab === "chat"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 border-0"
                  : "bg-transparent border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
              }`}
            >
              <Brain className="w-4 h-4" />
              Chat
            </Button>
            <Button
              variant={activeTab === "analysis" ? "default" : "outline"}
              onClick={() => {
                setActiveTab("analysis");
                if (!userAnalysis && messages.length > 0) {
                  handleAnalyze();
                }
              }}
              className={`flex items-center gap-2 ${
                activeTab === "analysis"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 border-0"
                  : "bg-transparent border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analysis
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleUndo}
              disabled={!previousState}
              className="bg-transparent border-purple-500/50 text-purple-400 hover:bg-purple-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Undo2 className="w-4 h-4 mr-2" />
              Undo
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="bg-transparent border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {activeTab === "chat" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Context Progress */}
            <Card className="lg:col-span-3 bg-gray-900/50 border-purple-500/20 p-6">
              <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Context Engine
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Tell us about yourself! The more we know, the better we can assist you.
              </p>
              <Progress 
                value={userContext.contextCompleteness} 
                className="h-3 bg-gray-800 [&>div]:bg-gradient-to-r [&>div]:from-purple-600 [&>div]:to-pink-600"
              />
              <p className="text-xs text-gray-500 mt-2 mb-4">
                {userContext.contextCompleteness.toFixed(0)}% Complete
              </p>
              
              <Button
                onClick={() => setShowContextInput(!showContextInput)}
                className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30"
              >
                <Upload className="w-4 h-4 mr-2" />
                Add Context
              </Button>
              
              {showContextInput && (
                <div className="mt-4 space-y-3">
                  <Textarea
                    value={contextInput}
                    onChange={(e) => setContextInput(e.target.value)}
                    placeholder="Tell us about yourself, your interests, goals, or anything that helps us understand you better..."
                    className="bg-gray-800 border-purple-500/30 text-white resize-none"
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleContextSubmit}
                      disabled={!contextInput.trim()}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Submit
                    </Button>
                    <Button
                      onClick={() => {
                        setShowContextInput(false);
                        setContextInput("");
                      }}
                      variant="outline"
                      className="flex-1 bg-transparent border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Chat Interface */}
            <Card className="lg:col-span-9 bg-gray-900/50 border-purple-500/20 flex flex-col h-[70vh]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 mt-8">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-purple-500/50" />
                    <p>Start a conversation to begin building your cognitive profile</p>
                  </div>
                )}
                
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] p-4 rounded-2xl ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                          : "bg-gray-800 text-gray-200 border border-purple-500/20"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-2">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 text-gray-200 border border-purple-500/20 p-4 rounded-2xl">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-purple-500/20">
                <div className="flex gap-3">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 bg-gray-800 border-purple-500/30 text-white resize-none"
                    rows={2}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          /* Analysis Tab */
          <Card className="bg-gray-900/50 border-purple-500/20 p-6">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-4" />
                <p className="text-gray-400">Analyzing your conversation patterns...</p>
              </div>
            ) : userAnalysis ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-purple-400 mb-6">Cognitive Analysis</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800/50 rounded-lg p-6 border border-purple-500/20">
                    <h3 className="text-lg font-semibold text-purple-400 mb-3">Tone & Style</h3>
                    <p className="text-gray-300">{userAnalysis.tone}</p>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-6 border border-purple-500/20">
                    <h3 className="text-lg font-semibold text-purple-400 mb-3">Demographics</h3>
                    <p className="text-gray-300">{userAnalysis.demographics}</p>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-6 border border-purple-500/20">
                    <h3 className="text-lg font-semibold text-purple-400 mb-3">Emotional State</h3>
                    <p className="text-gray-300">{userAnalysis.emotionalState}</p>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-6 border border-purple-500/20">
                    <h3 className="text-lg font-semibold text-purple-400 mb-3">Attachment Patterns</h3>
                    <p className="text-gray-300">{userAnalysis.attachmentPatterns}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="bg-gray-800/50 rounded-lg p-6 border border-purple-500/20">
                    <h3 className="text-lg font-semibold text-purple-400 mb-3">Interests</h3>
                    <ul className="space-y-2">
                      {userAnalysis.interests.map((interest, i) => (
                        <li key={i} className="text-gray-300 text-sm">• {interest}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-6 border border-purple-500/20">
                    <h3 className="text-lg font-semibold text-purple-400 mb-3">Concerns</h3>
                    <ul className="space-y-2">
                      {userAnalysis.concerns.map((concern, i) => (
                        <li key={i} className="text-gray-300 text-sm">• {concern}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-6 border border-purple-500/20">
                    <h3 className="text-lg font-semibold text-purple-400 mb-3">Core Values</h3>
                    <ul className="space-y-2">
                      {userAnalysis.values.map((value, i) => (
                        <li key={i} className="text-gray-300 text-sm">• {value}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-purple-500/50" />
                <p className="text-gray-400">No analysis yet. Start chatting to build your profile!</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
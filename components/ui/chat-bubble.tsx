import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'sent' | 'received'
  avatar?: {
    src?: string
    fallback: string
  }
  timestamp?: string
  status?: 'sending' | 'sent' | 'delivered' | 'read'
  isTyping?: boolean
}

const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ className, variant = 'received', avatar, timestamp, status, isTyping, children, ...props }, ref) => {
    const isSent = variant === 'sent'
    
    return (
      <div
        ref={ref}
        className={cn(
          "flex gap-3 max-w-[85%]",
          isSent ? "ml-auto flex-row-reverse" : "mr-auto",
          className
        )}
        {...props}
      >
        {avatar && !isSent && (
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={avatar.src} alt={avatar.fallback} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {avatar.fallback}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className="flex flex-col gap-1">
          <div
            className={cn(
              "relative px-4 py-3 rounded-2xl text-sm",
              "transition-all duration-200 ease-out",
              isSent 
                ? "bg-primary text-primary-foreground rounded-br-md" 
                : "bg-secondary text-secondary-foreground rounded-bl-md",
              "shadow-sm hover:shadow-md"
            )}
          >
            {isTyping ? (
              <div className="flex gap-1 py-1">
                <span className="w-2 h-2 bg-current rounded-full animate-bounce opacity-60" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-current rounded-full animate-bounce opacity-60" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-current rounded-full animate-bounce opacity-60" style={{ animationDelay: "300ms" }} />
              </div>
            ) : (
              <div className="whitespace-pre-wrap break-words">{children}</div>
            )}
          </div>
          
          {(timestamp || status) && (
            <div className={cn(
              "flex items-center gap-2 text-xs text-muted-foreground px-1",
              isSent ? "justify-end" : "justify-start"
            )}>
              {timestamp && <span>{timestamp}</span>}
              {status && isSent && (
                <span className="flex items-center">
                  {status === 'sending' && "•"}
                  {status === 'sent' && "✓"}
                  {status === 'delivered' && "✓✓"}
                  {status === 'read' && <span className="text-primary">✓✓</span>}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
)
ChatBubble.displayName = "ChatBubble"

export interface ChatInputProps extends React.HTMLAttributes<HTMLDivElement> {
  onSend?: (message: string) => void
  placeholder?: string
  disabled?: boolean
}

const ChatInput = React.forwardRef<HTMLDivElement, ChatInputProps>(
  ({ className, onSend, placeholder = "Type a message...", disabled = false, ...props }, ref) => {
    const [message, setMessage] = React.useState("")
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    
    const handleSend = () => {
      if (message.trim() && onSend) {
        onSend(message.trim())
        setMessage("")
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
        }
      }
    }
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    }
    
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(e.target.value)
      
      // Auto-resize textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
      }
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-end gap-3 p-4 border-t bg-background/50 backdrop-blur-sm",
          className
        )}
        {...props}
      >
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            "flex-1 resize-none outline-none bg-secondary/50 rounded-2xl px-4 py-3",
            "placeholder:text-muted-foreground text-sm",
            "focus:bg-secondary transition-colors duration-200",
            "min-h-[48px] max-h-[120px]"
          )}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className={cn(
            "shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground",
            "flex items-center justify-center transition-all duration-200",
            "hover:scale-105 active:scale-95",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
            "shadow-md hover:shadow-lg"
          )}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    )
  }
)
ChatInput.displayName = "ChatInput"

export interface ChatContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  height?: string | number
}

const ChatContainer = React.forwardRef<HTMLDivElement, ChatContainerProps>(
  ({ className, height = "600px", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col rounded-2xl border bg-card shadow-lg overflow-hidden",
          className
        )}
        style={{ height }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ChatContainer.displayName = "ChatContainer"

export interface ChatHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  avatar?: {
    src?: string
    fallback: string
  }
  status?: 'online' | 'offline' | 'typing'
}

const ChatHeader = React.forwardRef<HTMLDivElement, ChatHeaderProps>(
  ({ className, title, subtitle, avatar, status, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-3 p-4 border-b bg-background/50 backdrop-blur-sm",
          className
        )}
        {...props}
      >
        {avatar && (
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatar.src} alt={avatar.fallback} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {avatar.fallback}
              </AvatarFallback>
            </Avatar>
            {status && (
              <span className={cn(
                "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
                status === 'online' && "bg-green-500",
                status === 'offline' && "bg-muted",
                status === 'typing' && "bg-primary animate-pulse"
              )} />
            )}
          </div>
        )}
        
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground">
              {status === 'typing' ? 'Typing...' : subtitle}
            </p>
          )}
        </div>
        
        {children}
      </div>
    )
  }
)
ChatHeader.displayName = "ChatHeader"

export interface ChatMessagesProps extends React.HTMLAttributes<HTMLDivElement> {
  autoScroll?: boolean
}

const ChatMessages = React.forwardRef<HTMLDivElement, ChatMessagesProps>(
  ({ className, autoScroll = true, children, ...props }, ref) => {
    const messagesEndRef = React.useRef<HTMLDivElement>(null)
    
    React.useEffect(() => {
      if (autoScroll) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }, [children, autoScroll])
    
    return (
      <div
        ref={ref}
        className={cn(
          "flex-1 overflow-y-auto p-4 space-y-4",
          "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent",
          className
        )}
        {...props}
      >
        {children}
        <div ref={messagesEndRef} />
      </div>
    )
  }
)
ChatMessages.displayName = "ChatMessages"

export { ChatBubble, ChatInput, ChatContainer, ChatHeader, ChatMessages }
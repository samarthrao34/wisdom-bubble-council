import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, Copy, Trash2, Moon, Sun, Download, FileText, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Advisor, Message } from '@/types/advisor';
import { geminiService } from '@/services/gemini';
import { AdvisorFlame } from '@/components/AdvisorFlame';
import { VoiceControls } from '@/components/VoiceControls';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  advisor: Advisor;
  onBack: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ advisor, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeechId, setCurrentSpeechId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [messageCount, setMessageCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice input error",
          description: "Please try again or type your message.",
          variant: "destructive"
        });
      };
    }
  }, [toast]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date(),
      advisorId: advisor.id
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setMessageCount(prev => prev + 1);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const response = await geminiService.generateResponse(
        inputMessage,
        advisor,
        conversationHistory
      );

      const advisorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'advisor',
        timestamp: new Date(),
        advisorId: advisor.id,
        advisorName: advisor.name
      };

      setMessages(prev => [...prev, advisorMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceInput = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakMessage = (text: string, messageId: string) => {
    if ('speechSynthesis' in window) {
      // Stop current speech if any
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        setCurrentSpeechId(messageId);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentSpeechId(null);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        setCurrentSpeechId(null);
        toast({
          title: "Speech error",
          description: "Could not speak the message.",
          variant: "destructive",
        });
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Text-to-speech not supported",
        description: "Your browser doesn't support text-to-speech.",
        variant: "destructive",
      });
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSpeechId(null);
    }
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Message copied to clipboard.",
    });
  };

  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const exportChat = () => {
    const chatContent = messages.map(msg => 
      `${msg.role === 'user' ? 'You' : advisor.name}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-with-${advisor.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const insertTemplate = (template: string) => {
    setInputMessage(template);
  };

  return (
    <div className="min-h-screen space-background flex flex-col relative overflow-hidden">
      {/* Animated Star Field */}
      <div className="space-stars" />
      
      {/* Additional Cosmic Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cosmic-purple/5 via-transparent to-nebula-pink/3" />
      {/* Header */}
      <div className="glass-card rounded-none border-x-0 border-t-0 p-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            ← Back
          </Button>
          <div className="flex items-center gap-3">
            <AdvisorFlame 
              advisor={advisor}
              isActive={true}
              isSpeaking={isSpeaking}
              className="w-12 h-16"
            />
            <div>
              <h2 className="font-bold text-lg gradient-text">{advisor.name}</h2>
              <p className="text-sm text-muted-foreground">{advisor.title}</p>
              {isSpeaking && (
                <Badge variant="secondary" className="text-xs mt-1 animate-pulse">
                  Speaking...
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <VoiceControls
            isListening={isListening}
            isSpeaking={isSpeaking}
            onToggleListening={isListening ? stopVoiceInput : startVoiceInput}
            onStopSpeaking={stopSpeaking}
          />
          <Badge variant="secondary" className="animate-pulse">
            {messageCount} messages
          </Badge>
          <Button variant="ghost" size="sm" onClick={exportChat}>
            <Download className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4 relative z-10">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto mb-6">
                <AdvisorFlame 
                  advisor={advisor}
                  isActive={true}
                  isSpeaking={false}
                  className="w-20 h-24 mx-auto"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2 gradient-text">
                Hello! I'm {advisor.name}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {advisor.approach}
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex group",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {/* Message Content with Advisor Flame Avatar */}
              <div className="flex items-start space-x-3">
                {message.role === 'advisor' && (
                  <div className="flex-shrink-0">
                    <AdvisorFlame 
                      advisor={advisor}
                      isActive={true}
                      isSpeaking={isSpeaking && currentSpeechId === message.id}
                      className="w-12 h-16"
                    />
                  </div>
                )}
                <div
                  className={cn(
                    "message-bubble animate-fade-in group-hover:shadow-lg",
                    message.role === 'user' 
                      ? 'user-message' 
                      : 'advisor-message'
                  )}
                >
                  {message.role === 'advisor' && (
                    <div className="text-xs text-muted-foreground mb-1 font-medium flex items-center space-x-2">
                      <span>{advisor.name}</span>
                      {isSpeaking && currentSpeechId === message.id && (
                        <Badge variant="secondary" className="text-xs animate-pulse">
                          Speaking
                        </Badge>
                      )}
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  
                  {/* Message Actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyMessage(message.content)}
                      className="h-6 px-2"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    {message.role === 'advisor' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (isSpeaking && currentSpeechId === message.id) {
                            stopSpeaking();
                          } else {
                            speakMessage(message.content, message.id);
                          }
                        }}
                        className={cn(
                          "h-6 px-2",
                          isSpeaking && currentSpeechId === message.id && "animate-pulse"
                        )}
                      >
                        {isSpeaking && currentSpeechId === message.id ? (
                          <Pause className="w-3 h-3" />
                        ) : (
                          <Volume2 className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMessage(message.id)}
                      className="h-6 px-2 text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="advisor-message typing-indicator">
                <div className="typing-dot" style={{ animationDelay: '0s' }} />
                <div className="typing-dot" style={{ animationDelay: '0.2s' }} />
                <div className="typing-dot" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="glass-card rounded-none border-x-0 border-b-0 p-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Quick Templates */}
          <div className="mb-3 flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => insertTemplate("I need advice on...")}
              className="h-7 text-xs"
            >
              <FileText className="w-3 h-3 mr-1" />
              General advice
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => insertTemplate("What are the best practices for...")}
              className="h-7 text-xs"
            >
              Best practices
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => insertTemplate("How do I get started with...")}
              className="h-7 text-xs"
            >
              Getting started
            </Button>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={`Ask ${advisor.name.split(' ')[0]} anything...`}
                disabled={isLoading}
                className="pr-12 glass-card border-border/30"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={isListening ? stopVoiceInput : startVoiceInput}
                disabled={isLoading}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4 text-red-500 animate-pulse" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputMessage.trim() || isLoading}
              className="px-6"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
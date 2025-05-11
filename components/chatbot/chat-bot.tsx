"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, X, MessageSquare, Bot, Loader2, HelpCircle, ShoppingBag, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ChatMessage } from "./chat-message"
import { useRouter } from "next/navigation"

// For message history
type Message = {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  recommendations?: ProductRecommendation[]
  priceAlternatives?: {
    cheaper: ProductRecommendation[]
    more_expensive: ProductRecommendation[]
  }
  complementaryItems?: ProductRecommendation[]
  followUpQuestions?: string[]
}

// For product recommendations
type ProductRecommendation = {
  id: string
  title: string
  description: string
  price: number
  image: string
  rating: number
  color?: string
  dimensions?: string
}

// For conversation history sent to API
type ConversationHistoryItem = {
  role: "user" | "assistant"
  content: string
}

// Suggestions for the chat
const QUICK_SUGGESTIONS = [
  "What furniture do you recommend for a small living room?",
  "I need a comfortable sofa under $800",
  "Do you have any beds for a master bedroom?",
  "Help me find a desk for my home office",
  "Show me dining tables that match with blue chairs",
];

export function ChatBot() {
  const router = useRouter();
  // Set the correct API URL
  const API_URL = "http://localhost:5000/api/v1/ai";
  
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your furniture assistant. I can help with product recommendations, styling advice, and finding items that match your preferences. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [conversationHistory, setConversationHistory] = useState<ConversationHistoryItem[]>([]);
  const [contextData, setContextData] = useState<{
    productId?: string | null
  }>({});
  
  // Track previously shown products to avoid repeating recommendations
  const [shownProductIds, setShownProductIds] = useState<string[]>([]);
  
  // Track conversation topics to improve recommendations
  const [topicHistory, setTopicHistory] = useState<string[]>([]);
  
  // Track user preferences accumulated across the conversation
  const [userPreferences, setUserPreferences] = useState<{
    category?: string | null
    priceMin?: number | null
    priceMax?: number | null
    style?: string | null
    room?: string | null
    colors?: string[] | null
  }>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Function to retrieve the user ID from localStorage
  const getUserIdFromLocalStorage = () => {
    try {
      const storedUserId = localStorage.getItem("userId") || ""
      return storedUserId
    } catch (err) {
      console.error("Error accessing localStorage:", err)
      return ""
    }
  }

  // Function to retrieve the auth token from localStorage
  const getAuthToken = () => {
    try {
      const token = localStorage.getItem("token") || ""
      return token
    } catch (err) {
      console.error("Error accessing localStorage:", err)
      return ""
    }
  }

  // Verify API connection on startup
  useEffect(() => {
    // Check if API is accessible when component mounts
    const checkApiConnection = async () => {
      try {
        console.log("Checking API connection to:", API_URL);
        const response = await fetch(`${API_URL}/status`);
        if (response.ok) {
          const data = await response.json();
          console.log("API connection successful:", data);
        } else {
          console.warn("API endpoint not accessible:", response.status);
        }
      } catch (error) {
        console.error("Error connecting to API:", error);
      }
    };

    checkApiConnection();
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // Reset context when chat is opened
  useEffect(() => {
    if (isOpen) {
      // Reset context but don't block chat functionality if it fails
      resetChatContext().catch(error => {
        console.warn("Chat context reset failed, but chat will still work:", error);
      });
    }
  }, [isOpen]);
  
  // Hide suggestions after first message is sent
  useEffect(() => {
    if (messages.length > 1) {
      setShowSuggestions(false);
    }
  }, [messages.length]);

  // Reset the chat context on the server
  const resetChatContext = async () => {
    try {
      const token = getAuthToken();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      console.log("Resetting chat context...");
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'reset' // Specify this is a reset action
        }),
        credentials: 'include',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Log error but don't throw - allows chat to work even if reset fails
        console.warn(`Failed to reset chat context: ${response.status} ${response.statusText}`);
      } else {
        console.log("Chat context reset successful");
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Reset context request timed out');
      } else {
        console.warn('Error resetting chat context:', error);
      }
      // Don't rethrow - we want the chat to work even if reset fails
    }
  };

  const handleSendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || inputValue;
    if (!messageToSend.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageToSend,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    if (!customMessage) setInputValue("");
    setIsTyping(true);

    // Update conversation history
    const updatedHistory = [
      ...conversationHistory,
      { role: "user", content: messageToSend }
    ];
    setConversationHistory(updatedHistory);

    try {
      // Get auth token
      const token = getAuthToken();
      
      console.log("Sending message to AI assistant:", messageToSend);
      console.log("API URL:", API_URL);
      
      // Call the unified assistant API with correct path
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          action: 'chat',
          message: messageToSend,
          conversationHistory: updatedHistory,
          preferences: {
            ...userPreferences, // Send accumulated preferences
            ...contextData.productId ? { relatedProductId: contextData.productId } : {},
            previousProductIds: shownProductIds // Send the products we've already shown
          }
        }),
        credentials: 'include'
      });
      
      // Handle non-OK responses better with detailed logging
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Server error (${response.status}): ${errorText}`);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Received AI response:", data);
      
      if (data.success) {
        // Update tracked preferences if we got new ones
        if (data.preferences) {
          setUserPreferences(prev => ({
            ...prev,
            ...data.preferences,
            // Merge arrays properly
            colors: [...(prev.colors || []), ...(data.preferences.colors || [])].filter((v, i, a) => a.indexOf(v) === i)
          }));
          
          // Add topic to history if we identified a category
          if (data.preferences.category && !topicHistory.includes(data.preferences.category)) {
            setTopicHistory(prev => [...prev, data.preferences.category]);
          }
        }
        
        // Track newly shown product IDs 
        if (data.products && data.products.length > 0) {
          const newProductIds = data.products.map((p: ProductRecommendation) => p.id);
          setShownProductIds(prev => [...prev, ...newProductIds]);
        }
        
        // Add bot message with all available data
        const botMessage: Message = {
          id: Date.now().toString(),
          content: data.response,
          sender: "bot",
          timestamp: new Date(),
          recommendations: data.products || [], // Map products to recommendations
          priceAlternatives: data.priceAlternatives,
          complementaryItems: data.complementaryItems,
          followUpQuestions: data.followUpQuestions || []
        };
        
        setMessages(prev => [...prev, botMessage]);
        
        // Update conversation history with assistant's response
        setConversationHistory([
          ...updatedHistory,
          { role: "assistant", content: data.response }
        ]);
        
        // Update context for future messages - store product ID if we got recommendations
        if (data.products && data.products.length > 0) {
          setContextData({
            productId: data.products[0].id
          });
        }
      } else {
        // Add error message
        const errorMessage: Message = {
          id: Date.now().toString(),
          content: data.message || "I couldn't process your request.",
          sender: "bot",
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error communicating with assistant:', error);
      
      // Add error message with more details for debugging
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: `I'm having trouble connecting to our system. Please try again later.`,
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleFollowUpClick = (question: string) => {
    handleSendMessage(question);
  };
  
  const handleProductClick = (productId: string) => {
    // Update context with the selected product ID for follow-up questions
    setContextData({
      productId: productId
    });
    
    // Navigate to the product page
    router.push(`/shop/${productId}`);
  };

  const handleReset = () => {
    // Reset all local state
    setMessages([
      {
        id: "welcome-reset",
        content: "Hello! I'm your furniture assistant. How can I help you today?",
        sender: "bot",
        timestamp: new Date(),
      }
    ]);
    setConversationHistory([]);
    setContextData({});
    setShowSuggestions(true);
    setShownProductIds([]); // Reset the product history
    setTopicHistory([]); // Reset topic history
    setUserPreferences({}); // Reset accumulated preferences
    
    // Reset server context
    resetChatContext();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <Card className="flex flex-col w-80 sm:w-96 h-[550px] shadow-lg border border-border/50 rounded-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          <div className="flex items-center justify-between p-3 border-b bg-card">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-full">
                <Bot size={16} className="text-primary" />
              </div>
              <h3 className="font-medium">Furniture Assistant</h3>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                title="Reset conversation"
                className="h-8 w-8 rounded-full hover:bg-muted"
              >
                <HelpCircle size={14} />
                <span className="sr-only">Reset</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-muted"
              >
                <X size={16} />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
            {messages.map((message) => (
              <div key={message.id} className="space-y-3">
                <ChatMessage
                  content={message.content}
                  isUser={message.sender === "user"}
                  timestamp={message.timestamp}
                />
                
                {/* Standard product recommendations */}
                {message.recommendations && message.recommendations.length > 0 && (
                  <div className="ml-10 grid grid-cols-1 gap-2 mt-2">
                    {message.recommendations.slice(0, 3).map((product) => (
                      <div 
                        key={product.id}
                        className="flex items-center p-2 rounded-lg border border-border/40 bg-card/50 hover:bg-card/80 transition-colors"
                      >
                        {product.image && (
                          <div className="w-16 h-16 rounded overflow-hidden mr-3 bg-muted/30 flex-shrink-0">
                            <img 
                              src={product.image} 
                              alt={product.title} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-furniture.png';
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{product.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-medium text-sm">${product.price}</span>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-7 px-2 text-xs gap-1"
                              onClick={() => handleProductClick(product.id)}
                            >
                              <ShoppingBag size={12} />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Price alternatives */}
                {message.priceAlternatives && (
                  <div className="ml-10 space-y-3 mt-2">
                    {/* Cheaper alternatives */}
                    {message.priceAlternatives.cheaper && message.priceAlternatives.cheaper.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1 mb-2 text-xs text-muted-foreground">
                          <TrendingDown size={14} className="text-green-500" />
                          <span>Less Expensive Options</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {message.priceAlternatives.cheaper.map((product) => (
                            <div 
                              key={product.id}
                              className="flex items-center p-2 rounded-lg border border-border/40 bg-card/50 hover:bg-card/80 transition-colors"
                            >
                              {product.image && (
                                <div className="w-16 h-16 rounded overflow-hidden mr-3 bg-muted/30 flex-shrink-0">
                                  <img 
                                    src={product.image} 
                                    alt={product.title} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/placeholder-furniture.png';
                                    }}
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">{product.title}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="font-medium text-sm text-green-600">${product.price}</span>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-7 px-2 text-xs gap-1"
                                    onClick={() => handleProductClick(product.id)}
                                  >
                                    <ShoppingBag size={12} />
                                    View
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* More expensive alternatives */}
                    {message.priceAlternatives.more_expensive && message.priceAlternatives.more_expensive.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1 mb-2 text-xs text-muted-foreground">
                          <TrendingUp size={14} className="text-blue-500" />
                          <span>Premium Options</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {message.priceAlternatives.more_expensive.map((product) => (
                            <div 
                              key={product.id}
                              className="flex items-center p-2 rounded-lg border border-border/40 bg-card/50 hover:bg-card/80 transition-colors"
                            >
                              {product.image && (
                                <div className="w-16 h-16 rounded overflow-hidden mr-3 bg-muted/30 flex-shrink-0">
                                  <img 
                                    src={product.image} 
                                    alt={product.title} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/placeholder-furniture.png';
                                    }}
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">{product.title}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="font-medium text-sm text-blue-600">${product.price}</span>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-7 px-2 text-xs gap-1"
                                    onClick={() => handleProductClick(product.id)}
                                  >
                                    <ShoppingBag size={12} />
                                    View
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Follow-up questions */}
                {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                  <div className="ml-10 flex flex-wrap gap-2 mt-1">
                    {message.followUpQuestions.map((question) => (
                      <button
                        key={question}
                        onClick={() => handleFollowUpClick(question)}
                        className="px-3 py-1.5 bg-secondary/10 hover:bg-secondary/20 text-xs rounded-full text-secondary-foreground transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary/10 shrink-0">
                  <Bot size={14} />
                </div>
                <div className="bg-card border border-border/30 text-card-foreground rounded-lg p-3">
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-current animate-pulse delay-150" />
                    <div className="w-2 h-2 rounded-full bg-current animate-pulse delay-300" />
                  </div>
                </div>
              </div>
            )}
            
            {showSuggestions && messages.length === 1 && (
              <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <HelpCircle size={12} />
                  <span>Try asking about:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_SUGGESTIONS.slice(0, 3).map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1.5 bg-muted/50 hover:bg-muted text-xs rounded-full text-muted-foreground transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t bg-card flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about furniture or design..."
              className="flex-1 bg-background/50"
            />
            <Button 
              onClick={() => handleSendMessage()} 
              size="icon" 
              disabled={!inputValue.trim() || isTyping}
              className="rounded-full h-9 w-9 shrink-0"
            >
              {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </Card>
      ) : (
        <Button 
          onClick={() => setIsOpen(true)} 
          className="h-12 px-4 gap-2 rounded-full shadow-lg animate-in slide-in-from-bottom-5 duration-300"
        >
          <MessageSquare size={18} />
          <span>Chat with us</span>
        </Button>
      )}
    </div>
  );
}
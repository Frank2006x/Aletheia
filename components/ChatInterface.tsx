"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import ChartRenderer from "./ChartRenderer";
import type { ChatMessage, AgentResponse } from "@/types";
import { Sparkles, Bot, Send } from "lucide-react";

interface ChatInterfaceProps {
  pdfUploadId: string;
  threadId: string;
}

export default function ChatInterface({
  pdfUploadId,
  threadId,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          pdfUploadId,
          threadId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data: AgentResponse = await response.json();

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.message,
        chartConfig: data.chartConfig,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Failed to get response"}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#050505]">
      <Card className="flex-1 flex flex-col overflow-hidden border-0 bg-transparent rounded-none">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/[0.08] bg-black/40 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-white">
              AI Analysis <span className="text-primary">Assistant</span>
            </h3>
          </div>
          <p className="text-xs text-white/40 mt-0.5 pl-6">Ask anything about your report</p>
        </div>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {messages.length === 0 && (
            <div className="text-center mt-12 px-4">
              {/* AI Icon */}
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <p className="text-white/70 font-medium">Ask me anything about the PDF</p>
              <p className="text-white/30 text-xs mt-2 leading-relaxed">
                Try: &quot;What are the key metrics?&quot; or &quot;Create a chart of emissions data&quot;
              </p>
              {/* Quick suggestions */}
              <div className="mt-6 flex flex-col gap-2">
                {["Summarize key ESG metrics", "Show emission trends", "What are the top risks?"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="w-full text-left px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 text-xs hover:bg-white/[0.07] hover:text-white/80 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === "user"
                  ? "bg-primary/20 border border-primary/30 text-white rounded-br-sm"
                  : "bg-white/[0.05] border border-white/[0.08] text-white/85 rounded-bl-sm"
                  }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                {message.chartConfig && (
                  <div className="mt-4">
                    <ChartRenderer config={message.chartConfig} />
                  </div>
                )}
                <p className="text-xs opacity-40 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-primary/70 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        <div className="border-t border-white/[0.08] p-3 bg-black/30 flex-shrink-0">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about the report..."
              disabled={loading}
              className="flex-1 bg-white/[0.05] border-white/[0.12] text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-primary/20 rounded-xl text-sm"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="bg-primary hover:bg-primary/90 text-black font-semibold rounded-xl px-4 disabled:opacity-40 transition-all"
            >
              {loading ? <Sparkles className="w-4 h-4 animate-pulse" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

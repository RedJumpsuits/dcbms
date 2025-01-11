"use client";

import { useState } from "react";
import { MessageSquareWarning, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import TypingAnimation from "@/components/ui/typing-animation";

export default function ChatWindow() {
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsTyping(true);
    const result = fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: input }),
    });
    setMessage(input);
    setInput("");
    const { answer } = await (await result).json();

    console.log(answer);

    setMessages([
      ...messages,
      { id: messages.length, role: "user", content: input },
      { id: messages.length + 1, role: "bot", content: answer },
    ]);
    setIsTyping(false);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`inline-block p-2 rounded-lg ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {message.role === "bot" ? (
                <TypingAnimation className={"text-sm"} duration={50}>
                  {message.content}
                </TypingAnimation>
              ) : (
                message.content
              )}
            </span>
          </div>
        ))}
        {isTyping && (
          <div>
            <div className={"mb-4 text-right"}>
              <span
                className={
                  "inline-block p-2 rounded-lg bg-primary text-primary-foreground"
                }
              >
                {message}
              </span>
            </div>
            <div className="text-left">
              <span className="inline-block p-2 rounded-lg bg-muted">
                <LoadingAnimation />
              </span>
            </div>
          </div>
        )}
      </ScrollArea>
      <form onSubmit={onSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow"
          />
          <Button type="submit" size="icon" disabled={isTyping}>
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

function LoadingAnimation() {
  return (
    <div className="flex space-x-1">
      <div
        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
        style={{ animationDelay: "0ms" }}
      />
      <div
        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
        style={{ animationDelay: "150ms" }}
      />
      <div
        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}

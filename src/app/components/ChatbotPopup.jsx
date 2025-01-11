'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import ChatWindow from './ChatWindow'

export default function ChatbotPopup() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-4 right-4">
      {isOpen ? (
        <Card className="flex flex-col w-[50vh]">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">Chatbot</h2>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
          <ChatWindow />
        </Card>
      ) : (
        <Button onClick={() => setIsOpen(true)}>Open Chatbot</Button>
      )}
    </div>
  )
}


import { createDataStreamResponse } from "ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  // return Response.redirect("https://chatbot-5qed.onrender.com/chat");
  const { query } = await req.json();
  console.log(query);
  const result = await fetch("https://chatbot-5qed.onrender.com/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  const { answer } = await result.json();
  console.log(answer);
  return Response.json({ answer });
}

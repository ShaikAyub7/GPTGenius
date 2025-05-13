"use server";

import { ClerkFailed } from "@clerk/nextjs";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

const response = await ai.models.generateContentStream({
  model: "gemini-2.0-flash",
  contents: "hello?",
});

const countTokensResponse = await ai.models.countTokens({
  model: "gemini-2.0-flash",
  contents: "hello?",
});
console.log(countTokensResponse.totalTokens);

export const generateChatResponse = async (
  chatMessage: { role: string; content: string }[]
) => {
  const chat = ai.chats.create({
    model: "gemini-2.0-flash",
    history: [
      {
        role: "user",
        parts: [{ text: chatMessage.join(" ") }],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
      },
    ],
  });
  const result = await chat.sendMessage({
    message: chatMessage[chatMessage.length - 1].content,
  });

  const history = chat.getHistory();
  const messages = [];
  for (const message of history) {
    messages.push(message);
    console.log(message);
  }

  return result.text;
};

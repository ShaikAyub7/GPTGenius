"use server";

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
console.log("Tokens used:", countTokensResponse.totalTokens);

export const generateChatResponse = async (
  chatMessages: { role: string; content: string }[]
) => {
  try {
    const history = chatMessages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const chat = ai.chats.create({
      model: "gemini-2.0-flash",
      history,
    });

    const latestMessage = chatMessages[chatMessages.length - 1].content;

    const result = await chat.sendMessage({
      message: latestMessage,
    });

    const updatedHistory = chat.getHistory();
    updatedHistory.forEach((msg) => console.log(msg));

    return result.text;
  } catch (error) {
    console.error("Gemini chat error:", error);
    return "Something went wrong.";
  }
};

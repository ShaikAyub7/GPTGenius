"use client";

import { generateChatResponse, saveChat } from "@/utils/actions";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import toast from "react-hot-toast";
import ChatContent from "./ChatContent";
import Form from "./Form";

export type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
};

type ChatProps = {
  initialMessages: Message[];
};

const Chat = ({ initialMessages }: ChatProps) => {
  const [text, setText] = useState("");

  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const { mutate, isPending } = useMutation({
    mutationFn: async (userMessage: Message) => {
      // IMPORTANT:
      // Use the latest messages + current user message
      // for Gemini, but don't modify React state here.
      const chatMessages = [...messages, userMessage];

      const response = await generateChatResponse(chatMessages);

      if (!response) {
        throw new Error("No response from Gemini");
      }

      return response;
    },

    onSuccess: async (response, userMessage) => {
      // Add assistant response ONLY ONCE
      const assistantMessage: Message = {
        role: "assistant",
        content: response,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Save assistant response to database
      try {
        await saveChat("assistant", response);
      } catch (error) {
        console.error("Failed to save assistant message:", error);
      }
    },

    onError: (error) => {
      console.error("Chat error:", error);
      toast.error(error.message || "Something went wrong.");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isPending) return;

    const trimmedText = text.trim();

    if (!trimmedText) return;

    const userMessage: Message = {
      role: "user",
      content: trimmedText,
    };

    // Add user message ONLY ONCE
    setMessages((prev) => [...prev, userMessage]);

    // Save user message
    saveChat("user", trimmedText).catch((error) => {
      console.error("Failed to save user message:", error);
    });

    // Send to Gemini
    mutate(userMessage);

    // Clear input
    setText("");
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] grid grid-rows-[auto_1fr_auto]">
      <h3 className="font-bold text-center text-2xl tracking-wider">
        Welcome to GPTGenius
        <span className="text-[10px] ml-1 text-base-400">V.0.1</span>
      </h3>

      <ChatContent
        isPending={isPending}
        message={messages}
      />

      <Form
        handleSubmit={handleSubmit}
        isPending={isPending}
        text={text}
        setText={setText}
      />
    </div>
  );
};

export default Chat;
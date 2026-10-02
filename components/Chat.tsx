"use client";

import { generateChatResponse, saveChat } from "@/utils/actions";

import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import toast from "react-hot-toast";

import ChatContent from "./ChatContent";
import Form from "./Form";

type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
};

type ChatProps = {
  initialMessages: Message[];
};

const Chat = ({ initialMessages }: ChatProps) => {
  const [text, setText] = useState("");

  const [message, setMessage] = useState<Message[]>(initialMessages);

  const { mutate, isPending } = useMutation({
    mutationFn: async (query: Message) => {
      // Add user message to UI immediately
      const chatMessages = [...message, query];

      // Generate Gemini response
      const response = await generateChatResponse(chatMessages);

      if (!response) {
        throw new Error("No response from Gemini");
      }

      return {
        userMessage: query,
        assistantMessage: response,
      };
    },

    onSuccess: async ({ userMessage, assistantMessage }) => {
      try {
        // Save user message
        const savedUser = await saveChat("user", userMessage.content);

        // Save assistant message
        const savedAssistant = await saveChat("assistant", assistantMessage);

        // Update UI with database IDs
        setMessage((prev) => [
          ...prev,
          {
            id: savedUser.id,
            role: "user",
            content: savedUser.content,
          },
          {
            id: savedAssistant.id,
            role: "assistant",
            content: savedAssistant.content,
          },
        ]);

        setText("");
      } catch (error) {
        console.error("Error saving chat:", error);
        toast.error("Response generated, but failed to save chat.");
      }
    },

    onError: (error) => {
      console.error(error);
      toast.error(error.message || "Something went wrong.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isPending) return;

    const trimmedText = text.trim();

    if (!trimmedText) return;

    const userMessage: Message = {
      role: "user",
      content: trimmedText,
    };

    // Show user message immediately
    setMessage((prev) => [...prev, userMessage]);

    // Generate response
    mutate(userMessage);

    setText("");
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] grid grid-rows-[1fr_auto]">
      <h3 className="font-bold text-center text-2xl tracking-wider">
        Welcome to GPTGenius
        <span className="text-[10px] ml-1 text-base-400">V.0.1</span>
      </h3>

      <ChatContent isPending={isPending} message={message} />

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

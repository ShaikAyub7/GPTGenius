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
  const [text, setText] = useState<string>("");

  // Load previous messages from database
  const [message, setMessage] = useState<Message[]>(initialMessages);

  const { mutate, isPending } = useMutation({
    mutationFn: async (query: Message): Promise<string> => {
      try {
        // Include the new user message when sending history to Gemini
        const chatMessage = [...message, query];

        const response = await generateChatResponse(chatMessage);

        return response || "No response";
      } catch (error) {
        console.error("Error processing the mutation:", error);

        throw new Error("An error occurred while processing your message.");
      }
    },

    onSuccess: async (data) => {
      if (!data) {
        toast.error("Something went wrong");
        return;
      }

      // Add assistant response to UI
      setMessage((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data,
        },
      ]);

      // Save assistant response to database
      try {
        await saveChat("assistant", data);
      } catch (error) {
        console.error("Failed to save assistant message:", error);

        toast.error("Response generated but wasn't saved.");
      }
    },

    onError(error) {
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

    // Immediately show user message
    setMessage((prev) => [...prev, userMessage]);

    // Save user message to database
    try {
      await saveChat("user", trimmedText);
    } catch (error) {
      console.error("Failed to save user message:", error);

      toast.error("Message couldn't be saved.");
    }

    // Send message to Gemini
    mutate(userMessage);

    // Clear input
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

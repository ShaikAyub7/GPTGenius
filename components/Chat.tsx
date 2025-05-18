"use client";
import { generateChatResponse, getAllChats } from "@/utils/actions";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import toast from "react-hot-toast";
import ChatContent from "./ChatContent";
import Form from "./Form";

const Chat = () => {
  const [text, setText] = useState<string>("");
  const [message, setMessage] = useState<{ role: string; content: string }[]>(
    []
  );

  const { mutate, isPending } = useMutation({
    mutationFn: async (query: {
      role: string;
      content: string;
    }): Promise<string> => {
      try {
        const chatMessage = [...message, query];

        const response = await generateChatResponse(chatMessage);

        return response || "no response";
      } catch (error) {
        console.error("Error processing the mutation:", error);
        throw new Error("An error occurred while processing your message.");
      }
    },

    onSuccess(data) {
      if (!data) {
        toast.error("Something went wrong");
        return;
      }
      setMessage((prev) => [...prev, { role: "assistant", content: data }]);
    },

    onError(error) {
      toast.error(error.message || "Something went wrong.");
    },
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    const userMessage = { role: "user" as const, content: text };
    setMessage((prev) => [...prev, userMessage]);
    mutate(userMessage);
    setText("");
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] grid grid-rows-[1fr_auto ] ">
      <h3 className="font-bold text-center text-2xl  tracking-wider">
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

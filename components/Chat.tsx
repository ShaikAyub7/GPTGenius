"use client";
import { generateChatResponse } from "@/utils/actions";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import toast from "react-hot-toast";
import ChatContent from "./ChatContent";

const Chat = ({ token }: { token: number }) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    const query = { role: "user", content: text };
    setMessage((prev) => [...prev, query]);
    mutate(query);
    setText("");
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] grid grid-rows-[1fr_auto ]">
      <h3 className="font-bold text-center text-2xl leading-3.5 tracking-wider">
        Welcome to GPTGenius
        <span className="text-[8px] ml-1 text-base-400">V.0.1</span>
        {/* <p>{token}</p> */}
      </h3>
      <ChatContent isPending={isPending} message={message} />
      <form
        onSubmit={handleSubmit}
        className="fixed bottom-6 w-full max-w-lg lg:max-w-4xl pt-12  md:max-w-xl"
      >
        <div className="join w-full">
          <input
            type="text"
            placeholder="Message GeniusGpt"
            className="input input-bordered join-item w-full"
            value={text}
            required
            onChange={(e) => setText(e.target.value)}
          />
          <button
            className="btn btn-primary p-4 rounded-br-lg rounded-tr-lg join-item "
            disabled={isPending}
          >
            {isPending ? "please wait..." : "Ask Question"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;

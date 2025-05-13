"use client";
import { useUser } from "@clerk/nextjs";
import { generateChatResponse } from "@/utils/actions";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { SiOpenaigym } from "react-icons/si";

const Chat = () => {
  const { user } = useUser();
  const [text, setText] = useState("");
  const [message, setMessage] = useState<{ role: string; content: string }[]>(
    []
  );

  const { mutate, isPending } = useMutation({
    mutationFn: async (query: {
      role: string;
      content: string;
    }): Promise<string> => {
      const chatMessage = [...message, query];
      const response = await generateChatResponse(chatMessage);
      return response || "no response";
    },

    onSuccess(data, variables) {
      if (!data) {
        toast.error("Something went wrong");
        return;
      }
      setMessage((prev) => [...prev, { role: "assistant", content: data }]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = { role: "user", content: text };
    mutate(query);
    setMessage((prev) => [...prev, query]);
    setText("");
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] grid grid-rows-[1fr_auto]">
      <h3 className="font-bold text-center text-2xl leading-3.5 tracking-wider">
        Welcome to GPTGenius
        <span className="text-[8px] ml-1 text-base-400">V.0.1</span>
      </h3>

      <div className="mb-7">
        {message.map(({ role, content }, index) => {
          const avatar =
            role === "user" ? (
              user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt="User Avatar"
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <span className="text-xl">👤</span>
              )
            ) : (
              <SiOpenaigym className="w-6 h-6 text-primary" />
            );

          const bcg = role === "user" ? "bg-base-200" : "bg-base-100";

          return (
            <div
              key={index}
              className={`${bcg} flex py-4 -mx-8 px-8 text-lg leading-loose border-b border-base-300 items-center`}
            >
              <span className="mr-4">{avatar}</span>
              <p className="max-w-3xl">{content}</p>
            </div>
          );
        })}

        {isPending ? <span className="loading loading-dots"></span> : null}
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl pt-12 fixed bottom-6 w-full"
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
            className="btn btn-primary p-4 rounded-br-lg rounded-tr-lg join-item"
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

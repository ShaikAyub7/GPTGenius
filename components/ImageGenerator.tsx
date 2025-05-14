"use client";

import { generateImage } from "@/utils/actions";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { SiOpenaigym } from "react-icons/si";
import { useUser } from "@clerk/nextjs";

type ChatMessage = {
  role: "user" | "assistant";
  type: "text" | "image";
  content: string;
};

const ImageGenerator = () => {
  const { user } = useUser();
  const [text, setText] = useState<string>("");
  const [message, setMessage] = useState<ChatMessage[]>([]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (query: ChatMessage): Promise<ChatMessage> => {
      try {
        const chatMessages = [...message, query].map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        const response = await generateImage(chatMessages);

        if (!response) {
          throw new Error("No response");
        }

        const isImage = response.startsWith("data:image");
        return {
          role: "assistant",
          type: isImage ? "image" : "text",
          content: response,
        };
      } catch (error) {
        console.error("Error processing the mutation:", error);
        throw new Error("An error occurred while processing your message.");
      }
    },

    onSuccess(data) {
      setMessage((prev) => [...prev, data]);
    },

    onError(error) {
      toast.error(error.message || "Something went wrong.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending || !text.trim()) return;

    const query: ChatMessage = {
      role: "user",
      type: "text",
      content: text.trim(),
    };

    setMessage((prev) => [...prev, query]);
    mutate(query);
    setText("");
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] grid grid-rows-[1fr_auto]">
      <h3 className="font-bold text-center text-2xl mt-6 tracking-wider">
        Welcome to GPTGenius Image Generator
        <span className="text-[10px] ml-1 text-base-400">V.0.1</span>
      </h3>

      <div className="px-4 pt-8 pb-28 overflow-y-auto">
        {message.map((msg, idx) => {
          const avatar =
            msg.role === "user" ? (
              <span className="text-xl">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    className="w-7 h-7 rounded-full mt-2 absolute right-4  text-right"
                    alt="User avatar"
                  />
                ) : (
                  "👤"
                )}
              </span>
            ) : (
              <SiOpenaigym className="w-6 h-6 text-primary mt-2 " />
            );

          return (
            <div
              key={idx}
              className={`my-2 p-2 rounded-xl max-w-sm  py-4  text-lg leading-loose border-b border-base-300 ${
                msg.role === "user"
                  ? "ml-auto bg-base-200 text-right  "
                  : "mr-auto bg-base-100 text-left"
              }`}
            >
              <span>{avatar}</span>

              {msg.type === "image" ? (
                <img
                  src={msg.content}
                  alt="Generated"
                  className="max-w-full rounded-md mt-3"
                />
              ) : (
                <p className="bg-base-100 shadow-lg rounded-xl p-2 pl-4 w-auto ">
                  {msg.content}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl fixed bottom-6 w-full px-4"
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

export default ImageGenerator;

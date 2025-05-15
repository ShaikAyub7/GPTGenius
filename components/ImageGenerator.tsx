"use client";

import { generateImage } from "@/utils/actions";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { SiOpenaigym } from "react-icons/si";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { IoMdDownload } from "react-icons/io";

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

  if (isPending) {
    <p className="absolute top-3.5 left-45 right-45">
      Generating image <span className="loading loading-dots"></span>
    </p>;
  }
  return (
    <div className="min-h-[calc(100vh-6rem)] grid grid-rows-[1fr_auto]">
      <h3 className="font-bold text-center text-2xl mt-6 tracking-wider">
        Welcome to GPTGenius Image Generator
        <span className="text-[10px] ml-1 text-base-400">V.0.1</span>
      </h3>
      {isPending && (
        <p className="fixed top-8 left-1/2 transform -translate-x-1/2 p-4 text-sm text-gray-400 bg-base-100 shadow-2xl rounded-2xl z-40">
          Generating image <span className="loading loading-dots"></span>
        </p>
      )}

      <div className="px-4 pt-8 pb-28 overflow-y-auto">
        {message.map((msg, idx) => {
          const avatar =
            msg.role === "user" ? (
              <span className="text-xl flex">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    className="w-7 h-7 rounded-full mt-2 absolute right-4 top-7  text-right"
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
              className={`my-2 p-2 rounded-xl   py-4  text-lg leading-loose border-b border-base-300 relative ${
                msg.role === "user"
                  ? "ml-auto bg-base-200 text-left max-w-[300px] w-auto overflow-hidden "
                  : "mr-auto bg-base-100 text-left max-w-sm"
              }`}
            >
              <span>{avatar}</span>

              <a
                href={msg.content}
                target="_blank"
                rel="noopener noreferrer"
                className=" mt-2 flex flex-col"
              >
                {msg.type === "image" ? (
                  <>
                    <a
                      href={msg.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      download="image.png"
                      className="absolute top-3 right-0 p-3 "
                    >
                      <IoMdDownload />
                    </a>
                    <img
                      src={msg.content}
                      alt="Generated content"
                      className="max-w-full rounded-md mt-3"
                      loading="lazy"
                    />
                  </>
                ) : (
                  <div className="bg-base-100 shadow-lg rounded-xl p-2 pl-4 w-auto ">
                    {msg.content}
                  </div>
                )}
              </a>
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
            {isPending ? "please wait..." : "Generate image"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ImageGenerator;

import Chat from "@/components/Chat";
import React from "react";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getAllChats, getTokens } from "@/utils/actions";

type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
};

const ChatsPage = async () => {
  const queryClient = new QueryClient();

  const tokens = await getTokens();

  if (!tokens) {
    return <p>no token</p>;
  }

  const chats = await getAllChats();

  // Convert Prisma's `role: string` into the exact type
  // required by the Chat component.
  const initialMessages: Message[] = chats
    .filter((chat) => chat.role === "user" || chat.role === "assistant")
    .map((chat) => ({
      id: chat.id,
      role: chat.role as "user" | "assistant",
      content: chat.content,
    }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Chat initialMessages={initialMessages} />
    </HydrationBoundary>
  );
};

export default ChatsPage;

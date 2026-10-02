import Chat from "@/components/Chat";
import React from "react";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getTokens, getAllChats } from "@/utils/actions";

const ChatsPage = async () => {
  const queryClient = new QueryClient();

  const tokens = await getTokens();

  if (!tokens) {
    return <p>no token</p>;
  }

  const chats = await getAllChats();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Chat initialMessages={chats} />
    </HydrationBoundary>
  );
};

export default ChatsPage;

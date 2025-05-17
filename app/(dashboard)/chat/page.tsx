import Chat from "@/components/Chat";
import React from "react";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getTokens } from "@/utils/actions";

const ChatsPage = async () => {
  const queryClient = new QueryClient({});
  const tokens = await getTokens();
  if (!tokens) {
    return <p>no token</p>;
  }
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Chat />
    </HydrationBoundary>
  );
};

export default ChatsPage;

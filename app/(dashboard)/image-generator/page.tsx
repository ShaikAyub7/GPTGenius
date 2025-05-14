import Chat from "@/components/Chat";
import React from "react";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import ImageGenerator from "@/components/ImageGenerator";
import { generateTourImages } from "@/utils/actions";

const ImageGeneratorPage = async () => {
  const queryClient = new QueryClient({});

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ImageGenerator />
    </HydrationBoundary>
  );
};

export default ImageGeneratorPage;

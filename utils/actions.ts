"use server";

import { GoogleGenAI, Modality, Content } from "@google/genai";

import prisma from "./db";
import { Tour } from "@/components/TourInfo";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

export const getTokens = async () => {
  const response = await ai.models.countTokens({
    model: "gemini-2.0-flash",
    contents: "hello?",
  });

  return response.totalTokens;
};

export const generateChatResponse = async (
  chatMessages: { role: string; content: string }[]
) => {
  try {
    const history = chatMessages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const chat = ai.chats.create({
      model: "gemini-2.0-flash",
      config: {
        temperature: 0,
        maxOutputTokens: 100,
      },
      history,
    });

    const latestMessage = chatMessages[chatMessages.length - 1].content;

    const result = await chat.sendMessage({
      message: latestMessage,
    });

    const updatedHistory = chat.getHistory();
    updatedHistory.forEach((msg) => console.log(msg));

    return result.text;
  } catch (error) {
    console.error("Gemini chat error:", error);
    return "Something went wrong.";
  }
};

export const generateTourResponse = async ({
  city,
  country,
}: {
  city: string;
  country: string;
}) => {
  try {
    const query = `Find a ${city} in this ${country}.
If ${city} in this ${country} exists, create a list of things families can do in this ${city},${country}. 
Once you have a list, create a one-day tour. Response should be in the following JSON format: 
{
  "tour": {
    "city": "${city}",
    "country": "${country}",
    "title": "title of the tour",
    "description": "description of the city and tour",
    "stops": ["short name ", "short name", "short name"]
  }
}
If you can't find info on exact ${city}, or ${city} does not exist, or its population is less than 1, or it is not located in the following ${country}, return { "tour": null }, with no additional characters.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      config: {
        temperature: 0,
      },
      contents: [
        {
          role: "user",
          parts: [{ text: query }],
        },
      ],
    });

    let text = response?.text?.trim();
    if (!text) return null;

    text = text.replace(/^```(?:json)?\s*|\s*```$/g, "");

    const tourData = JSON.parse(text);
    return tourData.tour;
  } catch (error) {
    console.error("Tour generation failed:", error);
    return null;
  }
};

export const getExistingTour = async ({
  city,
  country,
}: {
  city: string;
  country: string;
}) => {
  return prisma.tour.findUnique({
    where: {
      country_city: { city, country },
    },
  });
};
export const createNewTour = async (tour: Tour) => {
  return prisma.tour.create({
    data: tour,
  });
};

export const getAllTours = async (searchTerm: string) => {
  if (!searchTerm) {
    const tours = await prisma.tour.findMany({
      orderBy: {
        city: "asc",
      },
    });
    return tours;
  }
  const tours = await prisma.tour.findMany({
    where: {
      OR: [
        {
          city: {
            contains: searchTerm,
          },
          country: {
            contains: searchTerm,
          },
        },
      ],
    },
  });
  return tours;
};

export const getSingleTour = async (id: string) => {
  return prisma.tour.findUnique({
    where: {
      id,
    },
  });
};

export const generateTourImages = async ({
  city,
  country,
}: {
  city: string;
  country: string;
}) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: `a panoramic view of the ${city} ${country}`,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });
    const imagePart = response?.candidates?.[0]?.content?.parts?.find((part) =>
      part.inlineData?.mimeType?.startsWith("image/")
    );

    if (imagePart?.inlineData?.data) {
      const base64 = imagePart.inlineData.data;
      const mimeType = imagePart.inlineData.mimeType || "image/png"; // Fallback if missing
      const imageUrl = `data:${mimeType};base64,${base64}`;
      return imageUrl;
    }
  } catch (error) {
    console.log(error);
  }
};

export const fetchUserId = async (clerkId: string) => {
  const result = await prisma.token.findUnique({
    where: {
      clerkId,
    },
  });
  return result?.tokens;
};
export const generateUserTokensForId = async (clerkId: string) => {
  const result = await prisma.token.create({
    data: {
      clerkId,
    },
  });
  return result?.tokens;
};

export const fetchOrGenerateTokens = async (clerkId: string) => {
  const result = await fetchUserId(clerkId);
  if (result) {
    return result;
  }
  return await generateUserTokensForId(clerkId);
};

const MAX_MESSAGES = 3;
const MAX_CHAR_PER_MESSAGE = 1000;

export const generateImage = async (
  chatMessages: { role: string; content: string }[]
) => {
  const formattedMessages: Content[] = chatMessages
    .filter((msg) => msg.role === "user" || msg.role === "model")
    .slice(-MAX_MESSAGES)
    .map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content.slice(0, MAX_CHAR_PER_MESSAGE) }],
    }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: formattedMessages,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    const imagePart = response?.candidates?.[0]?.content?.parts?.find((part) =>
      part.inlineData?.mimeType?.startsWith("image/")
    );

    if (imagePart?.inlineData?.data) {
      const base64 = imagePart.inlineData.data;
      const mimeType = imagePart.inlineData.mimeType || "image/png";
      const imageUrl = `data:${mimeType};base64,${base64}`;
      return imageUrl;
    }
  } catch (error: any) {
    console.error("Image generation error:", error);
    if (error.statusCode === 429) {
      return "Rate limit exceeded. Please wait a moment and try again.";
    }
    if (error.statusCode === 400) {
      return "Invalid input format sent to Gemini. Check message roles.";
    }
    if (error.statusCode === 413) {
      return "Request too large. Try simplifying your input.";
    }
    return "Something went wrong during image generation.";
  }

  return null;
};

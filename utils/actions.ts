
"use server";

import { GoogleGenAI, Modality, Content } from "@google/genai";
import { auth } from "@clerk/nextjs/server";
import prisma from "./db";
import { Tour } from "@/components/TourInfo";

// ============================================================
// GEMINI SETUP
// ============================================================

const GEMINI_API_KEY = process.env.GEMINI_KEY;

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_KEY is not configured in .env.local");
}

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

// Stable Gemini text model
const CHAT_MODEL = "gemini-3.5-flash";

// ============================================================
// HELPER: SLEEP
// ============================================================

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================
// HELPER: GET ERROR STATUS
// ============================================================

const getErrorStatus = (error: any): number | undefined => {
  return (
    error?.status ??
    error?.statusCode ??
    error?.cause?.status ??
    error?.cause?.statusCode
  );
};

// ============================================================
// HELPER: RETRY GEMINI REQUEST
// ============================================================

async function withGeminiRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Gemini request attempt ${attempt + 1}/${maxRetries}`);

      return await operation();
    } catch (error: any) {
      lastError = error;

      const status = getErrorStatus(error);

      console.error(
        `Gemini request failed. Attempt ${attempt + 1}. Status:`,
        status
      );

      // Retry only temporary errors.
      // 503 = Service Unavailable / high demand
      // 429 = Rate limit
      if (status !== 503 && status !== 429) {
        throw error;
      }

      // No retry after the final attempt
      if (attempt === maxRetries - 1) {
        break;
      }

      // Exponential backoff:
      // attempt 1 -> 2 seconds
      // attempt 2 -> 4 seconds
      const delay = 2000 * Math.pow(2, attempt);

      console.log(`Retrying Gemini in ${delay / 1000} seconds...`);

      await sleep(delay);
    }
  }

  throw lastError;
}

// ============================================================
// GET TOKENS
// ============================================================

export const getTokens = async () => {
  try {
    const response = await withGeminiRetry(() =>
      ai.models.countTokens({
        model: CHAT_MODEL,
        contents: "hello?",
      })
    );

    return response.totalTokens;
  } catch (error) {
    console.error("Gemini token count error:", error);

    return 0;
  }
};

// ============================================================
// GENERATE CHAT RESPONSE
// ============================================================

export const generateChatResponse = async (
  chatMessages: { role: string; content: string }[]
) => {
  try {
    if (!chatMessages || chatMessages.length === 0) {
      return "Please enter a message.";
    }

    // --------------------------------------------------------
    // Get the latest message
    // --------------------------------------------------------

    const latestMessage = chatMessages[chatMessages.length - 1].content;

    if (!latestMessage?.trim()) {
      return "Please enter a message.";
    }

    // --------------------------------------------------------
    // IMPORTANT:
    // Don't include the latest user message in history because
    // we are sending it separately using chat.sendMessage().
    // --------------------------------------------------------

    const previousMessages = chatMessages.slice(0, -1);

    const history = previousMessages
      .filter(
        (msg) =>
          (msg.role === "user" || msg.role === "assistant") &&
          msg.content?.trim()
      )
      .map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

    // --------------------------------------------------------
    // Create Gemini chat
    // --------------------------------------------------------

    const chat = ai.chats.create({
      model: CHAT_MODEL,

      config: {
        // Keep your original temperature
        temperature: 0,
      },

      history,
    });

    // --------------------------------------------------------
    // Send message with automatic retry
    // --------------------------------------------------------

    const result = await withGeminiRetry(() =>
      chat.sendMessage({
        message: latestMessage,
      })
    );

    const responseText = result?.text?.trim();

    if (!responseText) {
      return "Gemini returned an empty response. Please try again.";
    }

    return responseText;
  } catch (error: any) {
    const status = getErrorStatus(error);

    console.error("Gemini chat error:", error);

    // --------------------------------------------------------
    // Friendly errors
    // --------------------------------------------------------

    if (status === 503) {
      return "Gemini is currently experiencing high demand. Please try again in a few seconds.";
    }

    if (status === 429) {
      return "Gemini rate limit reached. Please wait a moment and try again.";
    }

    if (status === 400) {
      return "Gemini rejected the request. Please check your message and try again.";
    }

    if (status === 401 || status === 403) {
      return "Gemini API authentication failed. Please check your GEMINI_KEY.";
    }

    return "Something went wrong while generating the response. Please try again.";
  }
};

// ============================================================
// GENERATE TOUR RESPONSE
// ============================================================

export const generateTourResponse = async ({
  city,
  country,
}: {
  city: string;
  country: string;
}) => {
  try {
    const query = `Find a ${city} in this ${country}.

If ${city} in this ${country} exists, create a list of things families can do in this ${city}, ${country}.

Once you have a list, create a one-day tour.

Response should be in the following JSON format:

{
  "tour": {
    "city": "${city}",
    "country": "${country}",
    "title": "title of the tour",
    "description": "description of the city and tour",
    "stops": ["short name", "short name", "short name"]
  }
}

If you can't find info on exact ${city}, or ${city} does not exist, or its population is less than 1, or it is not located in the following ${country}, return:

{ "tour": null }

Return only valid JSON with no additional characters.`;

    const response = await withGeminiRetry(() =>
      ai.models.generateContent({
        model: CHAT_MODEL,

        contents: [
          {
            role: "user",
            parts: [{ text: query }],
          },
        ],
      })
    );

    let text = response?.text?.trim();

    if (!text) {
      return null;
    }

    // Remove Markdown JSON fences if Gemini adds them
    text = text.replace(/^```(?:json)?\s*/i, "");
    text = text.replace(/\s*```$/i, "");

    const tourData = JSON.parse(text);

    return tourData?.tour ?? null;
  } catch (error) {
    console.error("Tour generation failed:", error);

    return null;
  }
};

// ============================================================
// GET EXISTING TOUR
// ============================================================

export const getExistingTour = async ({
  city,
  country,
}: {
  city: string;
  country: string;
}) => {
  return prisma.tour.findUnique({
    where: {
      country_city: {
        city,
        country,
      },
    },
  });
};

// ============================================================
// CREATE NEW TOUR
// ============================================================

export const createNewTour = async (tour: Tour) => {
  return prisma.tour.create({
    data: tour,
  });
};

// ============================================================
// GET ALL TOURS
// ============================================================

export const getAllTours = async (searchTerm: string) => {
  if (!searchTerm) {
    return prisma.tour.findMany({
      orderBy: {
        city: "asc",
      },
    });
  }

  return prisma.tour.findMany({
    where: {
      OR: [
        {
          city: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          country: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      ],
    },
    orderBy: {
      city: "asc",
    },
  });
};

// ============================================================
// GET SINGLE TOUR
// ============================================================

export const getSingleTour = async (id: string) => {
  return prisma.tour.findUnique({
    where: {
      id,
    },
  });
};

// ============================================================
// GENERATE TOUR IMAGE
// ============================================================

export const generateTourImages = async ({
  city,
  country,
}: {
  city: string;
  country: string;
}) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image",

      contents: `A panoramic view of ${city}, ${country}`,

      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    const imagePart = response?.candidates?.[0]?.content?.parts?.find(
      (part) => part.inlineData?.mimeType?.startsWith("image/")
    );

    if (imagePart?.inlineData?.data) {
      const base64 = imagePart.inlineData.data;

      const mimeType =
        imagePart.inlineData.mimeType || "image/png";

      return `data:${mimeType};base64,${base64}`;
    }

    return null;
  } catch (error) {
    console.error("Tour image generation failed:", error);

    return null;
  }
};

// ============================================================
// IMAGE GENERATION CONSTANTS
// ============================================================

const MAX_MESSAGES = 3;
const MAX_CHAR_PER_MESSAGE = 1000;

// ============================================================
// GENERATE IMAGE
// ============================================================

export const generateImage = async (
  chatMessages: { role: string; content: string }[]
) => {
  const formattedMessages: Content[] = chatMessages
    .filter(
      (msg) => msg.role === "user" || msg.role === "model"
    )
    .slice(-MAX_MESSAGES)
    .map((msg) => ({
      role: msg.role as "user" | "model",
      parts: [
        {
          text: msg.content.slice(0, MAX_CHAR_PER_MESSAGE),
        },
      ],
    }));

  try {
    console.log("Generating image with Gemini...");

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image",
      contents: formattedMessages,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    const imagePart =
      response?.candidates?.[0]?.content?.parts?.find(
        (part) =>
          part.inlineData?.mimeType?.startsWith("image/")
      );

    if (!imagePart?.inlineData?.data) {
      console.error("Gemini returned no image.");
      return "IMAGE_GENERATION_FAILED";
    }

    const base64 = imagePart.inlineData.data;

    const mimeType =
      imagePart.inlineData.mimeType || "image/png";

    return `data:${mimeType};base64,${base64}`;
  } catch (error: any) {
    console.error("Image generation error:", error);

    const status =
      error?.status ??
      error?.statusCode ??
      error?.cause?.status ??
      error?.cause?.statusCode;

    const message = error?.message || "";

    // Gemini quota/rate limit
    if (
      status === 429 ||
      message.includes("RESOURCE_EXHAUSTED") ||
      message.includes("quota exceeded")
    ) {
      return "IMAGE_QUOTA_EXCEEDED";
    }

    if (status === 503) {
      return "IMAGE_SERVICE_BUSY";
    }

    if (status === 404) {
      return "IMAGE_MODEL_NOT_FOUND";
    }

    if (status === 400) {
      return "INVALID_IMAGE_REQUEST";
    }

    return "IMAGE_GENERATION_FAILED";
  }
};

// ============================================================
// CHAT TYPES
// ============================================================

export type ChatRole = "user" | "assistant";

// ============================================================
// SAVE CHAT
// ============================================================

export type ChatRole = "user" | "assistant";

export async function saveChat(
  role: ChatRole,
  content: string
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    if (!["user", "assistant"].includes(role)) {
      throw new Error("Invalid chat role");
    }

    if (!content?.trim()) {
      throw new Error("Chat content cannot be empty");
    }

    return await prisma.chat.create({
      data: {
        clerkId: userId,
        role,
        content: content.trim(),
      },
    });
  } catch (error) {
    console.error("Error saving chat:", error);
    throw error;
  }
}
// ============================================================
// GET ALL CHATS
// ============================================================

export async function getAllChats() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return [];
    }

    return await prisma.chat.findMany({
      where: {
        clerkId: userId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  } catch (error) {
    console.error("Error getting chats:", error);
    throw error;
  }
}

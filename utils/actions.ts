"use server";

import { GoogleGenAI } from "@google/genai";
import prisma from "./db";
import { Tour } from "@/components/TourInfo";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

const countTokensResponse = await ai.models.countTokens({
  model: "gemini-2.0-flash",
  contents: "hello?",
});
console.log("Tokens used:", countTokensResponse.totalTokens);

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
    "stops": ["short paragraph on the stop 1 ", "short paragraph on the stop 2", "short paragraph on the stop 3"]
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

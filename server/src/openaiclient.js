import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

export const hasOpenAIKey = Boolean(apiKey);

export const openai = apiKey
  ? new OpenAI({ apiKey })
  : null;
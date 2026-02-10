import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

function readEnv(...keys: string[]): string {
  for (const key of keys) {
    const value = (import.meta.env as Record<string, string | undefined>)[key];
    if (value && value.trim()) return value.trim();
  }
  return "";
}

const geminiApiKey = readEnv("VITE_GEMINI_API_KEY", "GEMINI_API_KEY");
const openaiApiKey = readEnv("VITE_OPENAI_API_KEY", "OPENAI_API_KEY");

console.log("Environment Debug:", {
  geminiConfigured: Boolean(geminiApiKey),
  openaiConfigured: Boolean(openaiApiKey),
  expectedGeminiVars: ["VITE_GEMINI_API_KEY", "GEMINI_API_KEY"],
  expectedOpenAIVars: ["VITE_OPENAI_API_KEY", "OPENAI_API_KEY"],
});

export type AIProvider = "gemini" | "openai";

export function getCurrentProvider(): AIProvider {
  const stored = localStorage.getItem("ai-provider");
  if (stored === "openai" || stored === "gemini") return stored;
  return "gemini";
}

export function setProvider(provider: AIProvider): void {
  localStorage.setItem("ai-provider", provider);
}

const systemPrompt = `Jesteś asystentem AI dla platformy FlowAssist, pomagającym użytkownikom w:
- Podsumowywaniu artykułów i treści technicznych
- Tłumaczeniu tekstów (EN <-> PL)
- Wyjaśnianiu skomplikowanych konceptów AI i programowania
- Porównywaniu narzędzi i rozwiązań technologicznych

Odpowiadaj zwięźle, konkretnie i pomocnie. Formatuj odpowiedzi używając markdown.
Domyślnym językiem jest polski.`;

const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;
let geminiModel: any = null;
try {
  if (genAI) {
    geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }
} catch (e) {
  console.error("Failed to initialize Gemini model:", e);
}

const openai = openaiApiKey
  ? new OpenAI({
      apiKey: openaiApiKey,
      dangerouslyAllowBrowser: true,
    })
  : null;

export async function generateAIResponse(userMessage: string): Promise<string> {
  const provider = getCurrentProvider();

  try {
    if (provider === "gemini") {
      return await generateWithGemini(userMessage);
    }
    return await generateWithOpenAI(userMessage);
  } catch (error) {
    console.warn(`${provider} failed, trying fallback...`, error);

    try {
      if (provider === "gemini" && openai) {
        return await generateWithOpenAI(userMessage);
      }
      if (provider === "openai" && geminiModel) {
        return await generateWithGemini(userMessage);
      }
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
    }

    throw new Error(
      "Nie udało się uzyskać odpowiedzi od AI. Sprawdź zmienne środowiskowe: VITE_GEMINI_API_KEY/GEMINI_API_KEY lub VITE_OPENAI_API_KEY/OPENAI_API_KEY i wykonaj Redeploy w Vercel.",
    );
  }
}

async function generateWithGemini(message: string): Promise<string> {
  if (!geminiModel) {
    throw new Error("Gemini API key not configured (VITE_GEMINI_API_KEY/GEMINI_API_KEY)");
  }
  try {
    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\n" + message }] }],
    });
    const response = await result.response;
    return response.text();
  } catch (e: any) {
    console.error("Gemini Error:", e);
    throw new Error(`Gemini Error: ${e.message}`);
  }
}

async function generateWithOpenAI(message: string): Promise<string> {
  if (!openai) {
    throw new Error("OpenAI API key not configured (VITE_OPENAI_API_KEY/OPENAI_API_KEY)");
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ],
  });

  return completion.choices[0]?.message?.content || "Brak odpowiedzi";
}

export function getAvailableProviders(): { gemini: boolean; openai: boolean } {
  return {
    gemini: !!geminiApiKey,
    openai: !!openaiApiKey,
  };
}

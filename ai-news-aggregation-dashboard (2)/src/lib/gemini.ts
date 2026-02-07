import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

// Provider type
export type AIProvider = 'gemini' | 'openai';

// Get current provider from localStorage or default to gemini
export function getCurrentProvider(): AIProvider {
    const stored = localStorage.getItem('ai-provider');
    if (stored === 'openai' || stored === 'gemini') return stored;
    return 'gemini';
}

export function setProvider(provider: AIProvider): void {
    localStorage.setItem('ai-provider', provider);
}

// System prompt (shared)
const systemPrompt = `Jesteś asystentem AI dla platformy FlowAssist, pomagającym użytkownikom w:
- Podsumowywaniu artykułów i treści technicznych
- Tłumaczeniu tekstów (EN <-> PL)
- Wyjaśnianiu skomplikowanych konceptów AI i programowania
- Porównywaniu narzędzi i rozwiązań technologicznych

Odpowiadaj zwięźle, konkretnie i pomocnie. Formatuj odpowiedzi używając markdown.
Domyślnym językiem jest polski.`;

// Gemini client
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;
const geminiModel = genAI?.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: systemPrompt,
});

// OpenAI client
const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
const openai = openaiApiKey ? new OpenAI({
    apiKey: openaiApiKey,
    dangerouslyAllowBrowser: true,
}) : null;

// Generate response with fallback
export async function generateAIResponse(userMessage: string): Promise<string> {
    const provider = getCurrentProvider();

    // Try primary provider
    try {
        if (provider === 'gemini') {
            return await generateWithGemini(userMessage);
        } else {
            return await generateWithOpenAI(userMessage);
        }
    } catch (error) {
        console.warn(`${provider} failed, trying fallback...`, error);

        // Try fallback provider
        try {
            if (provider === 'gemini' && openai) {
                console.log('Falling back to OpenAI...');
                return await generateWithOpenAI(userMessage);
            } else if (provider === 'openai' && geminiModel) {
                console.log('Falling back to Gemini...');
                return await generateWithGemini(userMessage);
            }
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
        }

        // Both failed
        throw new Error('Nie udało się uzyskać odpowiedzi od AI. Sprawdź klucze API w ustawieniach (.env).');
    }
}

async function generateWithGemini(message: string): Promise<string> {
    if (!geminiModel) {
        throw new Error('Gemini API key not configured');
    }
    const result = await geminiModel.generateContent(message);
    return result.response.text();
}

async function generateWithOpenAI(message: string): Promise<string> {
    if (!openai) {
        throw new Error('OpenAI API key not configured');
    }
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
        ],
    });
    return completion.choices[0]?.message?.content || 'Brak odpowiedzi';
}

// Check which providers are available
export function getAvailableProviders(): { gemini: boolean; openai: boolean } {
    return {
        gemini: !!geminiApiKey,
        openai: !!openaiApiKey,
    };
}

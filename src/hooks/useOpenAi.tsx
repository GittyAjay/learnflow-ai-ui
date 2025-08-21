import OpenAI from "openai";
import { useState } from "react";

const client = new OpenAI();

type UseOpenAiResult = {
  response: string | null;
  loading: boolean;
  error: string | null;
  getResponse: (userPrompt: string) => Promise<void>;
};

export function useOpenAi(): UseOpenAiResult {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getResponse = async (userPrompt: string) => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await client.chat.completions.create({
        model: "gpt-4o-mini-realtime",
        messages: [
          { role: "user", content: userPrompt }
        ],
      });
      setResponse(res.choices?.[0]?.message?.content ?? "");
    } catch (err: any) {
      setError(
        err?.message ||
          "An error occurred while fetching the response from OpenAI."
      );
    } finally {
      setLoading(false);
    }
  };

  return { response, loading, error, getResponse };
}

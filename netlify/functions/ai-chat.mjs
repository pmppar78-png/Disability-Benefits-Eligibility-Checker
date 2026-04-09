const MODEL = "gpt-4o-mini";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

  if (!apiKey) {
    return jsonResponse({ error: "AI service is not configured" }, 500);
  }

  try {
    const payload = await req.json();
    const messages = Array.isArray(payload?.messages) ? payload.messages : [];

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      return jsonResponse({ error: "Failed to get AI response" }, 502);
    }

    const completion = await response.json();
    const reply = completion?.choices?.[0]?.message ?? null;

    return jsonResponse({ reply });
  } catch (error) {
    console.error("AI chat error:", error);
    return jsonResponse({ error: "Failed to get AI response" }, 500);
  }
};

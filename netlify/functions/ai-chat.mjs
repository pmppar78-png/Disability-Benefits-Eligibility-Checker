const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";

const SYSTEM_FALLBACK =
  "You are an educational assistant for disability benefits concepts. Do not provide legal, medical, or financial advice.";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  const apiKey = Netlify.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "OPENAI_API_KEY is not configured" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const incomingMessages = Array.isArray(payload?.messages) ? payload.messages : [];
  const messages = incomingMessages
    .filter(
      (m) =>
        m &&
        typeof m.role === "string" &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .slice(-20);

  if (messages.length === 0) {
    messages.push({ role: "system", content: SYSTEM_FALLBACK });
  }

  const model = Netlify.env.get("OPENAI_MODEL") || DEFAULT_MODEL;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Upstream API error", details: data?.error?.message || null }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const content = data?.choices?.[0]?.message?.content || "";
    return new Response(
      JSON.stringify({
        reply: {
          role: "assistant",
          content
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch {
    return new Response(JSON.stringify({ error: "Request to AI provider failed" }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};

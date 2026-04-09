const apiEndpoint = "/.netlify/functions/ai-chat";

const messages = [];

function appendMessage(role, content) {
  const log = document.getElementById("chat-log");
  if (!log) return;
  const wrapper = document.createElement("div");
  wrapper.className = `chat-message ${role}`;
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble";
  // Use innerHTML for assistant (to render affiliate links), textContent for user (security)
  if (role === "assistant") {
    bubble.innerHTML = content;
  } else {
    bubble.textContent = content;
  }
  wrapper.appendChild(bubble);
  log.appendChild(wrapper);
  log.scrollTop = log.scrollHeight;
}

async function sendMessage(text) {
  appendMessage("user", text);
  messages.push({ role: "user", content: text });

  appendMessage("assistant", "<span class='dots'>Thinking…</span>");

  try {
    const res = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    const data = await res.json();
    const log = document.getElementById("chat-log");
    if (!log) return;

    // replace last assistant "Thinking…" bubble
    const bubbles = log.querySelectorAll(".chat-message.assistant .chat-bubble");
    const last = bubbles[bubbles.length - 1];
    if (last) last.innerHTML = data.reply?.content || "Sorry — I couldn't generate a reply.";
    messages.push({ role: "assistant", content: data.reply?.content || "" });
  } catch (err) {
    const log = document.getElementById("chat-log");
    const bubbles = log?.querySelectorAll(".chat-message.assistant .chat-bubble");
    const last = bubbles && bubbles[bubbles.length - 1];
    if (last) last.textContent = "There was a problem reaching the AI helper. Please try again.";
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Set footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  appendMessage(
    "assistant",
    "Hi, I'm the Disability Benefits AI helper. I can answer general educational questions about SSDI, SSI, VA disability, state programs, timelines, documentation, appeals, and common disability benefits terms. " +
      "I'm here to help you understand concepts and prepare questions for the agencies and professionals who make real decisions. " +
      "Please remember: I cannot tell you whether you'll be approved, give legal advice, estimate benefit amounts, or make decisions about your case. For advice specific to your situation, you should speak with Social Security, the VA, a licensed attorney, or an accredited representative."
  );

  const form = document.getElementById("chat-form");
  const input = document.getElementById("user-input");

  if (!form || !input) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    sendMessage(text);
  });
});

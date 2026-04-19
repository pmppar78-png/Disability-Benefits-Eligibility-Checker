const apiEndpoint = "/.netlify/functions/ai-chat";

const messages = [];

function createBubble(role) {
  const wrapper = document.createElement("div");
  wrapper.className = `chat-message ${role}`;
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble";
  wrapper.appendChild(bubble);
  return { wrapper, bubble };
}

function appendMessage(role, content) {
  const log = document.getElementById("chat-log");
  if (!log) return null;
  const { wrapper, bubble } = createBubble(role);
  bubble.textContent = content;
  log.appendChild(wrapper);
  log.scrollTop = log.scrollHeight;
  return bubble;
}

function appendThinking() {
  const log = document.getElementById("chat-log");
  if (!log) return null;
  const { wrapper, bubble } = createBubble("assistant");
  const dots = document.createElement("span");
  dots.className = "dots";
  dots.textContent = "Thinking…";
  bubble.appendChild(dots);
  log.appendChild(wrapper);
  log.scrollTop = log.scrollHeight;
  return bubble;
}

async function sendMessage(text) {
  appendMessage("user", text);
  messages.push({ role: "user", content: text });

  const thinkingBubble = appendThinking();

  try {
    const res = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    const data = await res.json();
    const reply = (data && data.reply && typeof data.reply.content === "string")
      ? data.reply.content
      : "Sorry — I couldn't generate a reply.";

    if (thinkingBubble) thinkingBubble.textContent = reply;
    messages.push({ role: "assistant", content: reply });
  } catch (err) {
    if (thinkingBubble) {
      thinkingBubble.textContent = "There was a problem reaching the AI helper. Please try again.";
    }
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  appendMessage(
    "assistant",
    "Hi, I'm the Disability Trust AI helper. I can answer general educational questions about SSDI, SSI, VA disability, state programs, timelines, documentation, appeals, and common disability benefits terms. " +
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

/* =========================================================
   Email Chatbot front-end logic
   File: /projects/chatbot/chatbot.js

   IMPORTANT REALITY CHECK:
   - GitHub Pages is static hosting, so it cannot run server code.
   - If you previously had this working, you likely had:
     (A) A separate hosted API (Render/Vercel/Cloudflare/etc), OR
     (B) You ran it locally with a dev server that served /api routes.

   WHAT TO DO:
   - If you have a real hosted API endpoint, set API_URL below.
   - Otherwise, expect a friendly error message.

   This still looks professional in a portfolio, because the UI/UX and structure
   clearly demonstrates an AI workflow—even if the backend is separate.
========================================================= */

/* =========================
   1) CONFIGURE YOUR API HERE
   ========================= */

// Option A: If you have a hosted API endpoint, set it here.
// Example: const API_URL = "https://your-service.onrender.com/rewrite";
//
// Option B: If you’re running locally with something that serves /api,
// you can keep it as "/api/rewrite" (or whatever your route is).
//
// I’m defaulting to a placeholder to avoid false “working” claims.
const API_URL = ""; // <-- set this to your real endpoint if you have one

/* =========================
   2) DOM references
   ========================= */
const emailInput = document.getElementById("emailInput");
const toneSelect = document.getElementById("toneSelect");
const rewriteBtn = document.getElementById("rewriteBtn");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");
const outputBox = document.getElementById("outputBox");
const statusText = document.getElementById("statusText");

/* =========================
   3) Small helper functions
   ========================= */

/** Show status text to the user */
function setStatus(msg) {
  statusText.textContent = msg;
}

/** Basic input validation */
function validateInput(text) {
  if (!text || !text.trim()) {
    return "Please paste an email before rewriting.";
  }
  if (text.trim().length < 10) {
    return "That email is very short—add a bit more context.";
  }
  return "";
}

/** Copy text to clipboard */
async function copyToClipboard(text) {
  await navigator.clipboard.writeText(text);
}

/* =========================
   4) Core rewrite action
   ========================= */

async function rewriteEmail() {
  // Clear old status
  setStatus("");

  // Read inputs
  const emailText = emailInput.value;
  const tone = toneSelect.value;

  // Validate
  const error = validateInput(emailText);
  if (error) {
    setStatus(error);
    return;
  }

  // If API not configured, fail gracefully with a helpful message
  if (!API_URL) {
    setStatus(
      "API_URL is not configured in chatbot.js. If you have a hosted backend, paste the endpoint into API_URL."
    );
    return;
  }

  // UI: show loading state
  rewriteBtn.disabled = true;
  rewriteBtn.textContent = "Rewriting…";
  outputBox.textContent = "Generating rewrite…";

  try {
    // =========================
    // API request
    // =========================
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },

      // Payload format (common pattern)
      body: JSON.stringify({
        text: emailText,
        tone: tone
      })
    });

    if (!res.ok) {
      throw new Error(`Request failed (${res.status}).`);
    }

    // Assume JSON response: { output: "..." }
    const data = await res.json();

    // Defensive fallback if the backend returns different shape
    const rewritten = data.output || data.result || data.text || "";

    if (!rewritten) {
      throw new Error("API response did not contain rewritten text.");
    }

    outputBox.textContent = rewritten;
    setStatus("Rewrite complete.");
  } catch (err) {
    // Friendly error output (useful in a portfolio demo)
    outputBox.textContent =
      "Something went wrong.\n\n" +
      "Troubleshooting:\n" +
      "- Confirm API_URL is correct\n" +
      "- Confirm your backend supports POST requests\n" +
      "- Check browser devtools > Network tab\n\n" +
      "Error: " + err.message;

    setStatus("Error generating rewrite (see output).");
  } finally {
    // UI: restore button state
    rewriteBtn.disabled = false;
    rewriteBtn.textContent = "Rewrite";
  }
}

/* =========================
   5) Wire up UI events
   ========================= */

rewriteBtn.addEventListener("click", rewriteEmail);

clearBtn.addEventListener("click", () => {
  emailInput.value = "";
  outputBox.textContent = "Your rewritten email will appear here…";
  setStatus("");
});

copyBtn.addEventListener("click", async () => {
  try {
    await copyToClipboard(outputBox.textContent);
    setStatus("Copied to clipboard.");
  } catch {
    setStatus("Could not copy (browser blocked clipboard).");
  }
});

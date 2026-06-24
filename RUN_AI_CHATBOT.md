# Run the AI Chatbot

Your server is already running. Follow these steps to use the AI chatbot.

---

## Step 1: Keep the server running

In your terminal you should see:

```
Server: http://localhost:3000
Store:  http://localhost:3000
Admin:  http://localhost:3000/admin/admin.html
Chatbot: API key loaded
```

Leave this terminal open. Do **not** press Ctrl+C.

---

## Step 2: Open the store in your browser

1. Open **Chrome**, **Edge**, or **Firefox**.
2. Go to: **http://localhost:3000**
3. Wait for the store home page to load.

---

## Step 3: Open the chatbot

1. Look at the **bottom-right** of the page.
2. Click the **💬** (chat) button.
3. The **Support (24/7)** chat panel will open.

---

## Step 4: Chat with the AI

1. Type a message in the box (e.g. "What payment methods do you accept?").
2. Press **Enter** or click **Send**.
3. You’ll see **"Typing…"** then the AI reply.
4. Ask more questions; the bot keeps conversation context.

---

## Quick test

- **"Hello"** – greeting  
- **"Do you support Razorpay?"** – payment info  
- **"How can I track my order?"** – support style reply  

---

## If the chatbot says "I'm offline"

- Confirm the server is still running (`npm run dev`).
- You’re using **http://localhost:3000** (not `file://`).
- Check `.env` has `OPENAI_API_KEY=sk-proj-...`.
- Restart the server and refresh the page.

---

## Summary

| Step | Action |
|------|--------|
| 1 | Keep `npm run dev` running |
| 2 | Open **http://localhost:3000** in browser |
| 3 | Click **💬** (bottom-right) |
| 4 | Type and send messages |

The AI chatbot is now running.

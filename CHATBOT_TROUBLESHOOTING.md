# Chatbot Troubleshooting Guide

If your chatbot is not responding, follow these steps:

## Quick Checks

### 1. **Server is Running**
Make sure your server is running:
```bash
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3000
🤖 AI Chatbot: ✅ API Key loaded
📦 Model: gpt-4o-mini
```

### 2. **Check Browser Console**
1. Open your browser (Chrome/Firefox)
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Look for:
   - `✅ Chatbot initialized successfully` - Good!
   - Any red error messages - These tell you what's wrong

### 3. **Check Network Tab**
1. In Developer Tools, go to **Network** tab
2. Try sending a message in the chatbot
3. Look for a request to `/api/chat`
4. Click on it to see:
   - **Status**: Should be `200` (green)
   - **Response**: Should contain `{"reply": "..."}`

## Common Issues

### Issue 1: "Chatbot: Missing required DOM elements"
**Problem**: The chatbot HTML elements aren't found.

**Solution**: 
- Make sure `index.html` includes the chatbot widget HTML
- Check that `chatbot.js` is loaded AFTER the HTML elements exist

### Issue 2: "Network error" or "Failed to fetch"
**Problem**: Can't connect to `/api/chat` endpoint.

**Solutions**:
- Make sure server is running (`npm run dev`)
- Check you're accessing `http://localhost:3000` (not `file://`)
- Try refreshing the page
- Check server console for errors

### Issue 3: "API Key missing!"
**Problem**: OpenAI API key not loaded.

**Solution**:
- Check `.env` file exists in project root
- Verify `OPENAI_API_KEY=sk-proj-...` is set correctly
- Restart the server after changing `.env`

### Issue 4: Chatbot opens but doesn't respond
**Problem**: Messages sent but no reply.

**Solutions**:
- Check browser console for errors
- Check server console for error messages
- Verify API key is valid and has credits
- Try a simple message like "Hello"

### Issue 5: "Rate limit exceeded"
**Problem**: Too many requests too quickly.

**Solution**: Wait 1 minute and try again (30 requests/minute limit)

## Testing Steps

1. **Test Server Health**:
   ```
   Open: http://localhost:3000/api/health
   Should show: {"ok":true}
   ```

2. **Test Chatbot API Directly**:
   ```bash
   curl -X POST http://localhost:3000/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message":"Hello"}'
   ```
   Should return: `{"reply":"..."}`

3. **Test in Browser**:
   - Open `http://localhost:3000`
   - Click the 💬 button (bottom-right)
   - Type "Hello" and press Send
   - Should see "Typing…" then a response

## Debug Mode

To see more detailed logs, check:

**Browser Console** (F12 → Console):
- Chatbot initialization messages
- API request/response logs
- Error messages

**Server Console** (terminal):
- `📨 Chat request received` - Request received
- `✅ Chat response sent` - Response sent successfully
- `❌ Chat error:` - Error occurred

## Still Not Working?

1. **Clear Browser Cache**:
   - Press `Ctrl+Shift+Delete`
   - Clear cached files
   - Refresh page

2. **Check File Paths**:
   - Make sure `js/chatbot.js` exists
   - Make sure `css/chatbot.css` exists
   - Check `index.html` includes both

3. **Restart Everything**:
   ```bash
   # Stop server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

4. **Check API Key**:
   - Verify key starts with `sk-proj-`
   - Check OpenAI dashboard for usage/credits
   - Try regenerating key if expired

## Need More Help?

Check the server console and browser console for specific error messages - they will tell you exactly what's wrong!

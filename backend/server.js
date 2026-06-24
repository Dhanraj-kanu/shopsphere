// E-Commerce server: static site + AI chatbot API
// Run: npm run dev
// Env: OPENAI_API_KEY (required for chatbot), PORT (default 3000)
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const path = require('path');
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const connectDB = require('./config/db');

const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');
const couponRoutes = require('./routes/couponRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// Connect to Database
connectDB();

const app = express();

app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/reviews', reviewRoutes);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// AI Chat (24/7 chatbot)
// AI Chat (24/7 chatbot)
// Helper to sleep/delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Retry wrapper for Gemini API
async function callGeminiWithRetry(chatSession, message, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await chatSession.sendMessage(message);
      return await result.response;
    } catch (err) {
      const isRateLimit = err.status === 429 ||
        (err.message && err.message.includes('429')) ||
        (err.errorDetails && JSON.stringify(err.errorDetails).includes('QuotaFailure'));

      if (isRateLimit && attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.warn(`Gemini 429 error. Retrying in ${delay}ms (Attempt ${attempt}/${retries})...`);
        await sleep(delay);
        continue;
      }
      throw err; // Re-throw if not 429 or max retries reached
    }
  }
}

const handleLocalChat = (message, res) => {
  const msg = message.toLowerCase();
  let reply = '';

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    reply = 'Hello! I am your support assistant. How can I help you today?';
  } else if (msg.includes('order') || msg.includes('track')) {
    reply = 'To track your order, please log in and visit the "My Orders" section on your dashboard.';
  } else if (msg.includes('suggest') || msg.includes('recommend') || msg.includes('product')) {
    reply = 'We have a wide range of products! Please check our homepage for the latest arrivals and featured items.';
  } else if (msg.includes('return') || msg.includes('refund')) {
    reply = 'If return the product then show this detalis: If you have any other questions, just reach out to our support team at ecommercewebsit368@gmail.com or give us a call at +91 7981048647.';
  } else {
    reply = 'I am currently operating in offline mode. If you have any other questions, just reach out to our support team at ecommercewebsit368@gmail.com or give us a call at +91 7981048647.';
  }

  return res.json({ reply });
};

app.post('/api/chat', async (req, res) => {
  try {
    const message = (req.body && req.body.message) || '';
    if (!message.trim()) return res.status(400).json({ error: 'Missing message' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey === 'your_api_key_here') {
      console.log('GEMINI_API_KEY missing or invalid. Using local fallback chat.');
      return handleLocalChat(message, res);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];
    const model = genAI.getGenerativeModel({ model: modelName, safetySettings });
    console.log('Chatbot using model:', modelName);

    const history = Array.isArray(req.body && req.body.history) ? req.body.history : [];
    const productContext = (req.body && req.body.productContext) || '';

    // Format history for Gemini (user/model roles)
    // IMPORTANT: Gemini prevents User -> User. 
    // The history from client likely includes the *current* message as the last item.
    // We must remove it because 'startChat' history is for *past* turns, and 'sendMessage' adds the current user turn.

    let cleanHistory = history.filter((m) => m && typeof m.role === 'string' && typeof m.content === 'string' && m.content.trim() !== '');

    // Remove the last message if it matches the current message (to avoid duplication)
    if (cleanHistory.length > 0) {
      const lastMsg = cleanHistory[cleanHistory.length - 1];
      if (lastMsg.role === 'user' && lastMsg.content.trim() === message.trim()) {
        cleanHistory.pop();
      }
    }

    // Map to Gemini format
    const chatHistory = cleanHistory
      .slice(-6) // Keep last 6 turns (reduced from 10 to save tokens)
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(m.content).slice(0, 800) }],
      }));

    const systemInstruction = `You are a helpful 24/7 customer support assistant for an e-commerce store. Be concise. Mention Razorpay for payments.
${productContext ? `\nCurrent Product Inventory:\n${productContext}\n\nUse this inventory to answer questions about product availability, price, and stock status.` : ''}`;

    const chat = model.startChat({
      history: chatHistory,
      systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] } // Restored systemInstruction correctly
    });

    const fullMessage = `User Question: ${message.trim()}`;

    // Use retry logic
    const response = await callGeminiWithRetry(chat, fullMessage);
    const reply = response.text();

    return res.json({ reply: String(reply).trim() });
  } catch (err) {
    console.error('Chatbot error:', err.message);
    const message = (req.body && req.body.message) || '';
    console.log('Gemini API failed. Falling back to local chat.');
    return handleLocalChat(message, res);
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Static: serve project root (index.html, js/, css/, admin/)
app.use(express.static(path.join(__dirname)));

// Admin panel entry
app.get('/admin', (req, res) => res.redirect('/admin/'));
app.get('/admin/', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'admin.html')));

// SPA fallback for store (must be last)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log('Server: http://localhost:' + port);
  console.log('Store:  http://localhost:' + port);
  console.log('Admin:  http://localhost:' + port + '/admin/admin.html');
  console.log('Chatbot: ' + (process.env.GEMINI_API_KEY ? 'API key loaded' : 'GEMINI_API_KEY missing'));
});

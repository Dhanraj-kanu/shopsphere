# E-Commerce Integration Guide – Step by Step

This guide ties together **Store**, **Payment Gateway (Razorpay)**, **AI Chatbot**, and **Admin Panel** so you can run and manage everything in one place.

---

## 1. Project Overview

| Component | Purpose | Key Files |
|-----------|---------|-----------|
| **Store (Customer)** | Browse products, cart, checkout, pay | `index.html`, `js/app.js`, `js/payment.js` |
| **Payment Gateway** | Razorpay – pay at checkout | `js/payment.js`, Razorpay script in `index.html` |
| **AI Chatbot** | 24/7 support on store | `js/chatbot.js`, `css/chatbot.css`, `server.js` + `/api/chat` |
| **Admin Panel** | Manage products, orders, users | `admin/admin.html`, `admin/js/admin.js` |

**Data flow:**
- Store and Admin both use **localStorage** (products, orders, users, notifications).
- Checkout builds an order → **Razorpay** runs → on success, order is saved to localStorage (and appears in Admin).
- Chatbot talks to **server** `/api/chat` (needs `server.js` + OpenAI key).

---

## 2. One-Time Setup (Step by Step)

### Step 2.1 – Install dependencies

```bash
cd E-commerce-App-with-AI-main
npm install
```

### Step 2.2 – Environment variables (AI Chatbot)

1. Copy the example env file:
   ```bash
   copy .env.example .env
   ```
2. Edit `.env` and set:
   - `OPENAI_API_KEY=your_openai_key`  
   (Required for AI chatbot. Get key from https://platform.openai.com/api-keys)
   - Optional: `OPENAI_MODEL=gpt-4o-mini`, `PORT=3000`

### Step 2.3 – Razorpay (Payment Gateway)

1. Sign up: https://dashboard.razorpay.com/
2. Get **Key ID** and **Key Secret**: Dashboard → **Settings** → **API Keys** (use **Test** keys for development).
3. In your project, open **`js/payment.js`**.
4. Replace placeholders:
   - `RAZORPAY_KEY_ID = 'YOUR_RAZORPAY_KEY_ID'` → your Key ID (e.g. `rzp_test_...`).
   - Leave `RAZORPAY_KEY_SECRET` only if you add a backend later; front-end uses Key ID only for checkout.

### Step 2.4 – Server (for AI Chatbot + single entry point)

The app can run in two ways:

- **Option A – With server (recommended):**  
  Serves the store, admin, and chatbot API from one place.
- **Option B – Without server:**  
  Open `index.html` and `admin/admin.html` directly in the browser. Store and Razorpay work; **chatbot will show “offline”** (no `/api/chat`).

If you use **Option A**, ensure **`server.js`** exists in the project root (see Section 5 below). Then:

```bash
npm run dev
```

- Store: http://localhost:3000  
- Admin: http://localhost:3000/admin/admin.html  

---

## 3. Customer Flow – Step by Step (With Payment Gateway)

Follow this path to verify end-to-end flow including Razorpay.

| Step | Action | Where | What happens |
|------|--------|--------|--------------|
| 1 | Open store | http://localhost:3000 (or open `index.html`) | Home page with products (from `js/data.js` / localStorage). |
| 2 | Add to cart | Click “Add” on products | Items go to cart (cart icon shows count). |
| 3 | Go to cart | Click cart icon → Cart | See cart items, quantities, total. |
| 4 | Checkout | Click “Proceed to Checkout” | Goes to Delivery Details page. |
| 5 | Fill delivery | Enter name, phone, email, address, city, state, postal code; choose Standard/Express | Form validated; total updates if Express is selected. |
| 6 | Place order | Click “Place Order” | `placeOrder()` in `app.js` builds order object and calls `initializeRazorpayPayment(orderData)` in `payment.js`. |
| 7 | Pay (Razorpay) | Razorpay modal opens | User pays with test card (e.g. `4111 1111 1111 1111`) or UPI. |
| 8 | Success | Payment success | `handlePaymentSuccess()` runs → order saved to localStorage (with `razorpay_payment_id`, etc.) → success modal → cart cleared. |
| 9 | View order | Profile or Admin | In **Profile**: “Recent Orders”. In **Admin**: Orders section; order appears with status and payment info. |

**Razorpay test card (Test Mode):**  
Card: `4111 1111 1111 1111`, CVV: any 3 digits, Expiry: any future date.

---

## 4. Admin Management – Step by Step

Use the Admin Panel to manage products, orders, and users (all backed by the same localStorage the store uses).

### Step 4.1 – Open Admin

- With server: http://localhost:3000/admin/admin.html  
- Without server: open `admin/admin.html` in the browser.

### Step 4.2 – Login

- Username: `admin`  
- Password: `admin123`  
(Defined in `admin/js/admin.js`; change in production.)

### Step 4.3 – Dashboard

- View **Total Products**, **Active Orders**, **Registered Users**.
- View **Recent Notifications** (e.g. new order alerts).

### Step 4.4 – Manage Products

| Action | Steps |
|--------|--------|
| **View** | Sidebar → **Products**. List of all products. |
| **Add** | Click “Add Product” → fill name, description, price, stock, category, image URL → Save. |
| **Edit** | In product list → **Edit** → change fields → Save. |
| **Delete** | In product list → **Delete** → confirm. |

Products you add here are stored in localStorage and appear on the store (if the store reads from the same structure).

### Step 4.5 – Manage Orders (Including Paid Orders)

| Action | Steps |
|--------|--------|
| **View** | Sidebar → **Orders**. All orders (including those paid via Razorpay). |
| **Filter** | Use buttons: All, Pending, Processing, Shipped, Delivered. |
| **Details** | Click **View** (eye) on an order → see customer, address, items, **payment total**, and if present Razorpay payment id. |
| **Update status** | Click **Update Status** (edit) → choose Pending / Processing / Shipped / Delivered / Cancelled → Save. |
| **Print** | Click **Print** → invoice in new window. |

Orders created after Razorpay success include payment info (e.g. `razorpay_payment_id`) in the order object.

### Step 4.6 – Manage Users

| Action | Steps |
|--------|--------|
| **View** | Sidebar → **Users**. List of registered users. |
| **Details** | Click **View** (eye). |
| **Suspend / Activate** | Use the toggle button on a user. |
| **Delete** | Click **Delete** → confirm. |

---

## 5. Server Setup (Optional – For AI Chatbot)

If **`server.js`** is missing, add it in the **project root** so that:

- The same server serves the store and admin.
- **POST /api/chat** is available for the AI chatbot.

Example **`server.js`** (Node + Express):

```js
// Load env
require('dotenv').config();
const path = require('path');
const express = require('express');
const app = express();

app.use(express.json({ limit: '64kb' }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// AI Chat – requires OPENAI_API_KEY in .env
app.post('/api/chat', async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ reply: "Support bot isn't configured." });
    }
    const message = (req.body && req.body.message) || '';
    if (!message.trim()) return res.status(400).json({ error: 'Missing message' });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful 24/7 support assistant for an e-commerce store. Be concise.' },
          { role: 'user', content: message.trim() },
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({ reply: 'Support is busy. Try again.' });
    }
    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || 'Sorry, please try again.';
    return res.json({ reply });
  } catch (err) {
    return res.status(502).json({ reply: 'Something went wrong. Please try again.' });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Static files (store + admin)
app.use(express.static(path.join(__dirname)));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log('Server running on http://localhost:' + port);
  console.log('AI Chatbot:', process.env.OPENAI_API_KEY ? 'API Key loaded' : 'API Key missing');
});
```

Then:

```bash
npm run dev
```

- Store: http://localhost:3000  
- Admin: http://localhost:3000/admin/admin.html  
- Chatbot: same page as store; button at bottom-right; uses **POST /api/chat**.

---

## 6. Configuration Checklist

Before going live, confirm:

| Item | Where | Status |
|------|--------|--------|
| Razorpay Key ID | `js/payment.js` | Set to your `rzp_test_...` or `rzp_live_...` |
| OpenAI API Key | `.env` → `OPENAI_API_KEY` | Set for chatbot |
| Server running | `npm run dev` | Required for chatbot |
| Admin login | `admin/js/admin.js` | Change default `admin` / `admin123` in production |
| HTTPS (production) | Hosting | Use HTTPS for Razorpay live mode |

---

## 7. Quick Reference – File Roles

| File / Folder | Role |
|---------------|------|
| `index.html` | Store entry; loads app, payment, chatbot. |
| `js/app.js` | Store logic: home, cart, delivery, `checkout()`, `placeOrder()` → calls Razorpay. |
| `js/payment.js` | Razorpay: `initializeRazorpayPayment()`, success/failure, order save. |
| `js/chatbot.js` | Chat UI; sends messages to `/api/chat`. |
| `js/data.js` | Products/categories (and any shared data). |
| `admin/admin.html` | Admin UI. |
| `admin/js/admin.js` | Admin logic: products, orders, users; reads/writes same localStorage. |
| `server.js` | Serves site + **POST /api/chat** for AI (optional). |
| `.env` | `OPENAI_API_KEY`, optional `PORT`, `OPENAI_MODEL`. |

---

## 8. Troubleshooting

- **Razorpay modal doesn’t open**  
  - Check `RAZORPAY_KEY_ID` in `js/payment.js` and that Razorpay script is loaded in `index.html`.

- **Chatbot always says “offline”**  
  - Run `npm run dev`, use http://localhost:3000, and set `OPENAI_API_KEY` in `.env`.

- **Orders don’t appear in Admin**  
  - Store and Admin must use the same origin (same browser, same domain) so they share localStorage. Use http://localhost:3000 for both when testing.

- **Payment success but order not saved**  
  - Check browser console for errors in `payment.js` (e.g. `handlePaymentSuccess`, `completeOrder`). Ensure `resetCart` and localStorage writes run.

---

You now have a single flow: **Store → Cart → Checkout → Razorpay (payment gateway) → Order saved → Admin (manage products, orders, users)** and optional **AI Chatbot** via the same server.

# E-Commerce App with Admin Panel and Mobile Integration

An all-in-one **E-commerce App** and **Admin Panel** with **Razorpay payment gateway** and **AI chatbot** support.

📘 **Full setup and flow:** see **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** for step-by-step integration (store → cart → checkout → Razorpay → admin management).

---

## 🚀 Features  

### User Features  
- **User Authentication:** Secure login and registration system.  
- **Product Search & Filtering:** Effortlessly find desired products.  
- **Add to Cart:** Seamless cart management with real-time updates.  
- **Responsive Design:** Works perfectly across desktop, tablet, and mobile.  

### Admin Panel Features  
- **User Management:** View and manage all authenticated users.  
- **Product Management:**  
  - Add, edit, and delete products.  
  - Manage inventory and pricing.  
- **Order Management:**  
  - Access order details, including user names, addresses, and delivery info.  
  - Update order status in real time.  
- **Admin Security:** Implemented authentication for admin dashboard access.  
- **Responsive UI:** Fully optimized for desktops and smartphones.  

### Additional Functionalities  
- **Live Hosting:** Your e-commerce app and website can be hosted online.  
- **Mobile Application:** Fully integrated with the site and admin panel for seamless functionality.  

---

## 📂 Project Structure  
- **Frontend:** Built with [technology/tool used, e.g., Flutter/React].  
- **Backend:** Features include database integration, API authentication, and admin functionalities.  
- **Database:** Secure storage for user, product, and order data.  

---

## 🔗 Stay Connected  

For updates, tutorials, and support, follow us:  

- [Facebook](https://www.facebook.com/share/1AoUhYrqoc/)
- [Linkedin](https://www.linkedin.com/in/dhanraj-kanu-456582305)
- [YouTube](https://youtube.com/@nothingelse20?si=Z1VZ2ESqCAJlz4pc)  
- [Instagram](https://www.instagram.com/dhanraj_danny1?igsh=MXE3Z3MybGNzNDNmNA==)  
- [Website](https://danny.page.gd/?i=1)  


## 📞 Support  
If you have any questions or need help, visit our [Whatsapp Help Center](https://wa.me/qr/OGV67WFA5EBJM1).

---

## 🤖 AI Chatbot (24/7 Customer Support)

This project includes a **fully integrated 24/7 AI chatbot** powered by OpenAI:

- **Frontend widget**: `css/chatbot.css`, `js/chatbot.js` - Beautiful chat interface
- **Backend endpoint**: `POST /api/chat` (implemented in `server.js`) - AI-powered responses
- **Conversation memory**: Chat history is saved and sent as context for better answers

### Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API key:**
   - The `.env` file is already created with your OpenAI API key
   - If you need to update it, edit `.env` and set `OPENAI_API_KEY=your_key_here`

### Start MongoDB Database 
----Connect to esunwal

3. **Start the server:**
----cmd
----cd\e-commerce website\E-commerce-App-with-AI-main
 ---npm start

   ```bash
*** Start frontend ***  
----cmd
----cd\e-commerce website\E-commerce-App-with-AI-main 
   --npm run client
    http://localhost:5173/


### Start Mobile Application 
open cmd
----cd\e-commerce website\E-commerce-App-with-AI-main 
   --npm run client
----Connect to ngrok 
----ngrok http 5173

## Admin Email: Contact Us
## Password : 

4. **Open your browser:**
   - Navigate to `http://localhost:3000`
   - Click the **💬 Support (24/7)** button in the bottom-right corner
   - Start chatting with your AI assistant!

### Features

✅ **24/7 Availability** - Always online, instant responses  
✅ **Conversation Memory** - Remembers previous messages for context  
✅ **Smart Responses** - Powered by GPT-4o-mini for accurate answers  
✅ **Rate Limiting** - Prevents abuse (30 requests/minute per IP)  
✅ **Offline Fallback** - Graceful error handling if server is down  
✅ **Mobile Responsive** - Works perfectly on all devices  

### Configuration

Edit `.env` to customize:
- `OPENAI_API_KEY` - Your OpenAI API key (required)
- `OPENAI_MODEL` - AI model to use (default: `gpt-4o-mini`)
- `PORT` - Server port (default: 3000)

### Security Notes

⚠️ **Important**: 
- The `.env` file is in `.gitignore` to prevent committing your API key
- Never share or commit your API key publicly
- For production, use environment variables on your hosting platform

### Troubleshooting

**Chatbot not responding?**
- Check that the server is running (`npm run dev`)
- Verify your API key is set in `.env`
- Check browser console for errors
- Ensure you're accessing `http://localhost:3000` (not file://)

**API errors?**
- Verify your OpenAI API key is valid and has credits
- Check server console for detailed error messages

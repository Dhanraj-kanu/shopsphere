// Simple frontend chatbot widget
(function () {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }

  function initChatbot() {
    const panel = document.getElementById('chatbot-panel');
    const toggle = document.getElementById('chatbot-toggle');
    const closeBtn = document.getElementById('chatbot-close');
    const form = document.getElementById('chatbot-form');
    const input = document.getElementById('chatbot-input');
    const messages = document.getElementById('chatbot-messages');
    const sendBtn = document.querySelector('.chatbot-send');

    // Check if elements exist
    if (!panel || !toggle || !closeBtn || !form || !input || !messages) {
      console.error('Chatbot: Missing required DOM elements');
      return;
    }

    const HISTORY_KEY = 'chat_history_v2';

    function appendMessage(sender, text) {
      const el = document.createElement('div');
      el.className = 'msg ' + (sender === 'user' ? 'msg-user' : 'msg-bot');
      el.textContent = text;
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;
    }

    function appendTyping() {
      const el = document.createElement('div');
      el.className = 'msg msg-bot';
      el.dataset.typing = 'true';
      el.textContent = 'Typing…';
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;
    }

    function removeTyping() {
      const el = messages.querySelector('[data-typing="true"]');
      if (el) el.remove();
    }

    function setLoading(loading) {
      // Keep input editable so customer can type while AI responds
      if (sendBtn) sendBtn.disabled = loading;
      toggle.disabled = false;
    }

    // Type-out effect for live-feeling replies
    function typeReply(text) {
      const el = document.createElement('div');
      el.className = 'msg msg-bot';
      messages.appendChild(el);

      let index = 0;
      const chars = String(text);

      const interval = setInterval(() => {
        el.textContent = chars.slice(0, index);
        messages.scrollTop = messages.scrollHeight;
        index += 2; // type 2 chars per tick for speed

        if (index >= chars.length) {
          el.textContent = chars;
          messages.scrollTop = messages.scrollHeight;
          clearInterval(interval);
        }
      }, 15);
    }

    function readHistory() {
      try {
        const hist = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        if (!Array.isArray(hist)) return [];
        return hist
          .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
          .slice(-12);
      } catch (e) {
        return [];
      }
    }

    function writeHistory(history) {
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-50)));
      } catch (e) { }
    }

    function getProductContext() {
      try {
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        if (!products.length) return '';

        return products.map(p =>
          `- ${p.name}: ₹${p.price}, ${p.stock > 0 ? `In Stock (${p.stock})` : 'Out of Stock'}`
        ).join('\n');
      } catch (e) {
        return '';
      }
    }

    async function sendToServer(message) {
      try {
        const history = readHistory();
        const productContext = getProductContext();

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, history, productContext }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.warn('Chatbot API error:', res.status, errorData);
          // If server is 500 (likely missing key) or similar, use fallback
          return getFallbackReply(message);
        }

        const data = await res.json();
        return data.reply || data.message || getFallbackReply(message);
      } catch (e) {
        console.error('Chatbot send error:', e);
        return getFallbackReply(message);
      }
    }

    // Simple rule-based fallback when AI is offline
    function getFallbackReply(message) {
      const lower = message.toLowerCase();

      if (lower.includes('hello') || lower.includes('hi')) {
        return "Hello! I'm currently in offline mode, but I can help you with basic queries. How can I assist you?";
      }
      if (lower.includes('order') || lower.includes('track')) {
        return "You can track your orders in the 'My Orders' section of your profile.";
      }
      if (lower.includes('payment') || lower.includes('pay')) {
        return "We accept payments via Razorpay (Cards, UPI, Netbanking). Secure and fast!";
      }
      if (lower.includes('contact') || lower.includes('support')) {
        return "You can reach our human support team at support@esunwal.com or call +977-9800000000.";
      }
      if (lower.includes('return') || lower.includes('refund')) {
        return "Returns are accepted within 7 days of delivery. Please check our return policy for details.";
      }

      return "I'm having trouble connecting to my brain right now. Please check your internet connection or try again later. For urgent help, contact support.";
    }

    async function handleSubmit(evt) {
      evt.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      appendMessage('user', text);
      input.value = '';
      setLoading(true);

      // Persist user message
      const currentHistory = readHistory();
      currentHistory.push({ role: 'user', content: text });
      writeHistory(currentHistory);

      appendTyping();
      const reply = await sendToServer(text);
      removeTyping();
      typeReply(reply);

      // Persist assistant message
      const updatedHistory = readHistory();
      updatedHistory.push({ role: 'assistant', content: reply });
      writeHistory(updatedHistory);

      setLoading(false);
    }

    toggle.addEventListener('click', () => {
      panel.hidden = false;
      input.focus();
    });

    closeBtn.addEventListener('click', () => {
      panel.hidden = true;
      toggle.focus();
    });

    form.addEventListener('submit', handleSubmit);

    try {
      // Back-compat: migrate old format once
      const old = JSON.parse(localStorage.getItem('chat_history') || '[]');
      if (Array.isArray(old) && old.length && !localStorage.getItem(HISTORY_KEY)) {
        const migrated = old
          .filter((m) => m && (m.sender === 'user' || m.sender === 'bot') && typeof m.text === 'string')
          .map((m) => ({ role: m.sender === 'bot' ? 'assistant' : 'user', content: m.text }));
        writeHistory(migrated);
      }

      const hist = readHistory();
      hist.forEach((m) => appendMessage(m.role === 'assistant' ? 'bot' : 'user', m.content));
    } catch (e) {
      console.error('Chatbot history load error:', e);
    }

    // Friendly greeting if empty
    if (messages.children.length === 0) {
      appendMessage('bot', "Hi! I'm your 24/7 support assistant. How can I help you today?");
      writeHistory([{ role: 'assistant', content: "Hi! I'm your 24/7 support assistant. How can I help you today?" }]);
    }

  }

})();

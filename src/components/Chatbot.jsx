import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import axios from 'axios';

import Draggable from 'react-draggable';

const Chatbot = ({ productContext }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const nodeRef = useRef(null); // Ref for Draggable to avoid findDOMNode warning

    // Load history from local storage on mount
    useEffect(() => {
        const savedHistory = localStorage.getItem('chat_history_v3');
        if (savedHistory) {
            try {
                setMessages(JSON.parse(savedHistory));
            } catch (e) {
                console.error('Failed to parse chat history', e);
            }
        } else {
            // Initial greeting
            const greeting = { role: 'assistant', content: "Hi! I'm your 24/7 support assistant. How can I help you today?" };
            setMessages([greeting]);
        }
    }, []);

    // Save history to local storage whenever messages change
    useEffect(() => {
        localStorage.setItem('chat_history_v3', JSON.stringify(messages.slice(-50)));
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Create a minimal product context string for the AI
    const getProductContextString = () => {
        if (!productContext || productContext.length === 0) return '';
        return productContext.map(p =>
            `- ${p.name}: ₹${p.price}, ${p.stock > 0 ? `In Stock (${p.stock})` : 'Out of Stock'}`
        ).join('\n');
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = { role: 'user', content: input.trim() };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const historyForApi = newMessages.slice(-10); // Send last 10 messages context
            const contextString = getProductContextString();

            const response = await axios.post('/api/chat', {
                message: userMsg.content,
                history: historyForApi,
                productContext: contextString
            });

            const botMsg = { role: 'assistant', content: response.data.reply };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error('Chat error:', error);
            let errorMessage = "I'm having trouble connecting right now. Please try again later.";

            if (error.response && error.response.data && error.response.data.reply) {
                errorMessage = error.response.data.reply;
            }

            const errorMsg = { role: 'assistant', content: errorMessage };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Draggable nodeRef={nodeRef} handle=".drag-handle">
            <div ref={nodeRef} className="fixed bottom-20 right-4 z-50 flex flex-col items-end pointer-events-auto">
                {/* Chat Window */}
                {isOpen && (
                    <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 h-[500px] flex flex-col mb-4 overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-5 fade-in duration-200">
                        {/* Header */}
                        <div className="bg-green-600 p-4 flex items-center justify-between text-white drag-handle cursor-move">
                            <div className="flex items-center gap-2">
                                <div className="bg-white/20 p-1.5 rounded-lg">
                                    <MessageSquare size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Support (24/7)</h3>
                                    <p className="text-xs opacity-80">AI Assistant</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                                onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking close
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`max-w-[85%] p-3 text-sm rounded-2xl ${msg.role === 'user'
                                        ? 'bg-green-600 text-white self-end rounded-br-none'
                                        : 'bg-white text-gray-800 border border-gray-200 self-start rounded-bl-none shadow-sm'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="self-start bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                                    <span className="text-xs text-gray-500">Typing...</span>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a question..."
                                className="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:bg-white transition-all outline-none"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="bg-green-600 text-white p-2 rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                )}

                {/* Toggle Button (Drag Handle when closed) */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`drag-handle w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 cursor-move ${isOpen ? 'bg-gray-200 text-gray-600 rotate-90' : 'bg-green-600 text-white'
                        }`}
                >
                    {isOpen ? <X size={24} /> : <MessageSquare size={28} />}
                </button>
            </div>
        </Draggable>
    );
};

export default Chatbot;

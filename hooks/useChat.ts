import { useState, useEffect } from 'react';
import { Message } from '../types';
import { GoogleGenAI } from "@google/genai";

const AI_BOT_GREETING: Message = {
    id: 'initial_greeting',
    text: "Hello! I'm your MinerX AI assistant. How can I help you today? You can ask me about crypto, mining, or how to use the app.",
    sender: 'ai',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export const useChat = () => {
    const [messages, setMessages] = useState<Message[]>(() => {
        const storedMessages = localStorage.getItem('minerx_chat_history');
        if (storedMessages) {
            return JSON.parse(storedMessages);
        }
        return [AI_BOT_GREETING];
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        localStorage.setItem('minerx_chat_history', JSON.stringify(messages));
    }, [messages]);

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;

        const newUserMessage: Message = {
            id: `msg_${Date.now()}`,
            text,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => [...prev, newUserMessage]);
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `You are a helpful AI assistant for a crypto mining app called MinerX. Keep your answers concise and friendly. User question: "${text}"`,
            });
            const aiText = response.text;

            const newAiMessage: Message = {
                id: `msg_ai_${Date.now()}`,
                text: aiText,
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, newAiMessage]);

        } catch (error) {
            console.error("Error getting response from Gemini:", error);
            const errorMessage: Message = {
                id: `msg_err_${Date.now()}`,
                text: "Sorry, I'm having trouble connecting right now. Please try again later.",
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return { messages, isLoading, sendMessage };
};

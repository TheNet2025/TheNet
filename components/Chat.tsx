import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import { Message } from '../types';
import { SendIcon, AppIcon } from './common/Icons';

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1 p-3 bg-secondary rounded-full">
        <div className="w-2 h-2 bg-text-muted-dark rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-text-muted-dark rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-text-muted-dark rounded-full animate-bounce"></div>
    </div>
);

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.sender === 'user';
    return (
        <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <AppIcon className="w-6 h-6" />
                </div>
            )}
            <div className={`max-w-[80%] px-4 py-3 rounded-3xl ${isUser ? 'bg-primary text-black rounded-br-lg' : 'bg-secondary text-text-dark rounded-bl-lg'}`}>
                <p className="text-base">{message.text}</p>
                <p className={`text-xs mt-1.5 opacity-70 ${isUser ? 'text-right' : 'text-left'}`}>{message.timestamp}</p>
            </div>
        </div>
    );
};

const Chat: React.FC = () => {
    const { messages, isLoading, sendMessage } = useChat();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(inputValue);
        setInputValue('');
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-5 border-b border-border-dark">
                <h1 className="text-2xl font-bold text-center text-text-dark">AI Assistant</h1>
            </div>
            <div className="flex-1 p-5 space-y-5 overflow-y-auto scrollbar-hide">
                {messages.map(msg => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                {isLoading && (
                    <div className="flex items-end gap-2 justify-start">
                         <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                            <AppIcon className="w-6 h-6" />
                         </div>
                        <TypingIndicator />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-background-dark border-t border-border-dark">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask me anything..."
                        className="flex-1 w-full bg-secondary border-2 border-border-dark rounded-full py-3 px-5 text-text-dark focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 outline-none"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        className="w-12 h-12 flex items-center justify-center bg-primary rounded-full text-black transition-transform duration-200 enabled:hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Send Message"
                    >
                        <SendIcon className="w-6 h-6" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;

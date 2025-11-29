import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';

const ChatBox = ({ messages, sendMessage, currentUserId, isSpaceKeyLoaded, onDelete }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-neutral-800 rounded-lg shadow-xl p-4 border border-neutral-200 dark:border-neutral-700">
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 p-2 scrollbar-thin scrollbar-thumb-primary-300 scrollbar-track-neutral-100 dark:scrollbar-thumb-neutral-600 dark:scrollbar-track-neutral-800">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isCurrentUser={message.sender_id === currentUserId}
              onDelete={onDelete} // Pass onDelete prop
            />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isSpaceKeyLoaded ? "Type your message..." : "Loading encryption keys..."}
          className="flex-1 p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-sm bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200"
          disabled={!isSpaceKeyLoaded}
        />
        <button
          type="submit"
          className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
          disabled={!isSpaceKeyLoaded}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
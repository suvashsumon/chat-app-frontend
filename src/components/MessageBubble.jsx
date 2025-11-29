import React from 'react';
import { motion } from 'framer-motion';

const MessageBubble = ({ message, isCurrentUser, onDelete }) => {
  const bubbleClass = isCurrentUser
    ? "bg-primary-500 text-white self-end rounded-br-none"
    : "bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 self-start rounded-bl-none";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`max-w-[70%] p-3 rounded-lg shadow-md ${bubbleClass} relative`}
    >
      {message.is_deleted ? (
        <p className="italic text-neutral-500 dark:text-neutral-400">Message is removed</p>
      ) : (
        <p>{message.content}</p>
      )}
      <p className="text-xs mt-1 opacity-75 text-neutral-700 dark:text-neutral-300">
        {message.sender_display_name || message.sender_id} - {new Date(message.timestamp).toLocaleString()}
      </p>
      {isCurrentUser && !message.is_deleted && (
        <button 
          onClick={() => onDelete(message.id)}
          className="absolute top-1 right-1 text-red-300 hover:text-red-500 text-xs p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
          title="Delete Message"
        >
          &times;
        </button>
      )}
    </motion.div>
  );
};

export default MessageBubble;

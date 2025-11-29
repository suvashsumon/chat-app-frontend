import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/ChatBox';
import axiosInstance from '../api/axiosInstance';
import { decryptWithAes, encryptWithAes, importAesKey, encryptWithPublicKey, exportAesKey, decryptWithPrivateKey } from '../utils/crypto';

const SpaceChat = () => {
  const { spaceId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [spaceKey, setSpaceKey] = useState(null);
  const [isSpaceKeyLoaded, setIsSpaceKeyLoaded] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteStatus, setInviteStatus] = useState('');
  const [members, setMembers] = useState([]); // New state for members
  const ws = useRef(null);
  const spaceKeyRef = useRef(spaceKey); // Ref to hold the latest spaceKey

  // Update the ref whenever spaceKey state changes
  useEffect(() => {
    spaceKeyRef.current = spaceKey;
  }, [spaceKey]);

  const fetchMembers = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/spaces/${spaceId}/members`);
      setMembers(response.data);
      console.log("[DEBUG Frontend] Members fetched:", response.data);
    } catch (error) {
      console.error("[DEBUG Frontend] Error fetching members:", error);
    }
  }, [spaceId]);

  useEffect(() => {
    if (!user) return;

    console.log("[DEBUG Frontend] useEffect triggered.");

    const fetchSpaceData = async () => {
      try {
        console.log("[DEBUG Frontend] Fetching space data...");
        
        const privateKey = localStorage.getItem('privateKey');
        if (!privateKey) {
          console.error("[DEBUG Frontend] Private key not found in local storage.");
          setInviteMessage("Error: Private key not found. Please re-register.");
          return;
        }

        // Fetch all spaces for the current user to find the encrypted_space_key for this space
        const userSpacesResponse = await axiosInstance.get('/spaces/me');
        const currentSpaceInfo = userSpacesResponse.data.find(space => space.id === parseInt(spaceId));

        if (!currentSpaceInfo || !currentSpaceInfo.encrypted_space_key) {
          console.error("[DEBUG Frontend] Encrypted space key not found for this space.");
          setInviteMessage("Error: Encrypted space key not found for this space.");
          return;
        }

        // Decrypt the space's AES key using the user's private RSA key
        const decryptedAesJwk = decryptWithPrivateKey(privateKey, currentSpaceInfo.encrypted_space_key);
        if (!decryptedAesJwk) {
          console.error("[DEBUG Frontend] Failed to decrypt AES space key.");
          setInviteMessage("Error: Failed to decrypt space key.");
          return;
        }
        console.log("[DEBUG Frontend] Decrypted AES JWK:", decryptedAesJwk);

        // Import the decrypted AES key
        const importedAesKey = await importAesKey(decryptedAesJwk);
        setSpaceKey(importedAesKey);
        setIsSpaceKeyLoaded(true);
        console.log("[DEBUG Frontend] Space key set and loaded.", importedAesKey);

        const response = await axiosInstance.get(`/messages/${spaceId}`);
        console.log("[DEBUG Frontend] Initial messages from backend:", response.data);
        const decryptedMessages = await Promise.all(response.data.map(async (msg) => {
          if (msg.is_deleted) return msg;
          try {
            const decryptedContent = await decryptWithAes(importedAesKey, msg.content);
            return { ...msg, content: decryptedContent };
          } catch (e) {
            console.error("Error decrypting message:", e);
            return { ...msg, content: "[Undecryptable Message]" };
          }
        }));
        setMessages(decryptedMessages);
        console.log("[DEBUG Frontend] Messages fetched and decrypted.");
      } catch (error) {
        console.error("[DEBUG Frontend] Error fetching space data:", error);
      }
    };

    fetchSpaceData();
    fetchMembers(); // Fetch members when component mounts or spaceId/user changes

    const token = localStorage.getItem('token');
    if (ws.current) {
      ws.current.close(); // Close existing connection if any
    }
    ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/${spaceId}?token=${token}`);
    console.log("[DEBUG Frontend] WebSocket connection attempt.");

    ws.current.onopen = () => {
      console.log("[DEBUG Frontend] WebSocket connected.");
    };
    ws.current.onmessage = async (event) => {
      console.log("[DEBUG Frontend] WebSocket message received.", event.data);
      const receivedMessage = JSON.parse(event.data);
      console.log("[DEBUG Frontend] Parsed received message:", receivedMessage);
      // Update message in state if it's a deleted message
      if (receivedMessage.is_deleted) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === receivedMessage.id ? { ...msg, is_deleted: 1 } : msg
          )
        );
        return;
      }

      // Only add if it's not our own message (optimistically added already)
      if (receivedMessage.sender_id !== user.id) { 
        try {
          // Use spaceKeyRef.current to get the latest spaceKey
          const decryptedContent = await decryptWithAes(spaceKeyRef.current, receivedMessage.content);
          setMessages((prevMessages) => [...prevMessages, { ...receivedMessage, content: decryptedContent }]);
        } catch (e) {
          console.error("Error decrypting received message:", e);
          setMessages((prevMessages) => [...prevMessages, { ...receivedMessage, content: "[Undecryptable Message]" }]);
        }
      }
    };

    ws.current.onclose = () => console.log("[DEBUG Frontend] WebSocket disconnected.");
    ws.current.onerror = (err) => console.error("[DEBUG Frontend] WebSocket error:", err);

    return () => {
      console.log("[DEBUG Frontend] WebSocket cleanup.");
      ws.current.close();
    };
  }, [spaceId, user, fetchMembers]);

  const sendMessage = async (content) => {
    console.log("[DEBUG Frontend] sendMessage called with content:", content);
    if (!spaceKey) {
      console.error("[DEBUG Frontend] Space key not available for encryption. Returning.");
      return;
    }
    try {
      console.log("[DEBUG Frontend] Encrypting message...");
      const encryptedContent = await encryptWithAes(spaceKey, content);
      console.log("[DEBUG Frontend] Encrypted content:", encryptedContent);
      const messageData = {
        content: encryptedContent,
        space_id: parseInt(spaceId),
        sender_id: user.id, 
        sender_display_name: user.display_name || user.username, // Include sender's display name
        timestamp: new Date().toISOString(),
      };
      console.log("[DEBUG Frontend] Sending message via POST to backend.", messageData);
      const response = await axiosInstance.post(`/messages/?space_id=${spaceId}`, { content: encryptedContent });
      console.log("[DEBUG Frontend] Backend response after sending message:", response.data);
      // Update the message in local state with the ID from the backend
      setMessages((prevMessages) => [...prevMessages, { ...response.data, content: content, sender_display_name: user.display_name || user.username }]); 
      console.log("[DEBUG Frontend] Message sent and added to local state with ID from backend.");
    } catch (error) {
      console.error("[DEBUG Frontend] Error sending message:", error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      // Optimistically update UI or wait for WebSocket broadcast
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, is_deleted: 1 } : msg
        )
      );
      console.log("[DEBUG Frontend] Message deleted locally.");
    } catch (error) {
      console.error("[DEBUG Frontend] Error deleting message:", error);
    }
  };

  const handleInviteUser = async () => {
    setInviteMessage('');
    setInviteStatus('');
    if (!inviteUsername) {
      setInviteMessage("Please enter a username to invite.");
      setInviteStatus('error');
      return;
    }
    if (!spaceKey) {
      setInviteMessage("Space key not loaded yet.");
      setInviteStatus('error');
      return;
    }

    try {
      // 1. Get invited user's public key
      const userToInviteResponse = await axiosInstance.get(`/users/${inviteUsername}/public_key`);
      const invitedUserPublicKey = userToInviteResponse.data.public_key;
      console.log("[DEBUG Frontend] Invited user public key:", invitedUserPublicKey);

      // 2. Export the current space's AES key (JWK format)
      const exportedAesJwk = await exportAesKey(spaceKey);
      console.log("[DEBUG Frontend] Exported AES JWK:", exportedAesJwk);

      // 3. Encrypt the exported AES key with the invited user's RSA public key
      const encryptedSpaceKey = encryptWithPublicKey(invitedUserPublicKey, exportedAesJwk);
      console.log("[DEBUG Frontend] Encrypted space key for invited user:", encryptedSpaceKey);

      if (!encryptedSpaceKey) {
        throw new Error("Failed to encrypt space key with invited user's public key.");
      }

      // 4. Add member to space
      await axiosInstance.post(
        `/spaces/${spaceId}/add_member`,
        {
          username: inviteUsername,
          encrypted_space_key: encryptedSpaceKey,
        }
      );
      setInviteMessage(`User ${inviteUsername} invited successfully!`);
      setInviteStatus('success');
      setInviteUsername('');
      fetchMembers(); // Refresh members list after inviting a user
    } catch (error) {
      console.error("[DEBUG Frontend] Error inviting user:", error);
      if (error.response) {
        console.error("[DEBUG Frontend] Error response:", error.response);
        console.error("[DEBUG Frontend] Error response data:", error.response.data);
        console.error("[DEBUG Frontend] Error response status:", error.response.status);
        console.error("[DEBUG Frontend] Error response headers:", error.response.headers);
      } else if (error.request) {
        console.error("[DEBUG Frontend] Error request:", error.request);
      } else {
        console.error("[DEBUG Frontend] Error message:", error.message);
      }
      setInviteMessage(error.response?.data?.detail || "Failed to invite user.");
      setInviteStatus('error');
    }
  };

  if (!user) {
    return <div className="text-center mt-8">Please log in to view this space.</div>;
  }

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-1/4 flex flex-col gap-4">
          {/* Invite User Section */}
          <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700">
            <h2 className="text-xl font-semibold mb-2 text-neutral-800 dark:text-neutral-200">
              Invite User
            </h2>
            <div className="flex flex-col gap-2 mt-2">
              <input
                type="text"
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
                placeholder="Username to invite..."
                className="flex-1 p-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200"
              />
              <button
                onClick={handleInviteUser}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
              >
                Invite
              </button>
            </div>
            {inviteMessage && <p className={`mt-2 text-sm text-center ${inviteStatus === 'success' ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>{inviteMessage}</p>}
          </div>

          {/* Members List Section */}
          <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 flex-1">
            <h2 className="text-xl font-semibold mb-2 text-neutral-800 dark:text-neutral-200">
              Members ({members.length})
            </h2>
            {members.length === 0 ? (
              <p className="text-neutral-600 dark:text-neutral-400">No members yet.</p>
            ) : (
              <ul className="list-disc list-inside text-neutral-700 dark:text-neutral-300 overflow-y-auto h-full">
                {members.map((member) => (
                  <li key={member.id}>{member.display_name || member.username}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Side Chat */}
        <div className="flex-1 h-full">
          <ChatBox messages={messages} sendMessage={sendMessage} currentUserId={user.id} isSpaceKeyLoaded={isSpaceKeyLoaded} onDelete={handleDeleteMessage} />
        </div>
      </div>
    </div>
  );
};

export default SpaceChat;

import { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage, RoomState } from '../types';

export function useVolatileChat(roomId: string | null, lifespanMinutes: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesRef = useRef<ChatMessage[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roomStateRef = useRef<RoomState | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (!roomId || lifespanMinutes <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const intervalMs = 3000;
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const safeLifespan = Math.max(1, lifespanMinutes);
      const maxAgeMs = safeLifespan * 60 * 1000;
      
      setMessages((prev) => {
        const filtered = prev.filter((m) => now - m.timestamp < maxAgeMs);
        messagesRef.current = filtered;
        return filtered;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [roomId, lifespanMinutes]);

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      const next = [...prev, msg].sort((a, b) => a.timestamp - b.timestamp);
      messagesRef.current = next;
      return next;
    });
  }, []);

  const addReaction = useCallback((messageId: string, emoji: string, peerId: string) => {
    setMessages((prev) => {
      return prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        
        const currentReactions = msg.reactions || {};
        const userList = currentReactions[emoji] || [];
        
        let newUserList;
        if (userList.includes(peerId)) {
          newUserList = userList.filter(id => id !== peerId);
        } else {
          newUserList = [...userList, peerId];
        }

        const updatedReactions = { ...currentReactions, [emoji]: newUserList };
        if (newUserList.length === 0) delete updatedReactions[emoji];

        const updatedMsg = { ...msg, reactions: updatedReactions };
        
        const nextRef = messagesRef.current.map(m => m.id === messageId ? updatedMsg : m);
        messagesRef.current = nextRef;
        
        return updatedMsg;
      });
    });
  }, []);

  const replaceHistory = useCallback((newMessages: ChatMessage[], roomState: RoomState) => {
    const now = Date.now();
    const safeLifespan = Math.max(1, roomState.lifespanMinutes);
    const maxAgeMs = safeLifespan * 60 * 1000;
    const filtered = newMessages.filter((m) => now - m.timestamp < maxAgeMs);
    const deduped = filtered.filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i);
    deduped.sort((a, b) => a.timestamp - b.timestamp);
    messagesRef.current = deduped;
    setMessages(deduped);
    roomStateRef.current = roomState;
  }, []);

  const clearMessages = useCallback(() => {
    messagesRef.current = [];
    setMessages([]);
    roomStateRef.current = null;
  }, []);

  return {
    messages,
    messagesRef,
    addMessage,
    addReaction,
    replaceHistory,
    clearMessages,
    roomStateRef,
  };
}
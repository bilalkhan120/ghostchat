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

    const intervalMs = 3000; // Fast 3-second cycle for precise decay tracking
    timerRef.current = setInterval(() => {
      const now = Date.now();
      // Added absolute boundary baseline to prevent race conditions during 1-min durations
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
    replaceHistory,
    clearMessages,
    roomStateRef,
  };
}
import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { ChatMessage, RoomState, PeerMessage } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface ActiveUser {
  peerId: string;
  userName: string;
  role: 'OWNER' | 'ADMIN' | 'USER';
  isTyping?: boolean;
}

export function usePeerNetwork(
  roomId: string | null,
  userName: string,
  onMessageReceived: (msg: ChatMessage) => void,
  onHistoryReceived: (messages: ChatMessage[], roomState: RoomState) => void,
  onSystemAlert: (text: string) => void,
  onForcedEviction: (reason: string) => void,
  onReactionReceived: (messageId: string, emoji: string, reactorId: string) => void
) {
  const [peerId] = useState<string>(() => {
    const saved = localStorage.getItem('ghostchat_peer_id');
    if (saved) return saved;
    const newId = `peer-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem('ghostchat_peer_id', newId);
    return newId;
  });
  
  const [connectedPeers, setConnectedPeers] = useState<number>(0);
  const [isMutedGlobally, setIsMutedGlobally] = useState(false);
  const [userRole, setUserRole] = useState<'OWNER' | 'ADMIN' | 'USER'>('USER');
  const [activeUsersList, setActiveUsersList] = useState<ActiveUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  const channelRef = useRef<any>(null);
  const knownPeersRef = useRef<Map<string, { name: string; role: 'OWNER' | 'ADMIN' | 'USER'; ts: number; isTyping: boolean }>>(new Map());

  const executeLazyCleanup = useCallback(async () => {
    try {
      const { data: expiredRooms } = await supabase.from('rooms').select('id, created_at, lifespan_minutes');
      if (expiredRooms) {
        const now = Date.now();
        for (const room of expiredRooms) {
          const expiryTime = new Date(room.created_at).getTime() + (room.lifespan_minutes * 60 * 1000);
          if (now > expiryTime) {
            await supabase.from('rooms').delete().eq('id', room.id);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadRoomHistory = useCallback(async (targetRoomId: string) => {
    try {
      const { data: roomData } = await supabase.from('rooms').select('*').eq('id', targetRoomId).single();
      if (!roomData) {
        localStorage.removeItem('ghostchat_current_room');
        window.location.reload();
        return;
      }

      setIsMutedGlobally(roomData.if_muted_globally || false);

      let calculatedRole: 'OWNER' | 'ADMIN' | 'USER' = 'USER';
      if (roomData.admin_peer_id === peerId) {
        calculatedRole = 'OWNER';
      } else {
        const savedAdmins = localStorage.getItem(`ghost_admins_${targetRoomId}`);
        const adminArray = savedAdmins ? JSON.parse(savedAdmins) : [];
        if (adminArray.includes(peerId)) calculatedRole = 'ADMIN';
      }
      setUserRole(calculatedRole);
        
      const { data: msgData } = await supabase.from('messages').select('*').eq('room_id', targetRoomId).order('timestamp', { ascending: true });
      if (msgData) {
        const formattedMessages: ChatMessage[] = msgData.map(m => ({
          id: m.id,
          text: m.text,
          senderId: m.sender_id,
          senderName: m.sender_name,
          timestamp: m.timestamp,
          isSystem: m.if_system_message,
          privilegeBadge: m.sender_privilege_badge,
          replyToId: m.reply_to_id,
          reactions: m.reactions || {}
        }));
        onHistoryReceived(formattedMessages, {
          id: targetRoomId,
          lifespanMinutes: roomData.lifespan_minutes,
          createdAt: new Date(roomData.created_at).getTime(),
          isAdmin: calculatedRole === 'OWNER'
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [peerId, onHistoryReceived]);

  const broadcast = useCallback((message: PeerMessage) => {
    if (!roomId || !channelRef.current) return;
    channelRef.current.send({
      type: 'broadcast',
      event: 'message',
      payload: { roomId, senderPeerId: peerId, senderRole: userRole, payload: message },
    });
  }, [roomId, peerId, userRole]);

  const sendTypingStatus = useCallback((isTyping: boolean) => {
    broadcast({ type: 'typing_status', payload: { peerId, isTyping } });
  }, [broadcast, peerId]);

  useEffect(() => {
    if (!roomId || !SUPABASE_URL || !SUPABASE_KEY) {
      setConnectedPeers(0);
      setUserRole('USER');
      setActiveUsersList([]);
      setTypingUsers([]);
      return;
    }

    executeLazyCleanup().then(() => loadRoomHistory(roomId));

    const channel = supabase.channel(`room_matrix_${roomId}`, { config: { broadcast: { self: false } } });
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'message' }, ({ payload: data }) => {
        if (!data || data.roomId !== roomId) return;

        const senderId = data.senderPeerId;
        const msg: PeerMessage = data.payload;

        if (msg.type === 'kick_peer' && msg.payload.peerId === peerId) {
          onForcedEviction("Direct Eviction Signal Received. Your communication access nodes have been severed by the administrator.");
          return;
        }

        if (msg.type === 'promote_peer' && msg.payload.targetId === peerId) {
          setUserRole('ADMIN');
          const saved = localStorage.getItem(`ghost_admins_${roomId}`);
          const adminArray = saved ? JSON.parse(saved) : [];
          if (!adminArray.includes(peerId)) adminArray.push(peerId);
          localStorage.setItem(`ghost_admins_${roomId}`, JSON.stringify(adminArray));
          onSystemAlert("⚡ Your local permissions have been elevated to [CO-ADMIN].");
        }

        if (msg.type === 'demote_peer' && msg.payload.targetId === peerId) {
          setUserRole('USER');
          const saved = localStorage.getItem(`ghost_admins_${roomId}`);
          let adminArray = saved ? JSON.parse(saved) : [];
          adminArray = adminArray.filter((id: string) => id !== peerId);
          localStorage.setItem(`ghost_admins_${roomId}`, JSON.stringify(adminArray));
          onSystemAlert("⚠️ Your administrative access privileges have been revoked.");
        }

        if (msg.type === 'toggle_mute_room') {
          setIsMutedGlobally(msg.payload.isMuted || false);
        }

        if (msg.type === 'typing_status') {
          const targetMap = knownPeersRef.current.get(senderId);
          if (targetMap) {
            targetMap.isTyping = msg.payload.isTyping || false;
            const currentTyping: string[] = [];
            knownPeersRef.current.forEach((v) => { if(v.isTyping) currentTyping.push(v.name); });
            setTypingUsers(currentTyping);
          }
          return;
        }

        if (msg.type === 'message_reaction' && msg.payload.messageId && msg.payload.reaction && msg.payload.peerId) {
          onReactionReceived(msg.payload.messageId, msg.payload.reaction, msg.payload.peerId);
          return;
        }

        if (data.senderPeerId === peerId) return;

        if (msg.type === 'peer_joined' && msg.payload.peerId && msg.payload.peerName) {
          const peerIncomingRole = data.senderRole || 'USER';
          knownPeersRef.current.set(senderId, { name: msg.payload.peerName, role: peerIncomingRole, ts: Date.now(), isTyping: false });
          setConnectedPeers(knownPeersRef.current.size);
          
          const users: ActiveUser[] = [];
          knownPeersRef.current.forEach((val, key) => {
            users.push({ peerId: key, userName: val.name, role: val.role, isTyping: val.isTyping });
          });
          setActiveUsersList(users);
        }

        if (msg.type === 'chat') {
          const payload = msg.payload as { message: ChatMessage };
          onMessageReceived(payload.message);
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'rooms' }, (payload) => {
        if (payload.old && payload.old.id === roomId) {
          onForcedEviction("This communication layer node has been forcefully purged by the Host Admin.");
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          broadcast({ type: 'peer_joined', payload: { peerId, peerName: userName } });
        }
      });

    const heartbeatInterval = setInterval(() => {
      broadcast({ type: 'peer_joined', payload: { peerId, peerName: userName } });
    }, 2000);

    const peerCleanupInterval = setInterval(() => {
      const now = Date.now();
      let changed = false;
      knownPeersRef.current.forEach((val, id) => {
        if (now - val.ts > 6000) {
          knownPeersRef.current.delete(id);
          changed = true;
        }
      });
      if (changed) {
        setConnectedPeers(knownPeersRef.current.size);
        const users: ActiveUser[] = [];
        const currentTyping: string[] = [];
        knownPeersRef.current.forEach((val, key) => {
          users.push({ peerId: key, userName: val.name, role: val.role, isTyping: val.isTyping });
          if (val.isTyping) currentTyping.push(val.name);
        });
        setActiveUsersList(users);
        setTypingUsers(currentTyping);
      }
    }, 3000);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(peerCleanupInterval);
      supabase.removeChannel(channel);
      channelRef.current = null;
      knownPeersRef.current.clear();
      setConnectedPeers(0);
      setActiveUsersList([]);
      setTypingUsers([]);
    };
  }, [roomId, peerId, userName, onMessageReceived, onReactionReceived, broadcast, loadRoomHistory, executeLazyCleanup, onSystemAlert, onForcedEviction]);

  const sendMessage = useCallback(async (message: ChatMessage) => {
    if (!roomId) return;
    broadcast({ type: 'chat', payload: { message } });

    await supabase.from('messages').insert({
      id: message.id,
      room_id: roomId,
      text: message.text,
      sender_id: message.senderId,
      sender_name: message.senderName,
      timestamp: message.timestamp,
      if_system_message: message.isSystem || false,
      sender_privilege_badge: message.privilegeBadge || 'USER',
      reply_to_id: message.replyToId || null,
      reactions: message.reactions || {}
    });
  }, [roomId, broadcast]);

  const sendReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!roomId) return;
    broadcast({ type: 'message_reaction', payload: { messageId, reaction: emoji, peerId } });
    
    const { data } = await supabase.from('messages').select('reactions').eq('id', messageId).single();
    if (data) {
      const currentReactions = data.reactions || {};
      let userList = currentReactions[emoji] || [];
      if (userList.includes(peerId)) {
        userList = userList.filter((id: string) => id !== peerId);
      } else {
        userList = [...userList, peerId];
      }
      
      currentReactions[emoji] = userList;
      if (userList.length === 0) delete currentReactions[emoji];
      
      await supabase.from('messages').update({ reactions: currentReactions }).eq('id', messageId);
    }
  }, [roomId, peerId, broadcast]);

  const handlePromotionControl = useCallback(async (targetId: string, commandType: 'PROMOTE' | 'DEMOTE' | 'KICK') => {
    if (userRole === 'USER') return;
    if (commandType === 'PROMOTE') {
      broadcast({ type: 'promote_peer', payload: { targetId } });
    } else if (commandType === 'DEMOTE') {
      broadcast({ type: 'demote_peer', payload: { targetId } });
    } else if (commandType === 'KICK') {
      broadcast({ type: 'kick_peer', payload: { peerId: targetId } });
    }
    setTimeout(() => {
      broadcast({ type: 'peer_joined', payload: { peerId, peerName: userName } });
    }, 400);
  }, [userRole, broadcast, peerId, userName]);

  const toggleGlobalRoomMute = useCallback(async () => {
    if (userRole === 'USER') return;
    const updateTarget = !isMutedGlobally;
    setIsMutedGlobally(updateTarget);
    broadcast({ type: 'toggle_mute_room', payload: { isMuted: updateTarget } });
    await supabase.from('rooms').update({ if_muted_globally: updateTarget }).eq('id', roomId);
  }, [roomId, userRole, isMutedGlobally, broadcast]);

  const destroyRoomInstantly = useCallback(async () => {
    if (userRole !== 'OWNER') return;
    await supabase.from('rooms').delete().eq('id', roomId);
  }, [roomId, userRole]);

  return {
    peerId,
    connectedPeers,
    isAdmin: userRole === 'OWNER',
    userRole,
    isMutedGlobally,
    activeUsersList,
    typingUsers,
    sendMessage,
    sendReaction,
    sendTypingStatus,
    handlePromotionControl,
    toggleGlobalRoomMute,
    destroyRoomInstantly
  };
}
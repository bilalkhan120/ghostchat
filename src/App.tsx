import { useState, useCallback, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { createClient } from '@supabase/supabase-js';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { CreateRoomModal } from './components/CreateRoomModal';
import { useVolatileChat } from './hooks/useVolatileChat';
import { usePeerNetwork } from './hooks/usePeerNetwork';
import { ShieldAlert } from 'lucide-react';
import type { ChatMessage, RoomState } from './types';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL || '', import.meta.env.VITE_SUPABASE_ANON_KEY || '');

function generateRoomId() {
  return `GHOST-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
}

function getInitialUserName() {
  const savedName = localStorage.getItem('ghostchat_username');
  if (savedName) return savedName;
  const adjectives = ['Cyber', 'Crypto', 'Proxy', 'Vector', 'Matrix', 'Binary', 'Kernel', 'Quantum'];
  const nouns = ['Node', 'Daemon', 'Shell', 'Client', 'Socket', 'Trace', 'Stack', 'Static'];
  const generated = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}`;
  localStorage.setItem('ghostchat_username', generated);
  return generated;
}

export default function App() {
  const [roomId, setRoomId] = useState<string | null>(() => localStorage.getItem('ghostchat_current_room'));
  const [userName, setUserName] = useState<string>(getInitialUserName());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [lifespanMinutes, setLifespanMinutes] = useState(60);
  const [appNoticeMessage, setAppNoticeMessage] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const [activeRooms, setActiveRooms] = useState<string[]>(() => {
    const saved = localStorage.getItem('ghostchat_history_list');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (roomId) {
      document.title = `🔒 [${roomId}] Active Layer // GhostChat`;
    } else {
      document.title = `GhostChat // Secure Volatile Node`;
    }
    setIsMobileSidebarOpen(false);
  }, [roomId]);

  // Global background daemon monitoring loop to track multi-room lifespans simultaneously
  useEffect(() => {
    if (activeRooms.length === 0) return;

    const executeBackgroundSyncCheck = async () => {
      // Query index to verify which rooms are still alive in database
      const { data } = await supabase.from('rooms').select('id').in('id', activeRooms);
      const aliveIds = data ? data.map(r => r.id) : [];

      // Detect if any background history segments have expired naturally
      const expiredRooms = activeRooms.filter(id => !aliveIds.includes(id));
      
      if (expiredRooms.length > 0) {
        expiredRooms.forEach((deadId) => {
          // If the currently open room just died, handle eviction cleanup routes
          if (deadId === roomId) {
            localStorage.removeItem('ghostchat_current_room');
            setRoomId(null);
            setAppNoticeMessage(`🕒 TIME LIMIT EXPIRED: Secure corridor segment [${deadId}] has reached its 24hr or configured decay boundary parameters and self-destructed completely.`);
          } else {
            // Push notification warning background alert to screen context 
            setAppNoticeMessage(`⚠️ BACKGROUND VECTOR DECAYED: Your background session [${deadId}] has hit its maximum lifespan constraint and vanished from the index.`);
          }
          
          // Scrub local arrays clean of dead elements
          setActiveRooms((prev) => {
            const filtered = prev.filter(id => id !== deadId);
            localStorage.setItem('ghostchat_history_list', JSON.stringify(filtered));
            return filtered;
          });
        });
      }
    };

    const backgroundTrackerThread = setInterval(executeBackgroundSyncCheck, 5000);
    return () => clearInterval(backgroundTrackerThread);
  }, [activeRooms, roomId]);

  const { messages, addMessage, replaceHistory, clearMessages } = useVolatileChat(roomId, lifespanMinutes);

  const handleMessageReceived = useCallback((msg: ChatMessage) => { addMessage(msg); }, [addMessage]);
  const handleHistoryReceived = useCallback((newMessages: ChatMessage[], roomState: RoomState) => {
    replaceHistory(newMessages, roomState);
    setLifespanMinutes(roomState.lifespanMinutes);
  }, [replaceHistory]);

  const handleSystemAlert = useCallback((text: string) => {
    addMessage({ id: nanoid(), text, senderId: 'SYSTEM', senderName: 'SYSTEM', timestamp: Date.now(), isSystem: true });
  }, [addMessage]);

  const removeRoomFromHistory = useCallback((deadId: string) => {
    setActiveRooms((prev) => {
      const filtered = prev.filter(id => id !== deadId);
      localStorage.setItem('ghostchat_history_list', JSON.stringify(filtered));
      return filtered;
    });
    localStorage.removeItem('ghostchat_current_room');
    setRoomId(null);
  }, []);

  const handleForcedEvictionAction = useCallback(async (reason: string) => {
    if (!roomId) return;
    const trackingId = roomId;
    removeRoomFromHistory(trackingId);

    const { data } = await supabase.from('rooms').select('id').eq('id', trackingId).maybeSingle();
    if (!data) {
      setAppNoticeMessage(`🕒 TIME LIMIT EXPIRED: Volatile segment corridor [${trackingId}] reached its lifespan bound parameters and auto-destructed successfully.`);
    } else {
      setAppNoticeMessage(`🔒 NODE TERMINATED MANUALLY: ${reason}`);
    }
  }, [roomId, removeRoomFromHistory]);

  const { peerId, connectedPeers, userRole, isMutedGlobally, activeUsersList, typingUsers, sendMessage, sendTypingStatus, handlePromotionControl, toggleGlobalRoomMute } = usePeerNetwork(
    roomId, userName, handleMessageReceived, handleHistoryReceived, handleSystemAlert, handleForcedEvictionAction
  );

  const handleSetUserName = useCallback((newName: string) => {
    setUserName(newName);
    localStorage.setItem('ghostchat_username', newName);
  }, []);

  useEffect(() => {
    if (roomId) {
      localStorage.setItem('ghostchat_current_room', roomId);
      setActiveRooms((prev) => {
        const updated = prev.includes(roomId) ? prev : [...prev, roomId];
        localStorage.setItem('ghostchat_history_list', JSON.stringify(updated));
        return updated;
      });
    }
    clearMessages();
  }, [roomId, clearMessages]);

  const handleCreateRoom = useCallback(async (selectedLifespan: number) => {
    const newRoomId = generateRoomId();
    setLifespanMinutes(selectedLifespan);
    setRoomId(newRoomId);

    await supabase.from('rooms').insert({ id: newRoomId, lifespan_minutes: selectedLifespan, admin_peer_id: peerId, if_muted_globally: false });
    await supabase.from('messages').insert({
      id: nanoid(), room_id: newRoomId, text: `👑 CORE MATRIX STACK LOGGED BY HOST OWNER (${userName})`,
      sender_id: 'SYSTEM', sender_name: 'SYSTEM', timestamp: Date.now(), if_system_message: true, sender_privilege_badge: 'OWNER'
    });

    setShowCreateModal(false);
  }, [peerId, userName]);

  const handleJoinRoom = useCallback(async (id: string) => {
    const cleanId = id.trim().toUpperCase();
    if (!cleanId.startsWith('GHOST-')) {
      setAppNoticeMessage('Invalid Vector Format. Identifiers must use prefix GHOST-XXXXX');
      return;
    }
    
    const { data } = await supabase.from('rooms').select('id, lifespan_minutes').eq('id', cleanId).maybeSingle();
    if (!data) {
      setAppNoticeMessage("This room layer vector has expired, self-destructed, or does not exist on the network index.");
      removeRoomFromHistory(cleanId);
      return;
    }

    setLifespanMinutes(data.lifespan_minutes);
    setRoomId(cleanId);
  }, [removeRoomFromHistory]);

  const handleLeaveRoom = useCallback(() => {
    localStorage.removeItem('ghostchat_current_room');
    setRoomId(null);
  }, []);

  const handleSendMessage = useCallback((text: string, isSystem = false) => {
    if (!roomId || !peerId) return;
    const msg: ChatMessage = { id: nanoid(), text, senderId: peerId, senderName: userName, timestamp: Date.now(), isSystem, privilegeBadge: userRole };
    addMessage(msg);
    sendMessage(msg);
  }, [roomId, peerId, userName, userRole, addMessage, sendMessage]);

  const handleDestroyRoomAction = useCallback(async () => {
    if (!roomId || userRole !== 'OWNER') return;
    const structuralTargetId = roomId;
    removeRoomFromHistory(structuralTargetId);
    await supabase.from('rooms').delete().eq('id', structuralTargetId);
  }, [roomId, userRole, removeRoomFromHistory]);

  return (
    <div className="h-screen w-screen flex bg-[#0b0c10] text-white overflow-hidden font-sans selection:bg-emerald-500/30 relative">
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden block transition-opacity duration-200" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      <Sidebar
        currentRoomId={roomId} rooms={activeRooms} onCreateRoom={() => setShowCreateModal(true)} onJoinRoom={handleJoinRoom} onLeaveRoom={handleLeaveRoom}
        connectedPeers={connectedPeers} isConnecting={false} activeUsersList={activeUsersList} userRole={userRole} onPromotionControl={handlePromotionControl}
        isOpenMobile={isMobileSidebarOpen} onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />
      <ChatArea
        roomId={roomId} messages={messages} userName={userName} peerId={peerId} onSendMessage={handleSendMessage} onSetUserName={handleSetUserName}
        connectedPeers={connectedPeers} onDestroyRoom={handleDestroyRoomAction} roomLifespanMinutes={lifespanMinutes} userRole={userRole}
        isMutedGlobally={isMutedGlobally} onToggleMute={toggleGlobalRoomMute} typingUsers={typingUsers} onTypingStatusChange={sendTypingStatus}
        onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        onCreateRoomTrigger={() => setShowCreateModal(true)}
        onJoinRoomTrigger={handleJoinRoom}
      />
      {showCreateModal && <CreateRoomModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateRoom} />}

      {appNoticeMessage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#10121a]/90 backdrop-blur-2xl border border-white/5 rounded-2xl p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 mint-glow">
              <ShieldAlert size={20} className="animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white tracking-wide">Network Matrix Operations Alert</h3>
              <p className="text-xs text-[#828599] leading-relaxed pt-1 px-1">{appNoticeMessage}</p>
            </div>
            <div className="pt-2">
              <button onClick={() => setAppNoticeMessage(null)} className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#050508] text-xs font-bold transition-all duration-200 active:scale-95">
                Acknowledge Protocol Sequence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
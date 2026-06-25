import { useState, useRef, useEffect } from 'react';
import { Send, User, Copy, Check, Trash2, Radio, Clock, AlertTriangle, Lock, ServerCrash, Flame, Fingerprint, Volume2, VolumeX, Key, Eye } from 'lucide-react';
import type { ChatMessage } from '../types';

interface ChatAreaProps {
  roomId: string | null;
  messages: ChatMessage[];
  userName: string;
  peerId: string | null;
  onSendMessage: (text: string, isSystem?: boolean) => void;
  onSetUserName: (name: string) => void;
  connectedPeers: number;
  onDestroyRoom?: () => void;
  roomLifespanMinutes: number;
  userRole?: 'OWNER' | 'ADMIN' | 'USER';
  isMutedGlobally?: boolean;
  onToggleMute?: () => void;
  typingUsers?: string[];
  onTypingStatusChange?: (isTyping: boolean) => void;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ChatArea({
  roomId,
  messages,
  userName,
  peerId,
  onSendMessage,
  onSetUserName,
  connectedPeers,
  onDestroyRoom,
  roomLifespanMinutes,
  userRole = 'USER',
  isMutedGlobally = false,
  onToggleMute,
  typingUsers = [],
  onTypingStatusChange,
}: ChatAreaProps) {
  const [inputText, setInputText] = useState('');
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [copied, setCopied] = useState(false);
  const [showDestructModal, setShowDestructModal] = useState(false);
  const [timeLeftStr, setTimeLeftStr] = useState('');
  const [isTypingLocal, setIsTypingLocal] = useState(false);
  const typingTimeoutRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roomId) return;

    const targetEndTime = Date.now() + roomLifespanMinutes * 60 * 1000;
    const updateClock = () => {
      const remainingMs = targetEndTime - Date.now();
      if (remainingMs <= 0) {
        setTimeLeftStr('Expired');
        return;
      }
      const totalSecs = Math.floor(remainingMs / 1000);
      const hrs = Math.floor(totalSecs / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);
      const secs = totalSecs % 60;

      if (hrs > 0) {
        setTimeLeftStr(`${hrs}h ${mins}m`);
      } else {
        setTimeLeftStr(`${mins}m ${secs}s`);
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [roomId, roomLifespanMinutes]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputText(value);
    
    if (!isTypingLocal) {
      setIsTypingLocal(true);
      onTypingStatusChange?.(true);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTypingLocal(false);
      onTypingStatusChange?.(false);
    }, 2000);
  };

  const handleSend = () => {
    if (!inputText.trim() || !roomId) return;
    if (isMutedGlobally && userRole === 'USER') return;
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsTypingLocal(false);
    onTypingStatusChange?.(false);

    onSendMessage(inputText.trim(), false);
    setInputText('');
  };

  if (!roomId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0b0c10] relative overflow-hidden p-6 select-none z-10 font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.02] pointer-events-none" />
        
        <div className="max-w-2xl w-full text-left space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-h-full flex flex-col justify-center relative z-10">
          <div className="flex items-center gap-4 border-b border-white/5 pb-5 shrink-0">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/5 shrink-0 mint-glow">
              <Radio size={20} className="text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">Zero-Trace Communications Core</h2>
              <p className="text-xs text-[#626475] font-medium mt-0.5">Isolated ephemeral matrix layers completely free from metadata retention pipelines.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[50vh] pr-1 scrollbar-thin">
            <div className="p-4 rounded-2xl bg-[#12141d]/40 premium-glass border border-white/5 smooth-lift transition-all duration-300 space-y-2 group">
              <div className="flex items-center gap-2.5 text-emerald-400 font-medium text-xs uppercase tracking-wide">
                <Lock size={14} className="group-hover:rotate-12 transition-transform duration-300" />
                <span>Zero-Knowledge Channels</span>
              </div>
              <p className="text-[11px] text-[#86899f] leading-relaxed">Standard text layers travel over open data grids monitored by corporate filters. GhostChat structures sandboxed tunnels—ensuring even our source developers hold absolute zero keys to intercept transmissions.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#12141d]/40 premium-glass border border-white/5 smooth-lift transition-all duration-300 space-y-2 group">
              <div className="flex items-center gap-2.5 text-blue-400 font-medium text-xs uppercase tracking-wide">
                <Fingerprint size={14} className="group-hover:scale-110 transition-transform duration-300" />
                <span>Anonymized Footprints</span>
              </div>
              <p className="text-[11px] text-[#86899f] leading-relaxed">Big Tech tracks who you message, your device IDs, IP addresses, and exact timestamps. GhostChat generates automated dynamic peer signatures on launch. No hardware identifiers, data pools, or user metrics are compiled or retained.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#12141d]/40 premium-glass border border-white/5 smooth-lift transition-all duration-300 space-y-2 group">
              <div className="flex items-center gap-2.5 text-amber-400 font-medium text-xs uppercase tracking-wide">
                <Flame size={14} />
                <span>Volatile Decay Shards</span>
              </div>
              <p className="text-[11px] text-[#86899f] leading-relaxed">Chat elements are held strictly within volatile server caches, completely eliminating storage drives. The millisecond the matrix clock terminates, a script scrubs cloud record sectors past forensic restoration.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#12141d]/40 premium-glass border border-white/5 smooth-lift transition-all duration-300 space-y-2 group">
              <div className="flex items-center gap-2.5 text-red-400 font-medium text-xs uppercase tracking-wide">
                <ServerCrash size={14} />
                <span>Total Host Command</span>
              </div>
              <p className="text-[11px] text-[#86899f] leading-relaxed">Ordinary apps grant users the power to extract data logs, capture screens, or linger in chats indefinitely. The Host Admin retains absolute cryptographic veto authority—enabling real-time user eviction (Kicking Node Links) or firing an emergency wipe command.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#12141d]/40 premium-glass border border-white/5 smooth-lift transition-all duration-300 space-y-2 group">
              <div className="flex items-center gap-2.5 text-cyan-400 font-medium text-xs uppercase tracking-wide">
                <Key size={14} />
                <span>Invisible Discovery</span>
              </div>
              <p className="text-[11px] text-[#86899f] leading-relaxed">Connection paths are bound exclusively to the unique `GHOST-` vector matrix string. There are no central room indices, public lookups, or exposed discovery lists. If you do not possess the alphanumeric key sequence, the node remains mathematically invisible.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#12141d]/40 premium-glass border border-white/5 smooth-lift transition-all duration-300 space-y-2 group">
              <div className="flex items-center gap-2.5 text-purple-400 font-medium text-xs uppercase tracking-wide">
                <Eye size={14} />
                <span>Isolated Client Sandbox</span>
              </div>
              <p className="text-[11px] text-[#86899f] leading-relaxed">Runs completely out of secure local browser allocations. There is no background syncing, device file system exploration, or hidden third-party tracking cookies enabled. Absolute containment, total tactical execution.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/[0.02] border border-emerald-500/10 flex items-center justify-center gap-3 text-center text-[10px] font-mono font-bold text-emerald-400/80 tracking-widest shrink-0">
            <Radio size={12} className="animate-ping shrink-0" />
            <span>AWAITING LINK INITIALIZATION // CONFIGURE TERMINAL CONSOLE TO CONNECT</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0b0c10] relative overflow-hidden font-sans z-10">
      <div className="h-16 border-b border-white/5 bg-[#0e1017]/40 backdrop-blur-md flex items-center justify-between px-5 z-10 select-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mint-glow">
            <User size={15} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5 font-mono">
              {roomId} 
              {userRole !== 'USER' && <span className="text-[8px] font-sans bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded border-emerald-500/20 font-bold">{userRole === 'OWNER' ? 'Main Host' : 'Co-Admin'}</span>}
            </p>
            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#626475] font-semibold">
              <p>{connectedPeers + 1} ACTIVE SEGMENTS</p>
              <span>|</span>
              <p className="text-amber-500/90 flex items-center gap-1"><Clock size={11} /> LAYER DECAY: {timeLeftStr}</p>
              {isMutedGlobally && <span className="text-red-400 font-bold bg-red-500/5 border border-red-500/20 px-1 rounded text-[8px] animate-pulse">MUTED</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {userRole !== 'USER' && (
            <button
              onClick={onToggleMute}
              className={`p-2 rounded-xl border transition-all duration-300 active:scale-[0.9] ${isMutedGlobally ? 'bg-red-500/10 border-red-500/20 text-red-400 shadow-md shadow-red-500/5' : 'bg-white/[0.02] border-white/5 text-[#828599] hover:text-white hover:border-white/10'}`}
              title={isMutedGlobally ? "Unlock Room Transmission" : "Lock Room Transmission (Mute All Users)"}
            >
              {isMutedGlobally ? <VolumeX size={14} className="animate-pulse" /> : <Volume2 size={14} />}
            </button>
          )}

          <button
            onClick={() => { navigator.clipboard.writeText(roomId); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 text-[#828599] text-xs font-bold transition-all duration-300 active:scale-[0.96]"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            {copied ? 'KEY COPIED' : 'EXTRACT KEY'}
          </button>
          
          {userRole === 'OWNER' && (
            <button
              onClick={() => setShowDestructModal(true)}
              className="p-2 rounded-xl bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 text-red-400 transition-all duration-300 active:scale-[0.9]"
              title="Terminate Layer Connection"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4 scrollbar-thin">
        {messages.map((msg) => {
          if (msg.isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-2 animate-in fade-in zoom-in-95 duration-300 select-none">
                <span className="text-[9px] tracking-wide font-mono bg-white/[0.02] border border-white/5 text-emerald-400/90 px-3 py-1 rounded-full font-bold shadow-sm">
                  {msg.text}
                </span>
              </div>
            );
          }

          const isOwn = msg.senderId === peerId;
          const msgRole = msg.privilegeBadge || 'USER';

          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}>
              <div className={`max-w-[65%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                {!isOwn && (
                  <span className="text-[10px] text-[#626475] mb-1 font-bold tracking-wide flex items-center gap-1.5">
                    {msg.senderName}
                    {msgRole === 'OWNER' && <span className="text-[7px] text-red-400 bg-red-500/5 px-1 rounded border border-red-500/10 font-black font-mono">HOST</span>}
                    {msgRole === 'ADMIN' && <span className="text-[7px] text-amber-400 bg-amber-500/5 px-1 rounded border border-amber-500/10 font-black font-mono">ADMIN</span>}
                  </span>
                )}
                <div className={`px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed shadow-sm border transition-all duration-300 ${
                  isOwn 
                    ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-tr-none border-emerald-500/20 shadow-md shadow-emerald-950/10' 
                    : 'bg-white/[0.02] text-[#c4c6d6] border-white/5 rounded-tl-none premium-glass'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[9px] text-[#424454] font-bold mt-1 select-none font-mono">{formatTime(msg.timestamp)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-5 py-0.5 text-[10px] text-emerald-400/60 font-medium h-4 min-h-4 select-none transition-all duration-300">
        {typingUsers.length > 0 && (
          <span className="flex items-center gap-1 animate-pulse font-mono text-[9px] tracking-wide">
            ⚡ {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} writing message blocks...
          </span>
        )}
      </div>

      <div className="border-t border-white/5 bg-[#0e1017]/40 backdrop-blur-md p-4">
        <div className="flex items-center gap-3">
          {showNameEdit ? (
            <div className="flex items-center gap-2 flex-1 animate-in fade-in duration-200">
              <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="flex-1 bg-white/[0.02] border border-white/5 focus:border-emerald-500 focus:outline-none rounded-xl px-3 py-2 text-xs text-white font-medium" />
              <button onClick={() => { if(tempName.trim()) { onSetUserName(tempName.trim()); setShowNameEdit(false); } }} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[#050508] text-xs font-bold transition-colors">Save</button>
            </div>
          ) : (
            <>
              <button onClick={() => { setShowNameEdit(true); setTempName(userName); }} className="px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] text-[#828599] hover:text-white text-xs font-bold truncate max-w-[120px] transition-all duration-200">{userName}</button>
              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={(e) => { if(e.key==='Enter') handleSend(); }}
                disabled={isMutedGlobally && userRole === 'USER'}
                placeholder={isMutedGlobally && userRole === 'USER' ? "Transmission layer locked by administrators..." : "Type your message..."}
                className="flex-1 bg-white/[0.02] border border-white/5 focus:border-emerald-500/30 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-white font-medium disabled:opacity-40 transition-all duration-300"
              />
              <button onClick={handleSend} disabled={!inputText.trim() || (isMutedGlobally && userRole === 'USER')} className="w-9 h-9 rounded-xl bg-emerald-600 text-[#050508] flex items-center justify-center disabled:opacity-20 hover:bg-emerald-500 transition-all duration-300 shrink-0 active:scale-90 shadow-lg shadow-emerald-600/10"><Send size={14} /></button>
            </>
          )}
        </div>
      </div>

      {showDestructModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#10111a] border border-white/5 rounded-2xl p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-11 h-11 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle size={20} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">Execute Matrix Purge?</h3>
              <p className="text-xs text-[#828599] mt-2 leading-relaxed">This completely clears current active database rows and deletes message vectors from memory pools. This action cannot be undone.</p>
            </div>
            <div className="flex gap-2.5 justify-center pt-1.5 text-xs font-bold">
              <button onClick={() => setShowDestructModal(false)} className="px-4 py-2 rounded-xl border border-white/5 hover:bg-white/[0.02] text-[#626475] hover:text-white transition-colors">Abort</button>
              <button onClick={() => { setShowDestructModal(false); onDestroyRoom?.(); }} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg shadow-red-600/10 active:scale-95">Purge Channel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
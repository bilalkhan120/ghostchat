import { useState, useRef, useEffect } from 'react';
import { Send, Shield, Zap, Volume2, VolumeX, Trash2, Menu, Plus, Key, Copy, Check, Clock } from 'lucide-react';
import type { ChatMessage } from '../types';

interface ChatAreaProps {
  roomId: string | null;
  messages: ChatMessage[];
  userName: string;
  peerId: string | null;
  onSendMessage: (text: string) => void;
  onSetUserName: (name: string) => void;
  connectedPeers: number;
  onDestroyRoom: () => void;
  roomLifespanMinutes: number;
  userRole: string;
  isMutedGlobally: boolean;
  onToggleMute: () => void;
  typingUsers: string[];
  onTypingStatusChange: (isTyping: boolean) => void;
  onOpenMobileMenu: () => void;
  onCreateRoomTrigger?: () => void;
  onJoinRoomTrigger?: (id: string) => void;
  timeRemainingText?: string;
  isUrgentExpiry?: boolean;
}

export function ChatArea({
  roomId,
  messages,
  userName,
  peerId,
  onSendMessage,
  onSetUserName,
  onDestroyRoom,
  userRole,
  isMutedGlobally,
  onToggleMute,
  typingUsers,
  onTypingStatusChange,
  onOpenMobileMenu,
  onCreateRoomTrigger,
  onJoinRoomTrigger,
  timeRemainingText = "Calculating...",
  isUrgentExpiry = false,
}: ChatAreaProps) {
  const [inputText, setInputText] = useState('');
  const [mobileJoinInput, setMobileJoinInput] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [copied, setCopied] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
    onTypingStatusChange(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    onTypingStatusChange(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTypingStatusChange(false);
    }, 2000);
  };

  const saveName = () => {
    if (nameInput.trim()) onSetUserName(nameInput.trim());
    setEditingName(false);
  };

  const handleMobileJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileJoinInput.trim() || !onJoinRoomTrigger) return;
    onJoinRoomTrigger(mobileJoinInput.trim().toUpperCase());
    setMobileJoinInput('');
  };

  const executeCopy = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(`${window.location.origin}/?room=${roomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex-1 flex flex-col min-w-0 bg-[#0b0c10] relative h-full transition-all duration-300
      ${isUrgentExpiry ? 'border-2 border-red-500/40 animate-pulse shadow-2xl shadow-red-500/5' : ''}`}
    >
      <div className="h-16 border-b border-white/[0.04] bg-[#0f111a]/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onOpenMobileMenu} className="md:hidden p-2 rounded-xl text-[#828599] hover:text-white hover:bg-white/5 transition-all">
            <Menu size={18} />
          </button>
          
          {roomId ? (
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-lg tracking-wider truncate">
                {roomId}
              </span>
              <button onClick={executeCopy} className="p-1.5 rounded-lg text-[#828599] hover:text-white hover:bg-white/5 transition-colors">
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-mono text-[#828599]">
                <Clock size={10} className={isUrgentExpiry ? 'text-red-400 animate-spin' : ''} />
                <span className={isUrgentExpiry ? 'text-red-400 font-bold' : 'text-white'}>{timeRemainingText}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-emerald-400 animate-pulse" />
              <span className="text-xs font-bold tracking-wider text-[#828599] uppercase">Grid Standby Matrix</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {roomId && (
            <div className="sm:hidden flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg text-[10px] font-mono text-white border border-white/5">
              <span>{timeRemainingText}</span>
            </div>
          )}

          {roomId && userRole === 'OWNER' && (
            <button onClick={onToggleMute} className={`p-2 rounded-xl border transition-all ${isMutedGlobally ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-white/[0.01] text-[#828599] border-white/[0.04]'}`}>
              {isMutedGlobally ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          )}

          {roomId && userRole === 'OWNER' && (
            <button onClick={onDestroyRoom} className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20">
              <Trash2 size={14} />
            </button>
          )}

          <div className="bg-[#151824] border border-white/[0.03] rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 text-xs">
            {editingName ? (
              <input
                type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} onBlur={saveName}
                onKeyDown={(e) => e.key === 'Enter' && saveName()} autoFocus className="bg-transparent text-white font-semibold border-none focus:outline-none w-16 sm:w-24 text-xs"
              />
            ) : (
              <span onClick={() => setEditingName(true)} className="font-semibold text-emerald-400 cursor-pointer truncate max-w-[70px] sm:max-w-[100px]">
                {userName}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin scrollbar-thumb-white/5">
        {roomId ? (
          <>
            {messages.map((msg) => {
              const isMe = msg.senderId === peerId;
              if (msg.isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center select-none animate-in fade-in duration-150">
                    <span className="text-[9px] font-mono tracking-wide text-[#4c4e5e] bg-white/[0.01] border border-white/[0.02] px-2.5 py-1 rounded-full uppercase">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex flex-col max-w-[85%] sm:max-w-[70%] animate-in fade-in duration-150 ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] text-[#828599] px-1 select-none">
                    <span className="font-bold text-white">{msg.senderName}</span>
                    <span className="text-[8px] font-extrabold tracking-wide px-1 rounded border border-white/5 bg-white/5 text-[#4c4e5e]">{msg.privilegeBadge || 'PEER'}</span>
                  </div>
                  <div className={`rounded-2xl px-4 py-2.5 text-xs ${isMe ? 'bg-emerald-500 text-[#050508] font-semibold rounded-tr-none' : 'bg-[#151824] text-white border border-white/[0.02] rounded-tl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 text-[11px] text-[#4c4e5e] italic font-medium pl-1 animate-pulse select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-ping" />
                <span>{typingUsers.join(', ')} typing...</span>
              </div>
            )}
            <div ref={scrollRef} />
          </>
        ) : (
          <div className="w-full max-w-md mx-auto space-y-6 py-6 px-1 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mint-glow mx-auto shadow-lg">
                <Shield size={22} />
              </div>
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">Zero-Trace Comms Matrix</h2>
              <p className="text-xs text-[#828599] max-w-xs mx-auto">Initialize an encrypted connection corridor or input an active tracking identifier via the hub panel below.</p>
            </div>

            <div className="md:hidden block bg-[#0f111a] border border-white/[0.04] rounded-2xl p-4 space-y-3 shadow-xl">
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block text-center border-b border-white/5 pb-2">Mobile Control Terminal</span>
              <button
                onClick={onCreateRoomTrigger}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#050508] text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Plus size={14} strokeWidth={2.5} />
                Create Volatile Room
              </button>
              
              <form onSubmit={handleMobileJoin} className="relative">
                <input
                  type="text"
                  placeholder="Input Room Code (GHOST-XXXX)"
                  value={mobileJoinInput}
                  onChange={(e) => setMobileJoinInput(e.target.value)}
                  className="w-full bg-[#151824] border border-white/5 focus:border-emerald-500/30 rounded-xl pl-3 pr-10 py-2.5 text-xs text-white focus:outline-none"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#828599] hover:text-emerald-400">
                  <Key size={14} />
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="p-4 rounded-xl bg-[#0f111a]/40 border border-white/[0.02] space-y-1">
                <span className="text-[11px] font-bold text-emerald-400 uppercase block tracking-wider">🔒 Cryptographic Swipes</span>
                <p className="text-[11px] text-[#828599] leading-relaxed">No tracking artifacts survive on disk grids. Content drops completely upon expiry bounds.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#0f111a]/40 border border-white/[0.02] space-y-1">
                <span className="text-[11px] font-bold text-emerald-400 uppercase block tracking-wider">🎭 Pseudo Routing Masking</span>
                <p className="text-[11px] text-[#828599] leading-relaxed">Endpoints register random memory identifiers. Machine details are fully isolated.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {roomId && (
        <div className="p-4 bg-[#0b0c10] shrink-0 border-t border-white/[0.04]">
          <form onSubmit={handleSend} className="relative flex items-center max-w-5xl mx-auto">
            <input
              type="text"
              placeholder={isMutedGlobally && (userRole === 'PEER' || userRole === 'USER') ? "Channel muted by admin..." : "Broadcasting packet..."}
              value={inputText} onChange={handleInputChange} disabled={isMutedGlobally && (userRole === 'PEER' || userRole === 'USER')}
              className="w-full bg-[#10121a] border border-white/[0.04] focus:border-emerald-500/30 rounded-xl pl-4 pr-12 py-3 text-xs text-white focus:outline-none transition-colors"
            />
            <button type="submit" disabled={!inputText.trim()} className="absolute right-2 p-2 rounded-lg bg-emerald-500 text-[#050508] flex items-center justify-center">
              <Send size={14} strokeWidth={2.5} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
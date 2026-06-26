import { useState, useRef, useEffect } from 'react';
import { Send, Shield, Zap, Volume2, VolumeX, Trash2, Menu, ShieldCheck, EyeOff, Plus, Key, Copy, Check } from 'lucide-react';
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

  // Core event handling functions
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
    if (nameInput.trim()) {
      onSetUserName(nameInput.trim());
    }
    setEditingName(false);
  };

  const handleMobileJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileJoinInput.trim() || !onJoinRoomTrigger) return;
    onJoinRoomTrigger(mobileJoinInput.trim());
    setMobileJoinInput('');
  };

  const executeLinkCopy = () => {
    if (!roomId) return;
    const shareUrl = `${window.location.origin}/?room=${roomId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#0b0c10] relative h-full">
      {/* Top Application Header Section */}
      <div className="h-16 border-b border-white/[0.04] bg-[#0f111a]/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button 
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-[#828599] hover:text-white hover:bg-white/5 transition-all"
          >
            <Menu size={18} />
          </button>
          
          {roomId ? (
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-lg tracking-wider truncate">
                {roomId}
              </span>
              <button 
                onClick={executeLinkCopy}
                className="p-1.5 rounded-lg text-[#828599] hover:text-white hover:bg-white/5 transition-colors"
                title="Copy secure shortcut route URL"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-emerald-400 animate-pulse" />
              <span className="text-xs font-bold tracking-wider text-[#828599] uppercase">Terminal Grid Matrix</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {roomId && userRole === 'OWNER' && (
            <button
              onClick={onToggleMute}
              className={`p-2 rounded-xl border transition-all ${
                isMutedGlobally ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-white/[0.01] text-[#828599] border-white/[0.04]'
              }`}
            >
              {isMutedGlobally ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          )}

          {roomId && userRole === 'OWNER' && (
            <button onClick={onDestroyRoom} className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20">
              <Trash2 size={14} />
            </button>
          )}

          <div className="bg-[#151824] border border-white/[0.03] rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
            <span className="text-[#4c4e5e] font-medium">Node ID:</span>
            {editingName ? (
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
                autoFocus
                className="bg-transparent text-white font-semibold border-none focus:outline-none w-20 text-xs"
              />
            ) : (
              <span onClick={() => setEditingName(true)} className="font-semibold text-emerald-400 cursor-pointer truncate max-w-[80px]">
                {userName}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin scrollbar-thumb-white/5">
        {roomId ? (
          <>
            <div className="mx-auto max-w-md text-center p-4 border border-white/[0.02] bg-[#0f111a]/30 rounded-2xl space-y-1 mb-6">
              <span className="text-[10px] font-bold text-emerald-400/80 tracking-widest uppercase block">Secure Connection Corridor Active</span>
              <p className="text-[11px] text-[#4c4e5e]">Network logs are fluid. Files will wipe completely when lifespan conditions end.</p>
            </div>

            {messages.map((msg) => {
              const isMe = msg.senderId === peerId;
              if (msg.isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center select-none">
                    <span className="text-[10px] font-mono tracking-wide text-[#4c4e5e] bg-white/[0.01] border border-white/[0.02] px-3 py-1 rounded-full uppercase">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] text-[#828599] px-1">
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
                <span>{typingUsers.join(', ')} typing response stream...</span>
              </div>
            )}
            <div ref={scrollRef} />
          </>
        ) : (
          /* Feature Presentation Cards */
          <div className="w-full max-w-xl mx-auto space-y-6 py-2 px-1 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mint-glow mx-auto shadow-lg">
                <Shield size={22} />
              </div>
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">Zero-Trace Comms Matrix</h2>
              <p className="text-xs text-[#828599] max-w-xs mx-auto">Deploy a fresh communication segment node or establish a connection tunnel instantly.</p>
            </div>

            {/* Mobile Control Panel Tray */}
            <div className="md:hidden block bg-[#0f111a] border border-white/[0.04] rounded-2xl p-4 space-y-3 shadow-xl">
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block text-center">Mobile Terminal Control Panel</span>
              <button
                onClick={onCreateRoomTrigger}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#050508] text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Plus size={14} strokeWidth={2.5} />
                Create Volatile Room (Max 24h)
              </button>
              
              <form onSubmit={handleMobileJoinSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Input Vector Core Identifier (GHOST-XXXX)"
                  value={mobileJoinInput}
                  onChange={(e) => setMobileJoinInput(e.target.value)}
                  className="w-full bg-[#151824] border border-white/5 focus:border-emerald-500/30 rounded-xl pl-3 pr-10 py-2.5 text-xs text-white placeholder-[#4c4e5e] focus:outline-none"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#828599] hover:text-emerald-400 transition-colors">
                  <Key size={14} />
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl bg-[#0f111a]/40 border border-white/[0.02] space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400"><ShieldCheck size={14} /><span className="text-[11px] font-bold uppercase tracking-wider">Zero Log Storage</span></div>
                <p className="text-[11px] text-[#828599] leading-relaxed">No tracking records or data arrays survive on servers. Messages are permanently wiped upon room closure.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#0f111a]/40 border border-white/[0.02] space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400"><EyeOff size={14} /><span className="text-[11px] font-bold uppercase tracking-wider">Masked Routing IDs</span></div>
                <p className="text-[11px] text-[#828599] leading-relaxed">Every client uses dynamically spun random pseudonyms. Device addresses are scrubbed clean.</p>
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
              placeholder={isMutedGlobally && (userRole === 'PEER' || userRole === 'USER') ? "Channel muted by administrator layer..." : "Broadcasting real-time packet..."}
              value={inputText}
              onChange={handleInputChange}
              disabled={isMutedGlobally && (userRole === 'PEER' || userRole === 'USER')}
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
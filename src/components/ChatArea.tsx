import { useState, useRef, useEffect } from 'react';
import { Send, Shield, Zap, Volume2, VolumeX, Trash2, Menu, Plus, Copy, Check, Clock, MoreVertical, Lock, UserX, ServerOff, ChevronRight, X, MessageSquareReply } from 'lucide-react';
import type { ChatMessage } from '../types';

interface ChatAreaProps {
  roomId: string | null;
  messages: ChatMessage[];
  userName: string;
  peerId: string | null;
  onSendMessage: (text: string, replyToId?: string) => void;
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
  onSendReaction?: (messageId: string, emoji: string) => void;
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
  onSendReaction
}: ChatAreaProps) {
  const [inputText, setInputText] = useState('');
  const [mobileJoinInput, setMobileJoinInput] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [copied, setCopied] = useState(false);
  const [showMobileAdminOptions, setShowMobileAdminOptions] = useState(false);
  
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText, replyingTo?.id);
    setInputText('');
    setReplyingTo(null);
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
      ${isUrgentExpiry ? 'border-t-2 border-t-red-500 shadow-[inset_0_5px_15px_rgba(239,68,68,0.1)]' : ''}`}
      onClick={() => setSelectedMessageId(null)}
    >
      <div className="h-16 border-b border-white/[0.04] bg-[#0f111a]/80 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button onClick={onOpenMobileMenu} className="p-2 rounded-xl text-[#828599] hover:text-white hover:bg-white/5 transition-all md:hidden shrink-0">
            <Menu size={18} />
          </button>
          
          {roomId ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[10px] sm:text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-lg tracking-wider truncate">
                {roomId}
              </span>
              <button onClick={executeCopy} className="hidden sm:block p-1.5 rounded-lg text-[#828599] hover:text-white hover:bg-white/5 transition-colors shrink-0">
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
              
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-mono shrink-0
                ${isUrgentExpiry ? 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse' : 'bg-white/5 border-white/5 text-[#828599]'}`}>
                <Clock size={10} />
                <span className={isUrgentExpiry ? 'font-bold' : 'text-white'}>{timeRemainingText}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-emerald-400" />
              <span className="text-xs font-bold tracking-wider text-[#828599] uppercase truncate">GhostChat</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {roomId && userRole === 'OWNER' && (
            <div className="hidden sm:flex items-center gap-2">
              <button onClick={onToggleMute} className={`p-2 rounded-xl border transition-all ${isMutedGlobally ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-white/[0.01] text-[#828599] border-white/[0.04]'}`}>
                {isMutedGlobally ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <button onClick={onDestroyRoom} className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20">
                <Trash2 size={14} />
              </button>
            </div>
          )}

          {roomId && userRole === 'OWNER' && (
            <button onClick={() => setShowMobileAdminOptions(!showMobileAdminOptions)} className="sm:hidden p-1.5 text-[#828599] hover:text-white shrink-0">
              <MoreVertical size={16} />
            </button>
          )}

          <div className="bg-[#151824] border border-white/[0.03] rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 text-xs shrink-0 max-w-[80px] sm:max-w-[120px]">
            {editingName ? (
              <input
                type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} onBlur={saveName}
                onKeyDown={(e) => e.key === 'Enter' && saveName()} autoFocus className="bg-transparent text-white font-semibold border-none focus:outline-none w-full text-xs"
              />
            ) : (
              <span onClick={() => setEditingName(true)} className="font-semibold text-emerald-400 cursor-pointer truncate w-full block">
                {userName}
              </span>
            )}
          </div>
        </div>
      </div>

      {showMobileAdminOptions && roomId && userRole === 'OWNER' && (
        <div className="sm:hidden absolute top-16 right-4 bg-[#151824] border border-white/5 rounded-xl p-2 shadow-2xl z-50 flex gap-2 animate-in fade-in slide-in-from-top-2">
           <button onClick={onToggleMute} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${isMutedGlobally ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-white'}`}>
             {isMutedGlobally ? <VolumeX size={12} /> : <Volume2 size={12} />} {isMutedGlobally ? 'Unmute' : 'Mute'}
           </button>
           <button onClick={onDestroyRoom} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-red-500/10 text-red-400">
             <Trash2 size={12} /> Kill
           </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/5">
        {roomId ? (
          <div className="px-4 py-6 space-y-4">
            {messages.map((msg) => {
              const isMe = msg.senderId === peerId;
              const isSelected = selectedMessageId === msg.id;
              const repliedMsg = msg.replyToId ? messages.find(m => m.id === msg.replyToId) : null;

              if (msg.isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center select-none animate-in fade-in duration-150">
                    <span className="text-[9px] font-mono tracking-wide text-[#4c4e5e] bg-white/[0.01] border border-white/[0.02] px-2.5 py-1 rounded-full uppercase text-center max-w-[90%]">
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
                  
                  <div className="relative group cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedMessageId(isSelected ? null : msg.id); }}>
                    
                    {repliedMsg && (
                      <div className="mb-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] text-[#828599] truncate max-w-full opacity-80 border-l-2 border-l-emerald-500/50">
                        <span className="font-bold text-emerald-400 block mb-0.5">{repliedMsg.senderName}</span>
                        {repliedMsg.text}
                      </div>
                    )}

                    <div className={`rounded-2xl px-4 py-2.5 text-xs relative ${isMe ? 'bg-emerald-500 text-[#050508] font-semibold rounded-tr-none' : 'bg-[#151824] text-white border border-white/[0.02] rounded-tl-none break-words'}`}>
                      {msg.text}
                    </div>
                    
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className={`absolute -bottom-3 ${isMe ? 'right-2' : 'left-2'} flex gap-1 z-10`}>
                        {Object.entries(msg.reactions).map(([emoji, users]) => (
                          <span key={emoji} className="bg-[#10121a] border border-white/10 rounded-full px-1.5 py-0.5 text-[10px] flex items-center gap-1 shadow-lg">
                            {emoji} <span className="text-[#828599] text-[8px]">{users.length}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {isSelected && (
                      <div className={`absolute top-full mt-2 ${isMe ? 'right-0' : 'left-0'} bg-[#151824] border border-white/10 rounded-xl p-1.5 flex items-center gap-1 shadow-2xl z-20 animate-in zoom-in-95`}>
                        {['👍', '🔥', '😂', '👀'].map(emoji => (
                          <button key={emoji} onClick={(e) => { e.stopPropagation(); onSendReaction?.(msg.id, emoji); setSelectedMessageId(null); }} className="hover:bg-white/10 p-1.5 rounded-lg transition-colors text-sm">
                            {emoji}
                          </button>
                        ))}
                        <div className="w-px h-4 bg-white/10 mx-1"></div>
                        <button onClick={(e) => { e.stopPropagation(); setReplyingTo(msg); setSelectedMessageId(null); }} className="text-[#828599] hover:text-white p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold">
                          <MessageSquareReply size={12} /> Reply
                        </button>
                      </div>
                    )}
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
          </div>
        ) : (
          <div className="w-full max-w-5xl mx-auto px-6 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-6 max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                <Zap size={12} className="animate-pulse" /> Live Now: V2 Protocol
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-[#828599]">
                Disappear without a <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">trace.</span>
              </h1>
              <p className="text-sm md:text-base text-[#828599] leading-relaxed max-w-lg mx-auto">
                GhostChat is a volatile, zero-knowledge communication matrix. Deploy instant chat nodes that self-destruct automatically. No accounts. No logs. No history.
              </p>
            </div>

            <div className="max-w-md mx-auto bg-[#0f111a] border border-white/[0.04] rounded-3xl p-6 shadow-2xl mb-20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400/0 via-emerald-400 to-emerald-400/0 opacity-50" />
              
              <div className="space-y-4 relative z-10">
                <button
                  onClick={onCreateRoomTrigger}
                  className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-[#050508] text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:-translate-y-0.5"
                >
                  <Plus size={18} strokeWidth={2.5} />
                  Deploy Volatile Node
                </button>
                
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-white/[0.05]"></div>
                  <span className="flex-shrink-0 mx-4 text-[#4c4e5e] text-xs font-bold uppercase tracking-widest">or</span>
                  <div className="flex-grow border-t border-white/[0.05]"></div>
                </div>

                <form onSubmit={handleMobileJoin} className="relative group">
                  <input
                    type="text"
                    placeholder="Input Node Tracker (GHOST-XXXX)"
                    value={mobileJoinInput}
                    onChange={(e) => setMobileJoinInput(e.target.value)}
                    className="w-full bg-[#151824] border border-white/5 focus:border-emerald-500/30 rounded-2xl pl-4 pr-12 py-3.5 text-sm text-white focus:outline-none transition-all placeholder:text-[#4c4e5e]"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/5 rounded-xl text-[#828599] group-hover:text-emerald-400 hover:bg-white/10 transition-all">
                    <ChevronRight size={16} />
                  </button>
                </form>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="p-6 rounded-3xl bg-[#0f111a]/40 border border-white/[0.02] hover:bg-[#0f111a] hover:border-emerald-500/20 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white mb-4 group-hover:scale-110 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-all">
                  <ServerOff size={20} />
                </div>
                <h3 className="text-white font-bold text-sm mb-2">Zero Database Memory</h3>
                <p className="text-xs text-[#828599] leading-relaxed">
                  The moment your configured lifespan expires, the entire room and all its packets are permanently scrubbed from the database. No archives survive.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-[#0f111a]/40 border border-white/[0.02] hover:bg-[#0f111a] hover:border-emerald-500/20 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white mb-4 group-hover:scale-110 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-all">
                  <UserX size={20} />
                </div>
                <h3 className="text-white font-bold text-sm mb-2">Absolute Anonymity</h3>
                <p className="text-xs text-[#828599] leading-relaxed">
                  No emails, no passwords, no OAuth. Generate a random matrix alias and drop into the grid instantly. You are entirely untraceable.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-[#0f111a]/40 border border-white/[0.02] hover:bg-[#0f111a] hover:border-emerald-500/20 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white mb-4 group-hover:scale-110 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-all">
                  <Lock size={20} />
                </div>
                <h3 className="text-white font-bold text-sm mb-2">Admin Overrides</h3>
                <p className="text-xs text-[#828599] leading-relaxed">
                  Hosts retain full cryptographic control. Mute the channel, assign Co-Admins, evict peers, or trigger a manual self-destruct at any time.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {roomId && (
        <div className="p-3 sm:p-4 bg-[#0b0c10] shrink-0 border-t border-white/[0.04] flex flex-col">
          {replyingTo && (
            <div className="mb-2 bg-[#151824] border border-emerald-500/30 rounded-xl p-2.5 flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 shadow-lg">
              <div className="min-w-0 flex-1 border-l-2 border-emerald-500 pl-2">
                <span className="text-[10px] font-bold text-emerald-400 block mb-0.5 truncate">Replying to {replyingTo.senderName}</span>
                <p className="text-xs text-[#828599] truncate">{replyingTo.text}</p>
              </div>
              <button onClick={() => setReplyingTo(null)} className="p-1 text-[#4c4e5e] hover:text-white rounded-lg transition-colors shrink-0 bg-white/5 hover:bg-red-500/20 hover:text-red-400">
                <X size={14} />
              </button>
            </div>
          )}
          <form onSubmit={handleSend} className="relative flex items-center max-w-5xl mx-auto w-full">
            <input
              type="text"
              placeholder={isMutedGlobally && (userRole === 'PEER' || userRole === 'USER') ? "Channel muted by admin..." : "Broadcasting packet..."}
              value={inputText} onChange={handleInputChange} disabled={isMutedGlobally && (userRole === 'PEER' || userRole === 'USER')}
              className="w-full bg-[#10121a] border border-white/[0.04] focus:border-emerald-500/30 rounded-xl pl-4 pr-12 py-3 text-xs text-white focus:outline-none transition-colors"
            />
            <button type="submit" disabled={!inputText.trim()} className="absolute right-2 p-2 rounded-lg bg-emerald-500 text-[#050508] flex items-center justify-center disabled:opacity-50 transition-opacity">
              <Send size={14} strokeWidth={2.5} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
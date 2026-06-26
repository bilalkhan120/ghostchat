import { useState, useRef, useEffect } from 'react';
import { Send, Shield, Zap, Volume2, VolumeX, Trash2, Menu } from 'lucide-react';
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
  userRole: string; // Changed from strict literal to open string type
  isMutedGlobally: boolean;
  onToggleMute: () => void;
  typingUsers: string[];
  onTypingStatusChange: (isTyping: boolean) => void;
  onOpenMobileMenu: () => void;
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
}: ChatAreaProps) {
  const [inputText, setInputText] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null); // Avoid structural NodeJS conflicts

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
    if (nameInput.trim()) {
      onSetUserName(nameInput.trim());
    }
    setEditingName(false);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#0b0c10] relative h-full">
      <div className="h-16 border-b border-white/[0.04] bg-[#0f111a]/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button 
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-[#828599] hover:text-white hover:bg-white/5 transition-all active:scale-95"
          >
            <Menu size={18} />
          </button>
          
          {roomId ? (
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-lg tracking-wider truncate">
                {roomId}
              </span>
              <span className="text-[11px] text-[#4c4e5e] font-medium hidden sm:inline">| Secured Channel</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-emerald-400 animate-pulse" />
              <span className="text-xs font-bold tracking-wider text-[#828599] uppercase">Standby Connection Matrix</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {roomId && userRole === 'OWNER' && (
            <button
              onClick={onToggleMute}
              className={`p-2 rounded-xl border transition-all ${
                isMutedGlobally
                  ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                  : 'bg-white/[0.01] text-[#828599] border-white/[0.04] hover:text-white hover:bg-white/5'
              }`}
              title={isMutedGlobally ? "Lift channel voice silence block" : "Enforce structural silence mute block"}
            >
              {isMutedGlobally ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          )}

          {roomId && userRole === 'OWNER' && (
            <button
              onClick={onDestroyRoom}
              className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
              title="Purge layer node entirely"
            >
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
                className="bg-transparent text-white font-semibold border-none focus:outline-none w-20 sm:w-28 text-xs"
              />
            ) : (
              <span
                onClick={() => setEditingName(true)}
                className="font-semibold text-emerald-400 cursor-pointer hover:underline truncate max-w-[80px] sm:max-w-[120px]"
              >
                {userName}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin scrollbar-thumb-white/5">
        {roomId ? (
          <>
            <div className="mx-auto max-w-md text-center p-4 border border-white/[0.02] bg-[#0f111a]/30 rounded-2xl space-y-1 select-none mb-6">
              <span className="text-[10px] font-bold text-emerald-400/80 tracking-widest uppercase block">Secure Connection Corridor Active</span>
              <p className="text-[11px] text-[#4c4e5e] leading-relaxed px-2">Network streams are globally encrypted. Logs are persistent only while the terminal instance room remains live.</p>
            </div>

            {messages.map((msg) => {
              const isMe = msg.senderId === peerId;
              if (msg.isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center select-none animate-in fade-in duration-200">
                    <span className="text-[10px] font-mono tracking-wide text-[#4c4e5e] bg-white/[0.01] border border-white/[0.02] px-3 py-1 rounded-full uppercase">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex flex-col max-w-[85%] sm:max-w-[70%] animate-in fade-in slide-in-from-bottom-2 duration-150 ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] text-[#828599] px-1 select-none">
                    <span className="font-bold text-white">{msg.senderName}</span>
                    <span className={`text-[8px] font-extrabold tracking-wide px-1 rounded border ${
                      msg.privilegeBadge === 'OWNER' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : msg.privilegeBadge === 'ADMIN' 
                        ? 'bg-blue-500/10 text-blue-400 border-blue-400/20' 
                        : 'bg-white/5 text-[#4c4e5e] border-white/5'
                    }`}>
                      {msg.privilegeBadge || 'PEER'}
                    </span>
                  </div>
                  <div className={`rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed break-words whitespace-pre-wrap ${
                    isMe 
                      ? 'bg-emerald-500 text-[#050508] font-semibold rounded-tr-none' 
                      : 'bg-[#151824] text-white border border-white/[0.02] rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 text-[11px] text-[#4c4e5e] italic font-medium pl-1 animate-pulse select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-ping" />
                <span>{typingUsers.join(', ')} typing stream response...</span>
              </div>
            )}
            <div ref={scrollRef} />
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto p-4 select-none animate-in fade-in zoom-in-95 duration-300">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mint-glow mb-4">
              <Shield size={24} />
            </div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">Zero-Trace Comms Portal</h2>
            <p className="text-xs text-[#828599] leading-relaxed pt-2">Initialize a volatile network matrix channel or input a tracking connection sequence code via the utility terminal block.</p>
          </div>
        )}
      </div>

      {roomId && (
        <div className="p-4 bg-[#0b0c10] shrink-0 border-t border-white/[0.04]">
          <form onSubmit={handleSend} className="relative flex items-center max-w-5xl mx-auto">
            <input
              type="text"
              placeholder={isMutedGlobally && (userRole === 'PEER' || userRole === 'USER') ? "Channel muted by structural grid matrix administrator..." : "Broadcasting real-time message packet..."}
              value={inputText}
              onChange={handleInputChange}
              disabled={isMutedGlobally && (userRole === 'PEER' || userRole === 'USER')}
              className="w-full bg-[#10121a] border border-white/[0.04] focus:border-emerald-500/30 rounded-xl pl-4 pr-12 py-3 text-xs text-white placeholder-[#4c4e5e] focus:outline-none transition-colors disabled:opacity-40 font-medium"
            />
            <button
              type="submit"
              disabled={(isMutedGlobally && (userRole === 'PEER' || userRole === 'USER')) || !inputText.trim()}
              className="absolute right-2 p-2 rounded-lg bg-emerald-500 text-[#050508] hover:bg-emerald-400 transition-all disabled:opacity-0 disabled:scale-90 flex items-center justify-center active:scale-95"
            >
              <Send size={14} strokeWidth={2.5} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
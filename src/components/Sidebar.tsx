import { useState } from 'react';
import { Shield, Plus, Key, LogOut, Radio, Users, ChevronUp, X, MessageSquare } from 'lucide-react';

interface SidebarProps {
  currentRoomId: string | null;
  rooms: string[];
  onCreateRoom: () => void;
  onJoinRoom: (id: string) => void;
  onLeaveRoom: () => void;
  connectedPeers: number;
  isConnecting: boolean;
  activeUsersList: Array<{ peerId: string; [key: string]: any }>;
  userRole: string;
  onPromotionControl: (targetId: string, commandType: any) => void | Promise<void>;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  currentRoomId,
  rooms,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  connectedPeers,
  activeUsersList,
  userRole,
  onPromotionControl,
  isOpenMobile,
  onCloseMobile,
}: SidebarProps) {
  const [joinCode, setJoinCode] = useState('');
  const [showUsersDropdown, setShowUsersDropdown] = useState(false);

  const handleSubmitJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    onJoinRoom(joinCode);
    setJoinCode('');
  };

  return (
    <div className={`bg-[#0f111a] border-r border-white/[0.04] flex flex-col z-40 transition-all duration-300 ease-in-out
      fixed inset-y-0 left-0 w-[85%] max-w-[320px] md:relative md:w-20 lg:w-72 md:translate-x-0
      ${isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
    >
      <div className="p-4 flex items-center justify-between border-b border-white/[0.04] h-16 shrink-0">
        <div className="flex items-center gap-2 md:justify-center lg:justify-start w-full">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shrink-0">
            <Shield size={16} />
          </div>
          <span className="font-bold text-sm tracking-wide text-white uppercase md:hidden lg:block truncate">GhostChat Core</span>
        </div>
        <button onClick={onCloseMobile} className="md:hidden p-1 rounded-lg text-[#828599] hover:text-white hover:bg-white/5">
          <X size={18} />
        </button>
      </div>

      <div className="p-4 space-y-3 shrink-0 md:px-2 lg:p-4">
        <button
          onClick={onCreateRoom}
          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#050508] text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/5"
          title="Create Volatile Room"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span className="md:hidden lg:block">Create Room</span>
        </button>

        <form onSubmit={handleSubmitJoin} className="relative md:hidden lg:block">
          <input
            type="text"
            placeholder="Room Code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className="w-full bg-[#151824] border border-white/[0.03] focus:border-emerald-500/30 rounded-xl pl-3 pr-10 py-2 text-xs text-white placeholder-[#4c4e5e] focus:outline-none"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#828599] hover:text-emerald-400">
            <Key size={14} />
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 md:px-2 lg:px-4">
        <div>
          <span className="text-[10px] font-bold text-[#4c4e5e] uppercase tracking-widest block mb-2 px-1 md:hidden lg:block">Active Vectors</span>
          <div className="space-y-1">
            {rooms.map((id) => (
              <button
                key={id}
                onClick={() => { onJoinRoom(id); onCloseMobile(); }}
                className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all flex items-center justify-between group border ${
                  currentRoomId === id
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'text-[#828599] border-transparent hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MessageSquare size={14} className="shrink-0 lg:block hidden md:block" />
                  <span className="truncate md:hidden lg:block">{id}</span>
                </div>
                {currentRoomId === id && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {currentRoomId && (
        <div className="border-t border-white/[0.04] bg-[#0c0d14] md:hidden lg:block">
          <div className="p-3">
            <button
              onClick={() => setShowUsersDropdown(!showUsersDropdown)}
              className="w-full px-3 py-2 rounded-xl bg-[#151824]/50 border border-white/[0.02] flex items-center justify-between text-xs transition-all"
            >
              <div className="flex items-center gap-2 text-[#828599]">
                <Users size={14} />
                <span className="font-medium text-white">{activeUsersList.length} Active Users</span>
              </div>
              <ChevronUp size={14} className={`text-[#4c4e5e] transition-transform duration-200 ${showUsersDropdown ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showUsersDropdown && (
            <div className="max-h-48 overflow-y-auto px-3 pb-3 space-y-1">
              {activeUsersList.map((usr) => (
                <div key={usr.peerId} className="py-1.5 flex items-center justify-between text-[11px] border-b border-white/[0.01]">
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="font-semibold text-white truncate">{usr.name || usr.userName || 'Anonymous'}</span>
                    <span className={`text-[9px] font-bold tracking-wider ${usr.role === 'OWNER' ? 'text-emerald-400' : 'text-[#4c4e5e]'}`}>{usr.role || 'PEER'}</span>
                  </div>
                  {userRole === 'OWNER' && usr.role !== 'OWNER' && (
                    <button onClick={() => onPromotionControl(usr.peerId, 'EVICT')} className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[9px] font-bold hover:bg-red-500/20">Evict</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="p-4 bg-[#0a0b10] border-t border-white/[0.04] space-y-3 md:p-2 lg:p-4">
        <div className="flex items-center justify-between text-[11px] px-1 md:justify-center lg:justify-between">
          <div className="flex items-center gap-1.5 text-[#828599] md:hidden lg:flex">
            <Radio size={12} className="text-emerald-400 animate-pulse" />
            <span>Peers:</span>
          </div>
          <span className="font-bold text-white font-mono bg-white/5 px-1.5 py-0.5 rounded md:text-[10px]">{connectedPeers}</span>
        </div>

        {currentRoomId && (
          <button
            onClick={onLeaveRoom}
            className="w-full py-2 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-red-500/10 hover:border-red-500/20 text-[#828599] hover:text-red-400 text-xs font-semibold transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={12} />
            <span className="md:hidden lg:block">Disconnect</span>
          </button>
        )}
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Shield, Plus, Key, LogOut, Radio, Users, ChevronUp, X } from 'lucide-react';

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
    <div className={`w-72 bg-[#0f111a] border-r border-white/[0.04] flex flex-col z-40 transition-transform duration-300 ease-in-out
      fixed inset-y-0 left-0 md:relative md:translate-x-0
      ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="p-4 flex items-center justify-between border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <Shield size={16} />
          </div>
          <span className="font-bold text-sm tracking-wide text-white uppercase">GhostChat Core</span>
        </div>
        <button 
          onClick={onCloseMobile}
          className="md:hidden p-1 rounded-lg text-[#828599] hover:text-white hover:bg-white/5 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <button
          onClick={onCreateRoom}
          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#050508] text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-emerald-500/5"
        >
          <Plus size={14} strokeWidth={2.5} />
          Create Volatile Room
        </button>

        <form onSubmit={handleSubmitJoin} className="relative">
          <input
            type="text"
            placeholder="Enter Room Code (GHOST-XXXX)"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className="w-full bg-[#151824] border border-white/[0.03] focus:border-emerald-500/30 rounded-xl pl-3 pr-10 py-2 text-xs text-white placeholder-[#4c4e5e] focus:outline-none transition-colors"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#828599] hover:text-emerald-400 transition-colors"
          >
            <Key size={14} />
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
        <div>
          <span className="text-[10px] font-bold text-[#4c4e5e] uppercase tracking-widest block mb-2 px-1">Active Connection Channels</span>
          <div className="space-y-1">
            {rooms.map((id) => (
              <button
                key={id}
                onClick={() => onJoinRoom(id)}
                className={`w-full px-3 py-2 rounded-xl text-left text-xs font-medium transition-all duration-150 flex items-center justify-between group ${
                  currentRoomId === id
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-[#828599] hover:text-white hover:bg-white/[0.02] border border-transparent'
                }`}
              >
                <span className="truncate">{id}</span>
                {currentRoomId === id && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
              </button>
            ))}
            {rooms.length === 0 && (
              <div className="text-center py-6 border border-dashed border-white/[0.02] rounded-xl">
                <span className="text-[11px] text-[#4c4e5e]">No active vectors logged</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {currentRoomId && (
        <div className="border-t border-white/[0.04] bg-[#0c0d14]">
          <div className="p-3">
            <button
              onClick={() => setShowUsersDropdown(!showUsersDropdown)}
              className="w-full px-3 py-2 rounded-xl bg-[#151824]/50 border border-white/[0.02] hover:border-white/[0.05] flex items-center justify-between text-xs transition-all"
            >
              <div className="flex items-center gap-2 text-[#828599]">
                <Users size={14} />
                <span className="font-medium text-white">{activeUsersList.length} Network Users</span>
              </div>
              <ChevronUp size={14} className={`text-[#4c4e5e] transition-transform duration-200 ${showUsersDropdown ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showUsersDropdown && (
            <div className="max-h-48 overflow-y-auto px-3 pb-3 space-y-1 divide-y divide-white/[0.02]">
              {activeUsersList.map((usr) => (
                <div key={usr.peerId} className="pt-2 pb-1 first:pt-0 flex items-center justify-between text-[11px]">
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="font-semibold text-white truncate">{usr.name || usr.userName || 'Anonymous'}</span>
                    <span className={`text-[9px] font-bold tracking-wider ${usr.role === 'OWNER' ? 'text-emerald-400' : usr.role === 'ADMIN' ? 'text-blue-400' : 'text-[#4c4e5e]'}`}>{usr.role || 'PEER'}</span>
                  </div>
                  {userRole !== 'PEER' && userRole !== 'USER' && usr.role !== 'OWNER' && (
                    <div className="flex items-center gap-1 shrink-0">
                      {usr.role === 'PEER' || usr.role === 'USER' ? (
                        <button onClick={() => onPromotionControl(usr.peerId, 'PROMOTE')} className="px-1.5 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[9px] font-bold transition-colors">Promote</button>
                      ) : (
                        <button onClick={() => onPromotionControl(usr.peerId, 'DEMOTE')} className="px-1.5 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[9px] font-bold transition-colors">Demote</button>
                      )}
                      <button onClick={() => onPromotionControl(usr.peerId, 'EVICT')} className="px-1.5 py-0.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[9px] font-bold transition-colors">Evict</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="p-4 bg-[#0a0b10] border-t border-white/[0.04] space-y-3">
        <div className="flex items-center justify-between text-[11px] px-1">
          <div className="flex items-center gap-1.5 text-[#828599]">
            <Radio size={12} className="text-emerald-400 animate-pulse" />
            <span>Peers Connected:</span>
          </div>
          <span className="font-bold text-white font-mono">{connectedPeers}</span>
        </div>

        {currentRoomId && (
          <button
            onClick={onLeaveRoom}
            className="w-full py-2 rounded-xl bg-white/[0.02] hover:bg-red-500/10 border border-white/[0.04] hover:border-red-500/20 text-[#828599] hover:text-red-400 text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <LogOut size={12} />
            Sever Connection
          </button>
        )}
      </div>
    </div>
  );
}
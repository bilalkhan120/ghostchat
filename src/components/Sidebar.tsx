import { useState } from 'react';
import { Plus, LogOut, Terminal, Users, ShieldAlert, ShieldCheck, UserX, Layers } from 'lucide-react';

interface ActiveUser {
  peerId: string;
  userName: string;
  role: 'OWNER' | 'ADMIN' | 'USER';
}

interface SidebarProps {
  currentRoomId: string | null;
  rooms: string[];
  onCreateRoom: () => void;
  onJoinRoom: (id: string) => void;
  onLeaveRoom: () => void;
  connectedPeers: number;
  isConnecting: boolean;
  activeUsersList?: ActiveUser[];
  userRole?: 'OWNER' | 'ADMIN' | 'USER';
  onPromotionControl?: (targetId: string, type: 'PROMOTE' | 'DEMOTE' | 'KICK') => void;
}

export function Sidebar({
  currentRoomId,
  rooms,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  activeUsersList = [],
  userRole = 'USER',
  onPromotionControl,
}: SidebarProps) {
  const [joinCode, setJoinCode] = useState('');

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    onJoinRoom(joinCode.trim());
    setJoinCode('');
  };

  return (
    <div className="w-66 border-r border-white/5 bg-[#0b0c10]/80 premium-glass flex flex-col h-full shrink-0 select-none font-sans relative z-20">
      {/* Platform Branding Header */}
      <div className="p-5 border-b border-white/5 flex items-center gap-3 bg-white/[0.01]">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mint-glow">
          <Terminal size={15} className="text-emerald-400" />
        </div>
        <div>
          <span className="text-sm font-black tracking-wider text-white block">GhostChat</span>
          <span className="text-[10px] text-[#626475] font-mono font-bold uppercase tracking-widest mt-0.5">V3.0 MATRIX</span>
        </div>
      </div>

      {/* Control Input Actions */}
      <div className="p-4 space-y-3 border-b border-white/5">
        <button
          onClick={onCreateRoom}
          className="w-full py-2.5 rounded-xl bg-emerald-500 text-[#050508] text-xs font-bold tracking-wide transition-all duration-300 hover:bg-emerald-400 active:scale-[0.98] shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 group"
        >
          <Plus size={15} className="group-hover:rotate-90 transition-transform duration-300" />
          Generate New Node
        </button>

        <form onSubmit={handleJoinSubmit} className="relative">
          <input
            type="text"
            placeholder="Enter vector key..."
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className="w-full bg-[#12141d]/50 border border-white/5 focus:border-emerald-500/30 focus:outline-none rounded-xl pl-3 pr-12 py-2.5 text-xs font-medium text-white placeholder-[#404357] transition-all duration-300"
          />
          <button 
            type="submit" 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Bind
          </button>
        </form>
      </div>

      {/* Navigation & Live Segment Directories */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <span className="text-[10px] font-bold text-[#626475] tracking-widest uppercase px-2 flex items-center gap-1.5 mb-2.5 font-mono">
            <Layers size={11} /> Allocated Matrix Layers
          </span>
          <div className="space-y-1">
            {rooms.map((id) => (
              <div
                key={id}
                onClick={() => onJoinRoom(id)}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide cursor-pointer transition-all duration-200 ${
                  currentRoomId === id 
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 translate-x-1 font-bold' 
                    : 'text-[#828599] hover:bg-white/[0.02] hover:text-white'
                }`}
              >
                {id}
              </div>
            ))}
          </div>
        </div>

        {currentRoomId && activeUsersList.length > 0 && (
          <div>
            <span className="text-[10px] font-bold text-[#626475] tracking-widest uppercase px-2 flex items-center gap-1.5 mb-2.5 font-mono">
              <Users size={11} /> Connected Core Segments
            </span>
            <div className="space-y-1 max-h-[35vh] overflow-y-auto pr-0.5">
              {activeUsersList.map((user) => {
                const isTargetOwner = user.role === 'OWNER';
                const isTargetAdmin = user.role === 'ADMIN';

                return (
                  <div 
                    key={user.peerId} 
                    className="flex flex-col p-2.5 rounded-xl bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#9a9db2] truncate max-w-[130px] flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isTargetOwner ? 'bg-red-400 shadow-md shadow-red-500/20' : isTargetAdmin ? 'bg-amber-400' : 'bg-emerald-400/70'}`} />
                        {user.userName}
                      </span>

                      {/* Cryptographic Node Access Privileges Triggers */}
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        {userRole === 'OWNER' && !isTargetOwner && (
                          <>
                            {!isTargetAdmin ? (
                              <button onClick={() => onPromotionControl?.(user.peerId, 'PROMOTE')} className="p-0.5 text-[#52556b] hover:text-emerald-400 transition-colors" title="Appoint Co-Admin"><ShieldCheck size={13} /></button>
                            ) : (
                              <button onClick={() => onPromotionControl?.(user.peerId, 'DEMOTE')} className="p-0.5 text-[#52556b] hover:text-amber-400 transition-colors" title="Revoke Administrative Clearances"><ShieldAlert size={13} /></button>
                            )}
                            <button onClick={() => onPromotionControl?.(user.peerId, 'KICK')} className="p-0.5 text-[#52556b] hover:text-red-400 transition-colors" title="Sever Node Pipeline"><UserX size={13} /></button>
                          </>
                        )}
                        {userRole === 'ADMIN' && !isTargetOwner && !isTargetAdmin && (
                          <button onClick={() => onPromotionControl?.(user.peerId, 'KICK')} className="p-0.5 text-[#52556b] hover:text-red-400 transition-colors" title="Sever Node Pipeline"><UserX size={13} /></button>
                        )}
                      </div>
                    </div>
                    
                    {(isTargetOwner || isTargetAdmin) && (
                      <div className="pl-3.5 pt-0.5 flex">
                        <span className={`text-[8px] font-mono tracking-wider font-bold uppercase ${isTargetOwner ? 'text-red-400/80' : 'text-amber-400/80'}`}>
                          {isTargetOwner ? 'Host Owner' : 'Co-Admin Tier'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Disconnect Control Bracket */}
      {currentRoomId && (
        <div className="p-4 border-t border-white/5 bg-[#0e1017]/40 backdrop-blur-md">
          <button
            onClick={onLeaveRoom}
            className="w-full py-2 rounded-xl text-[#626475] hover:text-red-400 text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 active:scale-[0.98]"
          >
            <LogOut size={13} />
            Disconnect Vector
          </button>
        </div>
      )}
    </div>
  );
}
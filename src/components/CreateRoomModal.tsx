import { useState } from 'react';
import { Shield, Clock, AlertTriangle } from 'lucide-react';

interface CreateRoomModalProps {
  onClose: () => void;
  onCreate: (lifespanMinutes: number) => void;
}

export function CreateRoomModal({ onClose, onCreate }: CreateRoomModalProps) {
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(0);

  const handleInitialize = (e: React.FormEvent) => {
    e.preventDefault();
    let totalMinutes = (Number(hours) * 60) + Number(minutes);
    
    // Strict 24-hour security parameter cap enforcement loop
    if (totalMinutes > 1440) {
      totalMinutes = 1440;
    }
    if (totalMinutes <= 0) {
      totalMinutes = 5; // Minimum safety boundary configuration
    }
    
    onCreate(totalMinutes);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 font-sans animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#10121a] border border-white/5 rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 border-b border-white/5 pb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Shield size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Deploy Ephemeral Matrix</h3>
            <p className="text-[11px] text-[#828599]">Configure channel lifespan parameters and decay bounds.</p>
          </div>
        </div>

        <form onSubmit={handleInitialize} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#828599] uppercase tracking-wider block">Lifespan Hours</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={hours}
                  onChange={(e) => setHours(Math.min(24, Math.max(0, Number(e.target.value))))}
                  className="w-full bg-[#151824] border border-white/5 focus:border-emerald-500/30 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                />
                <Clock size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4c4e5e]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#828599] uppercase tracking-wider block">Lifespan Minutes</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(Math.min(59, Math.max(0, Number(e.target.value))))}
                  className="w-full bg-[#151824] border border-white/5 focus:border-emerald-500/30 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                />
                <Clock size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4c4e5e]" />
              </div>
            </div>
          </div>

          {/* 24-Hour Security Protocol Label Display Notification */}
          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-2.5">
            <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-[#828599] leading-normal">
              <span className="font-bold text-amber-400">Security Enforcement Protocol:</span> Maximum node configuration limit is strictly capped at <span className="text-white font-semibold">24 Hours</span> (1,440 minutes) to clear persistent cryptographic table structures.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#828599] font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#050508] text-xs font-bold transition-all shadow-lg shadow-emerald-500/10"
            >
              Initialize Node
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
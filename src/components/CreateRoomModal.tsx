import { useState } from 'react';
import { X, Clock, Shield } from 'lucide-react';

interface CreateRoomModalProps {
  onClose: () => void;
  onCreate: (lifespanMinutes: number) => void;
}

export function CreateRoomModal({ onClose, onCreate }: CreateRoomModalProps) {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(1); // Default initialized to 1 minute for fast trial testing

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let totalMinutes = (hours * 60) + minutes;
    
    // CHANGED: Lowered the floor clamping limit from 5 down to 1 minute for precise node decay control
    totalMinutes = Math.max(1, Math.min(totalMinutes, 1440));
    
    onCreate(totalMinutes);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 select-none font-sans animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#10121a]/90 backdrop-blur-2xl border border-white/5 rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-150">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-[#626475] hover:text-white transition-colors duration-200"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mint-glow">
            <Shield size={18} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Deploy Ephemeral Matrix</h3>
            <p className="text-[11px] text-[#626475] font-medium mt-0.5">Configure localized channel lifetime bounds and decay parameters.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[10px] font-bold text-[#626475] uppercase tracking-widest block mb-2.5 font-mono">
              Volatile Node Lifespan
            </label>
            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="relative flex items-center">
                <Clock className="absolute left-3 text-[#404357]" size={14} />
                <input
                  type="number"
                  min={0}
                  max={24}
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full bg-[#12141d]/50 border border-white/5 focus:border-emerald-500/30 focus:outline-none rounded-xl pl-9 pr-10 py-2.5 text-xs font-bold text-white transition-colors"
                  placeholder="Hours"
                  required
                />
                <span className="absolute right-3 text-[9px] font-black text-[#404357]">HR</span>
              </div>

              <div className="relative flex items-center">
                <Clock className="absolute left-3 text-[#404357]" size={14} />
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className="w-full bg-[#12141d]/50 border border-white/5 focus:border-emerald-500/30 focus:outline-none rounded-xl pl-9 pr-10 py-2.5 text-xs font-bold text-white transition-colors"
                  placeholder="Minutes"
                  required
                />
                <span className="absolute right-3 text-[9px] font-black text-[#404357]">MIN</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/[0.02] border border-white/5 text-[11px] text-[#828599] leading-relaxed">
            🛡️ <strong>Zero-Trace Execution Loop:</strong> Room matrices auto-destruct when their decay counter runs out. Setting brief allocations forces a complete table drop sequence almost immediately, making it perfect for rapid data sweeps.
          </div>

          <div className="flex gap-3 justify-end pt-2 text-xs font-bold">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/5 hover:bg-white/[0.02] text-[#626475] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[#050508] transition-all duration-200 shadow-lg shadow-emerald-600/10 active:scale-95"
            >
              Initialize Node
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
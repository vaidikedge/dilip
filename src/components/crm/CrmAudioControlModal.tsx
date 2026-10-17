import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  MousePointerClick,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import {
  isSoundEnabled,
  setSoundEnabled,
  getMasterVolume,
  setMasterVolume,
  isActionClicksEnabled,
  setActionClicksEnabled,
  playOwnerDeepAlertSound,
  playSuccessSound,
  playStatusChangeSound,
  playWarningSound,
  playActionClickSound,
  playBulkActionSound,
  isAudioContextUnlocked,
  unlockAudioContext,
} from '../../utils/audioAlert';

interface CrmAudioControlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrmAudioControlModal: React.FC<CrmAudioControlModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [soundActive, setSoundActive] = useState(true);
  const [clicksActive, setClicksActive] = useState(true);
  const [volume, setVolume] = useState(0.9);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [lastPlayed, setLastPlayed] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSoundActive(isSoundEnabled());
      setClicksActive(isActionClicksEnabled());
      setVolume(getMasterVolume());
      setAudioUnlocked(isAudioContextUnlocked());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    setSoundEnabled(next);
    if (next) {
      playSuccessSound();
      setLastPlayed('Audio Activated');
    }
  };

  const handleToggleClicks = () => {
    const next = !clicksActive;
    setClicksActive(next);
    setActionClicksEnabled(next);
    if (next) {
      playActionClickSound();
      setLastPlayed('Tactile Clicks Enabled');
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setMasterVolume(newVol);
    playActionClickSound();
  };

  const testSound = (name: string, fn: () => void) => {
    unlockAudioContext();
    setAudioUnlocked(true);
    setLastPlayed(name);
    fn();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-[#1a3882] to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Volume2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>CRM Sound & Alert System</span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/40 uppercase font-mono">
                  Live Engine
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Real-time audio feedback controls for team events and critical alerts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Main Master Switch */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${
                  soundActive
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {soundActive ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  Master CRM Sound Feedback
                </div>
                <p className="text-xs text-slate-500">
                  {soundActive
                    ? 'Active: Audio sounds will play on user actions and status updates'
                    : 'Muted: All audio chimes and sound effects are muted'}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleSound}
              className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer transition-all shadow-sm ${
                soundActive
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
              }`}
            >
              {soundActive ? 'ENABLED' : 'MUTED'}
            </button>
          </div>

          {/* Volume Slider */}
          <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#1a3882]" />
                Master Alert Volume
              </span>
              <span className="font-mono text-[#1a3882] bg-white px-2 py-0.5 rounded border border-slate-200">
                {Math.round(volume * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <VolumeX className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="flex-1 accent-[#1a3882] cursor-pointer"
              />
              <Volume2 className="w-4 h-4 text-slate-700 shrink-0" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 pt-1">
              <button
                onClick={() => handleVolumeChange(0.5)}
                className="hover:text-[#1a3882] underline cursor-pointer"
              >
                Soft (50%)
              </button>
              <button
                onClick={() => handleVolumeChange(0.8)}
                className="hover:text-[#1a3882] underline cursor-pointer"
              >
                Normal (80%)
              </button>
              <button
                onClick={() => handleVolumeChange(1.0)}
                className="hover:text-[#1a3882] underline cursor-pointer font-bold"
              >
                Max Boost (100%)
              </button>
            </div>
          </div>

          {/* Micro Click Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-[#1a3882]" />
              <div>
                <span className="font-bold text-slate-800">Tactile Micro Clicks</span>
                <p className="text-[11px] text-slate-500">
                  Subtle haptic click sound on tabs, filters, and menu navigation
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={clicksActive}
              onChange={handleToggleClicks}
              className="w-4 h-4 text-[#1a3882] rounded cursor-pointer"
            />
          </div>

          {/* Sound Testing Suite (6 Audio Profiles) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Live Sound Test Center
              </span>
              {lastPlayed && (
                <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 animate-pulse">
                  Playing: {lastPlayed}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {/* Profile 1: Deep Alert */}
              <button
                onClick={() => testSound('Loud Deep Alert', playOwnerDeepAlertSound)}
                className="p-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl text-left cursor-pointer transition-all active:scale-98 group flex items-start gap-2.5"
              >
                <div className="p-2 bg-amber-400 text-slate-950 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-amber-950">🔊 Loud Deep Alert</div>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Rich sub-bass alert for owner notifications and urgent tickets
                  </p>
                </div>
              </button>

              {/* Profile 2: Action Success */}
              <button
                onClick={() => testSound('Action Success', playSuccessSound)}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl text-left cursor-pointer transition-all active:scale-98 group flex items-start gap-2.5"
              >
                <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-emerald-950">✨ Success Chime</div>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Melodic chime on saving tasks, projects, and converting leads
                  </p>
                </div>
              </button>

              {/* Profile 3: Status Change */}
              <button
                onClick={() => testSound('Status Change', playStatusChangeSound)}
                className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-xl text-left cursor-pointer transition-all active:scale-98 group flex items-start gap-2.5"
              >
                <div className="p-2 bg-[#1a3882] text-white rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-blue-950">🔄 Status Change</div>
                  <p className="text-[11px] text-blue-800 mt-0.5">
                    Tone on Kanban pipeline moves and survey milestones
                  </p>
                </div>
              </button>

              {/* Profile 4: Warning / Delete */}
              <button
                onClick={() => testSound('Warning / Delete', playWarningSound)}
                className="p-3 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-xl text-left cursor-pointer transition-all active:scale-98 group flex items-start gap-2.5"
              >
                <div className="p-2 bg-rose-600 text-white rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-rose-950">⚠️ Delete / Warning</div>
                  <p className="text-[11px] text-rose-800 mt-0.5">
                    Tone on item deletion, staff removals, or ticket warnings
                  </p>
                </div>
              </button>

              {/* Profile 5: Micro Click */}
              <button
                onClick={() => testSound('Tactile Micro Click', playActionClickSound)}
                className="p-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-left cursor-pointer transition-all active:scale-98 group flex items-start gap-2.5"
              >
                <div className="p-2 bg-slate-700 text-white rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                  <MousePointerClick className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900">👆 Tactile Click</div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Soft click on tab navigation, filter clicks, and view toggles
                  </p>
                </div>
              </button>

              {/* Profile 6: Bulk Action */}
              <button
                onClick={() => testSound('Bulk Action', playBulkActionSound)}
                className="p-3 bg-purple-50 hover:bg-purple-100 border border-purple-300 rounded-xl text-left cursor-pointer transition-all active:scale-98 group flex items-start gap-2.5"
              >
                <div className="p-2 bg-purple-600 text-white rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-purple-950">⚡ Bulk Action Pulse</div>
                  <p className="text-[11px] text-purple-800 mt-0.5">
                    Pulse feedback on mass status updates and bulk assignments
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Web Audio Engine: <strong>Active & Zero-Latency</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1a3882] hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};

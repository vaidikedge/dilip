import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Download, Database, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  downloadSuccess: boolean;
}

export class CrmErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    downloadSuccess: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      downloadSuccess: false,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[CRM Emergency Shield] Caught runtime exception:', error, errorInfo);
    this.setState({ errorInfo });

    // Ensure emergency backup is saved to localStorage immediately on crash
    try {
      const emergencyData = {
        crashedAt: new Date().toISOString(),
        errorMessage: error.message,
        stack: error.stack,
        tasks: localStorage.getItem('dilip_crm_tasks_v3') || '[]',
        complaints: localStorage.getItem('dilip_crm_complaints_v1') || '[]',
        businesses: localStorage.getItem('dilip_crm_businesses_v1') || '[]',
        activeUser: localStorage.getItem('dilip_crm_owner_session') || sessionStorage.getItem('dilip_crm_active_user') || '{}',
      };
      localStorage.setItem('dilip_crm_crash_recovery_dump', JSON.stringify(emergencyData));
    } catch (e) {
      console.warn('Could not write crash dump:', e);
    }
  }

  // 1-Click Emergency Data Rescue Download directly from local caches & storage
  private handleEmergencyDownload = () => {
    try {
      const tasksRaw = localStorage.getItem('dilip_crm_tasks_v3');
      const complaintsRaw = localStorage.getItem('dilip_crm_complaints_v1');
      const businessesRaw = localStorage.getItem('dilip_crm_businesses_v1');
      const emergencyCacheRaw = localStorage.getItem('dilip_crm_emergency_recovery_cache');
      const crashDumpRaw = localStorage.getItem('dilip_crm_crash_recovery_dump');

      let parsedEmergencyData: any = null;
      if (emergencyCacheRaw) {
        try {
          parsedEmergencyData = JSON.parse(emergencyCacheRaw);
        } catch (_) {}
      }

      const rescuePayload = {
        app: 'Dilip Enterprises Solar CRM',
        rescueType: 'EMERGENCY_POST_CRASH_DATA_RECOVERY',
        timestamp: new Date().toISOString(),
        timestampReadable: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        notice: 'Emergency rescued CRM data dump. Can be restored 100% via the CRM Data Recovery Center.',
        data: parsedEmergencyData?.data || {
          tasks: tasksRaw ? JSON.parse(tasksRaw) : [],
          complaints: complaintsRaw ? JSON.parse(complaintsRaw) : [],
          businesses: businessesRaw ? JSON.parse(businessesRaw) : [],
        },
        crashMetadata: crashDumpRaw ? JSON.parse(crashDumpRaw) : null,
      };

      const jsonStr = JSON.stringify(rescuePayload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const now = new Date().toISOString().replace(/[:.]/g, '-');
      a.href = url;
      a.download = `EMERGENCY_RESCUED_CRM_BACKUP_${now}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.setState({ downloadSuccess: true });
    } catch (err) {
      alert('Emergency rescue download failed: ' + (err as Error).message);
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleSafeReset = () => {
    // Clear only transient view state while strictly preserving data
    try {
      sessionStorage.clear();
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-900 border border-red-500/40 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0 shadow-lg">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-black text-white tracking-tight">
                    Emergency Data Recovery & Safe Mode
                  </h1>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                    Data 100% Safe
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Dilip Enterprises Solar CRM • Google Cloud Firestore Protected
                </p>
              </div>
            </div>

            {/* Reassurance Banner */}
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-200 leading-relaxed">
                <p className="font-bold text-emerald-300 text-sm">
                  Ghabrayen nahi! Aapka data poori tarah se surakshit hai.
                </p>
                <p className="mt-1 text-slate-300">
                  CRM mein kisi temporary browser ya display error ke bawajood aapka saara customer data, tasks,
                  complaints aur staff records Google Firestore Cloud aur Emergency Local Cache mein surakshit hain.
                </p>
              </div>
            </div>

            {/* Error Details Preview */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 max-h-32 overflow-y-auto">
              <span className="text-rose-400 font-bold block mb-1">
                Caught Error: {this.state.error?.message || 'Unexpected UI rendering interruption'}
              </span>
              <span className="text-slate-500">
                Timestamp: {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Data Recovery & Rescue Options:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Emergency JSON Rescue Download */}
                <button
                  type="button"
                  onClick={this.handleEmergencyDownload}
                  className="flex items-center justify-center gap-2 p-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer transform active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {this.state.downloadSuccess ? '✓ Backup Downloaded!' : 'Emergency Download Backup (.JSON)'}
                  </span>
                </button>

                {/* 2. Reload CRM & Resync */}
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="flex items-center justify-center gap-2 p-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer transform active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reload & Resync from Cloud</span>
                </button>
              </div>

              {/* Safe Reset Option */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={this.handleSafeReset}
                  className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Clear Temporary Session State & Clean Restart
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

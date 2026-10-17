import React, { useState, useMemo } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Volume2,
  VolumeX,
  Search,
  Filter,
  Trash2,
  CheckCheck,
  User,
  MapPin,
  Phone,
  ArrowRight,
  ExternalLink,
  Zap,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { ProjectNotification, CrmUser } from '../../data/crmData';
import {
  playOwnerDeepAlertSound,
  playActionClickSound,
  playSuccessSound,
  playWarningSound,
} from '../../utils/audioAlert';

interface ProjectNotificationsViewProps {
  currentUser?: CrmUser | null;
  notifications: ProjectNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSelectProject: (taskCode: string, notif?: ProjectNotification) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onSimulateAmitCompleted: () => void;
  onOpenAudioSettings?: () => void;
}

export const ProjectNotificationsView: React.FC<ProjectNotificationsViewProps> = ({
  currentUser,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onSelectProject,
  soundEnabled,
  onToggleSound,
  onSimulateAmitCompleted,
  onOpenAudioSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'unread' | 'completed' | 'status_change' | 'remarks' | 'complaints' | 'rule1'
  >('all');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');

  const isItemUnread = (item: ProjectNotification): boolean => {
    if (currentUser) {
      if (Array.isArray(item.readByUserIds) && item.readByUserIds.includes(currentUser.id)) {
        return false;
      }
      try {
        const stored = localStorage.getItem(`dilip_crm_read_notif_ids_${currentUser.id}`);
        if (stored) {
          const idSet = JSON.parse(stored);
          if (Array.isArray(idSet) && idSet.includes(item.id)) {
            return false;
          }
        }
      } catch (e) {}
      if (currentUser.role === 'owner' && item.isRead) {
        return false;
      }
    }
    return !item.isRead;
  };

  // Unique list of authors for filtering
  const uniqueAuthors = useMemo(() => {
    const set = new Set<string>();
    notifications.forEach((n) => {
      if (n.authorName) set.add(n.authorName);
    });
    return Array.from(set);
  }, [notifications]);

  // Counts
  const unreadCount = notifications.filter(isItemUnread).length;
  const completedCount = notifications.filter(
    (n) => n.newStatus?.toLowerCase() === 'compleated' || n.actionType === 'STATUS_COMPLEATED'
  ).length;
  const remarksCount = notifications.filter(
    (n) => n.actionType === 'REMARK_ADDED' || Boolean(n.optionalRemarks)
  ).length;
  const complaintsCount = notifications.filter((n) => n.itemType === 'COMPLAINT').length;
  const rule1Count = notifications.filter(
    (n) =>
      n.message?.includes('RULE 1') ||
      n.message?.includes('Rule 1') ||
      n.projectTitle?.includes('RULE 1') ||
      n.projectTitle?.includes('Rule 1') ||
      n.actionType === 'TASK_ASSIGNED'
  ).length;

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Search
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchTitle = item.projectTitle?.toLowerCase().includes(query);
        const matchCode = item.taskCode?.toLowerCase().includes(query);
        const matchCustomer = item.customerName?.toLowerCase().includes(query);
        const matchAuthor = item.authorName?.toLowerCase().includes(query);
        const matchMsg = item.message?.toLowerCase().includes(query);
        const matchRemarks = item.optionalRemarks?.toLowerCase().includes(query);
        if (!matchTitle && !matchCode && !matchCustomer && !matchAuthor && !matchMsg && !matchRemarks) {
          return false;
        }
      }

      // Author filter
      if (selectedAuthor !== 'all' && item.authorName !== selectedAuthor) {
        return false;
      }

      // Tab filter
      if (activeFilter === 'unread') return isItemUnread(item);
      if (activeFilter === 'completed') {
        return item.newStatus?.toLowerCase() === 'compleated' || item.actionType === 'STATUS_COMPLEATED';
      }
      if (activeFilter === 'status_change') {
        return (
          item.actionType.startsWith('STATUS_') &&
          item.newStatus?.toLowerCase() !== 'compleated'
        );
      }
      if (activeFilter === 'remarks') {
        return item.actionType === 'REMARK_ADDED' || Boolean(item.optionalRemarks);
      }
      if (activeFilter === 'complaints') {
        return item.itemType === 'COMPLAINT';
      }
      if (activeFilter === 'rule1') {
        return (
          item.message?.includes('RULE 1') ||
          item.message?.includes('Rule 1') ||
          item.projectTitle?.includes('RULE 1') ||
          item.projectTitle?.includes('Rule 1') ||
          item.actionType === 'TASK_ASSIGNED'
        );
      }

      return true;
    });
  }, [notifications, searchQuery, selectedAuthor, activeFilter]);

  const getTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 45) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'compleated':
        return 'bg-emerald-600 text-white font-extrabold shadow-xs';
      case 'in progress':
        return 'bg-blue-600 text-white font-bold';
      case 'pending':
        return 'bg-amber-500 text-slate-950 font-bold';
      case 'on hold':
        return 'bg-rose-600 text-white font-bold';
      case 'not started':
        return 'bg-slate-500 text-white font-medium';
      default:
        return 'bg-slate-700 text-white font-medium';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Header Card */}
      <div className="bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white border border-blue-900/60 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950">
                <Zap className="w-3 h-3 fill-slate-950" />
                Owner Exclusive Panel
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <Bell className="w-3 h-3" />
                Live Project Activity Feed
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2 pt-1">
              <span>🔔 Project Activity Notifications</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time audit stream of all project events performed by team engineers — status changes, completion checkoffs, site notes, and customer updates.
            </p>
          </div>

          {/* Sound Control & Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Audio Alert Status & Test Button */}
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 p-2 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  playOwnerDeepAlertSound();
                }}
                className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3 py-1.5 rounded-lg shadow cursor-pointer transition-all active:scale-95"
                title="Click to test the Deep Alert sound"
              >
                <Volume2 className="w-4 h-4 animate-bounce" />
                <span>🔊 Test Deep Sound</span>
              </button>

              {onOpenAudioSettings && (
                <button
                  type="button"
                  onClick={onOpenAudioSettings}
                  className="inline-flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-amber-200 border border-amber-400/30 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  title="Configure CRM Sounds, Volume & Profiles"
                >
                  <span>⚙️ Sound Settings</span>
                </button>
              )}

              <button
                type="button"
                onClick={onToggleSound}
                className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                  soundEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-400/40 hover:bg-rose-500/30'
                }`}
                title={soundEnabled ? 'Owner sound alerts are ON' : 'Owner sound alerts are MUTED'}
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] hidden sm:inline">Active</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-[11px] hidden sm:inline">Muted</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Simulation Trigger for Testing */}
            <button
              type="button"
              onClick={onSimulateAmitCompleted}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-3 py-2 rounded-xl shadow cursor-pointer transition-all active:scale-95 border border-emerald-400/30"
              title="Simulate Amit Patel marking DE-TASK-106 (aman) as Compleated with loud beep sound"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Simulate: Amit Marks Aman Compleated</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Notifications
            </span>
            <div className="text-xl font-black text-white mt-0.5">{notifications.length}</div>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
              Unread Alerts
            </span>
            <div className="text-xl font-black text-amber-400 mt-0.5 flex items-center gap-1.5">
              <span>{unreadCount}</span>
              {unreadCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </div>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
              Projects Completed
            </span>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{completedCount}</div>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block">
              Remarks & Notes
            </span>
            <div className="text-xl font-black text-blue-300 mt-0.5">{remarksCount}</div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filter Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by employee (Amit), customer (aman), or task code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Employee Filter & Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold">Staff:</span>
              <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="text-xs bg-slate-100 border border-slate-300 rounded-lg px-2 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="all">All Staff ({uniqueAuthors.length})</option>
                {uniqueAuthors.map((author) => (
                  <option key={author} value={author}>
                    {author}
                  </option>
                ))}
              </select>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  playSuccessSound();
                  onMarkAllAsRead();
                }}
                className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  playWarningSound();
                  onClearAll();
                }}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
                title="Clear notification history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              playActionClickSound();
              setActiveFilter('all');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#1a3882] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Activity ({notifications.length})
          </button>

          <button
            type="button"
            onClick={() => {
              playActionClickSound();
              setActiveFilter('unread');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 cursor-pointer ${
              activeFilter === 'unread'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Unread ({unreadCount})
          </button>

          <button
            type="button"
            onClick={() => {
              playActionClickSound();
              setActiveFilter('completed');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 cursor-pointer ${
              activeFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Completed Projects ({completedCount})
          </button>

          <button
            type="button"
            onClick={() => {
              playActionClickSound();
              setActiveFilter('status_change');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 cursor-pointer ${
              activeFilter === 'status_change'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Status Updates
          </button>

          <button
            type="button"
            onClick={() => {
              playActionClickSound();
              setActiveFilter('remarks');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 cursor-pointer ${
              activeFilter === 'remarks'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Remarks & Notes ({remarksCount})
          </button>

          <button
            type="button"
            onClick={() => {
              playActionClickSound();
              setActiveFilter('complaints');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 cursor-pointer ${
              activeFilter === 'complaints'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Complaints ({complaintsCount})
          </button>

          <button
            type="button"
            onClick={() => {
              playActionClickSound();
              setActiveFilter('rule1');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 cursor-pointer flex items-center gap-1 ${
              activeFilter === 'rule1'
                ? 'bg-amber-500 text-slate-950 shadow-xs ring-2 ring-amber-400'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-700" />
            <span>Rule 1 Dispatches ({rule1Count})</span>
          </button>
        </div>
      </div>

      {/* Notification Cards List */}
      <div className="space-y-3">
        {filteredNotifications.map((notif) => {
          const isCompleted =
            notif.newStatus?.toLowerCase() === 'compleated' ||
            notif.actionType === 'STATUS_COMPLEATED';

          const isRule1Notif =
            notif.message?.includes('RULE 1') ||
            notif.message?.includes('Rule 1') ||
            notif.projectTitle?.includes('RULE 1') ||
            notif.projectTitle?.includes('Rule 1');

          const isItemRead = !isItemUnread(notif);

          return (
            <div
              key={notif.id}
              className={`rounded-xl border transition-all p-4 ${
                isItemRead
                  ? 'bg-white border-slate-200 shadow-xs'
                  : 'bg-blue-50/40 border-blue-300 shadow-sm ring-1 ring-blue-200'
              } ${isCompleted ? 'border-l-4 border-l-emerald-500' : ''} ${
                isRule1Notif ? 'border-l-4 border-l-amber-500 bg-amber-50/30' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                {/* Left Content */}
                <div className="space-y-2 flex-1">
                  {/* Top Bar: Author, Role, Time */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-blue-800 text-amber-300 flex items-center justify-center font-black text-[11px]">
                        {notif.authorName?.charAt(0) || 'U'}
                      </div>
                      <span className="font-black text-slate-900 text-xs">
                        {notif.authorName}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                      {notif.authorRole || 'Staff'}
                    </span>

                    <span className="text-slate-300">•</span>

                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{notif.formattedTime || getTimeAgo(notif.timestamp)}</span>
                    </span>

                    <span className="text-[10px] text-blue-700 font-bold">
                      ({getTimeAgo(notif.timestamp)})
                    </span>

                    {isRule1Notif && (
                      <span className="bg-amber-300 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border border-amber-400">
                        <Zap className="w-3 h-3 text-amber-700" />
                        Rule 1 (N1) Active
                      </span>
                    )}

                    {!isItemRead && (
                      <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full uppercase tracking-wider animate-pulse">
                        New
                      </span>
                    )}
                  </div>

                  {/* Notification Headline Message */}
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                    <span>{notif.message}</span>
                  </div>

                  {/* Project Info Card */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {notif.taskCode && (
                          <span className="font-mono text-xs font-bold text-blue-900 bg-blue-100/80 border border-blue-300 px-2 py-0.5 rounded">
                            {notif.taskCode}
                          </span>
                        )}
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {notif.projectTitle || notif.customerName}
                        </span>
                      </div>

                      {/* Status Transition Display */}
                      <div className="flex items-center gap-1.5">
                        {notif.oldStatus && (
                          <>
                            <span className="text-[10px] font-semibold text-slate-500 capitalize bg-slate-200 px-2 py-0.5 rounded">
                              {notif.oldStatus}
                            </span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                          </>
                        )}
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full capitalize ${getStatusBadge(
                            notif.newStatus
                          )}`}
                        >
                          {notif.newStatus}
                        </span>
                      </div>
                    </div>

                    {/* Customer details if available */}
                    {(notif.customerName || notif.customerPhone || notif.customerAddress) && (
                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-600 flex-wrap">
                        {notif.customerName && (
                          <span className="flex items-center gap-1 font-semibold text-slate-800">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>Client: {notif.customerName}</span>
                          </span>
                        )}
                        {notif.customerPhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{notif.customerPhone}</span>
                          </span>
                        )}
                        {notif.customerAddress && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{notif.customerAddress}</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* User Remarks if any */}
                    {notif.optionalRemarks && (
                      <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded text-slate-800 text-xs italic">
                        <strong>Worker Note:</strong> "{notif.optionalRemarks}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-1 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => {
                      playOwnerDeepAlertSound();
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors shadow-2xs"
                    title="Play deep sound alert for this notification"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                    <span>Replay Sound</span>
                  </button>

                  {(notif.taskCode || notif.customerName) && (
                    <button
                      type="button"
                      onClick={() => {
                        onMarkAsRead(notif.id);
                        onSelectProject(notif.customerName?.trim() || notif.taskCode!, notif);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-white bg-[#1a3882] hover:bg-blue-900 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors shadow-2xs"
                      title="Open and view this project in Tasks view"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Project</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onMarkAsRead(notif.id)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    {isItemRead ? 'Mark Unread' : 'Mark Read'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredNotifications.length === 0 && (
          <div className="p-10 text-center bg-white rounded-xl border border-slate-200 text-slate-500 space-y-2">
            <Info className="w-8 h-8 mx-auto text-slate-400" />
            <div className="font-bold text-slate-800 text-sm">No notifications found</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Any activity performed by employees on projects will instantly trigger sound alerts and appear here in real time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

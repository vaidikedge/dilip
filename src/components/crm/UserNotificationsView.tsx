import React, { useState, useMemo } from 'react';
import {
  Bell,
  MessageSquareQuote,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Filter,
  Search,
  Volume2,
  CheckCheck,
  Zap,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import { OwnerDirectiveNotification, CrmUser } from '../../data/crmData';
import { playOwnerDeepAlertSound } from '../../utils/audioAlert';

interface UserNotificationsViewProps {
  currentUser: CrmUser;
  notifications: OwnerDirectiveNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigateToTask: (taskCodeOrId: string, notif?: OwnerDirectiveNotification) => void;
  onNavigateToComplaint?: (ticketNoOrId: string) => void;
}

export const UserNotificationsView: React.FC<UserNotificationsViewProps> = ({
  currentUser,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigateToTask,
  onNavigateToComplaint,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Target to this particular user or broadcast to all team members
  const userNotifications = useMemo(() => {
    return notifications.filter(
      (n) =>
        n.targetUserId === 'all' ||
        !n.targetUserId ||
        n.targetUserId === currentUser.id ||
        (n.targetUserName &&
          currentUser.name &&
          n.targetUserName.toLowerCase().includes(currentUser.name.toLowerCase()))
    );
  }, [notifications, currentUser]);

  const isDirectiveUnread = (item: OwnerDirectiveNotification): boolean => {
    if (Array.isArray(item.readByUserIds) && item.readByUserIds.includes(currentUser.id)) {
      return false;
    }
    return !item.isRead;
  };

  const unreadCount = userNotifications.filter(isDirectiveUnread).length;
  const readCount = userNotifications.filter((n) => !isDirectiveUnread(n)).length;

  const filteredNotifications = useMemo(() => {
    const list = userNotifications.filter((n) => {
      const isUnread = isDirectiveUnread(n);
      if (filterType === 'unread' && !isUnread) return false;
      if (filterType === 'read' && isUnread) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        n.projectTitle.toLowerCase().includes(q) ||
        n.customerName.toLowerCase().includes(q) ||
        (n.taskCode && n.taskCode.toLowerCase().includes(q)) ||
        (n.customerAddress && n.customerAddress.toLowerCase().includes(q)) ||
        (n.ownerCommand && n.ownerCommand.toLowerCase().includes(q))
      );
    });

    // STRICT USER MANDATE: Chronological Order (Number-wise sequence):
    // "ritika vali notification no. 1 per rahni chahia or shreya verma vali 2 no. per isi taraha isi pahle jo lead add ki gae hai vo 3no. p honi chahia...
    // ab future me owner jo bhi lead add karega vo 1st no. p anna chahia isi taraha ab jo bhi lead aegi vo no. vise chalegi"
    // Most recently added/updated lead is ALWAYS #1 at the top, followed by #2, #3, etc.
    return list.sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.assignedAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.assignedAt || 0).getTime();
      if (timeB !== timeA) {
        return timeB - timeA;
      }
      return b.id.localeCompare(a.id);
    });
  }, [userNotifications, filterType, searchQuery]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 border-2 border-amber-400/50 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Dilip Enterprises Owner Desk
              </span>
              {unreadCount > 0 ? (
                <span className="bg-rose-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  {unreadCount} NEW DIRECTIVE{unreadCount > 1 ? 'S' : ''}
                </span>
              ) : (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  All Directives Normal & Viewed
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <Bell className="w-6 h-6 text-amber-400 shrink-0" />
              Owner Commands & Project Notifications
            </h2>
            <p className="text-xs sm:text-sm text-blue-200 mt-1 max-w-2xl">
              Dedicated channel for <strong>{currentUser.name}</strong>. Every command, priority instruction, and project assigned directly to you by Dilip Enterprises (Owner) appears here in real-time.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => playOwnerDeepAlertSound()}
              className="bg-white/10 hover:bg-white/20 text-amber-300 hover:text-white px-3 py-2 rounded-xl text-xs font-bold border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Test notification alert chime"
            >
              <Volume2 className="w-4 h-4" />
              <span>Chime</span>
            </button>

            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark All as Normal ({unreadCount})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              filterType === 'all'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Commands ({userNotifications.length})
          </button>
          <button
            onClick={() => setFilterType('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              filterType === 'unread'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>New Unread</span>
            {unreadCount > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                filterType === 'unread' ? 'bg-white text-rose-700' : 'bg-rose-600 text-white'
              }`}>
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilterType('read')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              filterType === 'read'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Normal / Viewed ({readCount})
          </button>
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search commands, clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3.5">
        {filteredNotifications.map((notif, index) => {
          const isNew = isDirectiveUnread(notif);
          const details = (notif as any).projectDetails || {};
          const customerName = notif.customerName || details.customerName || details.clientName || '';
          const customerPhone = notif.customerPhone || details.customerPhone || details.phone || '';
          const customerAddress = notif.customerAddress || details.customerAddress || details.address || '';
          const capacityKw = notif.capacityKw || details.capacityKw || details.capacity;
          const priority = notif.priority || details.priority || 'High';
          const projectTitle = (notif as any).title || notif.projectTitle || details.projectTitle || (customerName ? `Solar Project: ${customerName}` : 'Solar Project Assignment');
          const ownerCommand = (notif as any).message || notif.ownerCommand || details.ownerCommand || 'Action required for this project.';
          const taskCode = notif.taskCode || details.taskCode;

          return (
            <div
              key={notif.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isNew
                  ? 'bg-amber-50/40 border-amber-300 shadow-md ring-2 ring-amber-400/40'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="p-4 sm:p-5">
                {/* Top Meta Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Sequence Number Badge (No. 1, No. 2, No. 3...) */}
                    <span
                      className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-md flex items-center gap-1.5 shadow-xs ${
                        index === 0
                          ? 'bg-amber-400 text-slate-950 border border-amber-500 font-extrabold ring-1 ring-amber-400'
                          : index === 1
                          ? 'bg-blue-600 text-white border border-blue-700 font-bold'
                          : 'bg-slate-800 text-slate-100 border border-slate-700 font-bold'
                      }`}
                    >
                      <span>No. {index + 1}</span>
                      {index === 0 && (
                        <span className="text-[9px] bg-slate-950 text-amber-300 font-extrabold px-1 py-0.2 rounded uppercase tracking-wider">
                          Latest Lead
                        </span>
                      )}
                    </span>

                    {/* NEW / Normal Badge */}
                    {isNew ? (
                      <span className="bg-rose-600 text-white text-[11px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                        NEW
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Normal (Viewed)
                      </span>
                    )}

                    {/* Task Code */}
                    {taskCode && (
                      <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        {taskCode}
                      </span>
                    )}

                    {/* Priority Badge */}
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : priority === 'High'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {priority} Priority
                    </span>

                    {/* Capacity Badge */}
                    {capacityKw && (
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500" />
                        {capacityKw} kW Solar
                      </span>
                    )}
                  </div>

                  {/* Timestamp & Assigned By */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {new Date(notif.updatedAt || notif.assignedAt || Date.now()).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}{' '}
                      at{' '}
                      {new Date(notif.updatedAt || notif.assignedAt || Date.now()).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Project Title & Client Details */}
                <div className="mb-3">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>{projectTitle}</span>
                  </h3>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600 mt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Client: <strong>{customerName || 'Direct Solar Client'}</strong>
                    </span>
                    {customerPhone && (
                      <a
                        href={`tel:${customerPhone}`}
                        className="flex items-center gap-1 text-blue-600 hover:underline font-mono"
                      >
                        <Phone className="w-3.5 h-3.5 text-blue-500" />
                        {customerPhone}
                      </a>
                    )}
                    {customerAddress && (
                      <span className="flex items-center gap-1 text-slate-500 truncate max-w-md">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {customerAddress}
                      </span>
                    )}
                  </div>
                </div>

                {/* OWNER DIRECT COMMAND BOX */}
                <div className="bg-gradient-to-r from-amber-50 via-amber-100/50 to-orange-50 border-2 border-amber-300/90 rounded-xl p-3.5 sm:p-4 mb-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs">
                      <MessageSquareQuote className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>OWNER DIRECT COMMAND:</span>
                    </div>
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                      From: {notif.assignedBy || 'Dilip Enterprises (Owner)'}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 leading-relaxed whitespace-pre-line">
                    "{ownerCommand}"
                  </p>
                </div>

                {/* Footer Controls & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      Status: <strong className="text-slate-800 capitalize">{notif.status}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isNew ? (
                      <button
                        onClick={() => onMarkAsRead(notif.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                      >
                        Mark as Normal
                      </button>
                    ) : null}

                    {/* View in Tasks / Complaints Button */}
                    <button
                      onClick={() => {
                        if (!notif.isRead) {
                          onMarkAsRead(notif.id);
                        }
                        if (notif.complaintTicketNo || notif.complaintId) {
                          onNavigateToComplaint?.(notif.complaintTicketNo || notif.complaintId || '');
                        } else {
                          // Prefer customerName as target search term so "Abhishek" directly populates the search bar
                          const targetParam =
                            customerName?.trim() ||
                            notif.customerName?.trim() ||
                            taskCode ||
                            notif.taskId ||
                            customerPhone ||
                            '';
                          onNavigateToTask(targetParam, notif);
                        }
                      }}
                      className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <span>Open Project in Tasks</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredNotifications.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500 space-y-2">
            <Bell className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800 text-base">
              {filterType === 'unread'
                ? 'No new unread directives'
                : 'No owner notifications found'}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {filterType === 'unread'
                ? 'All commands assigned to you by Dilip Enterprises (Owner) have been viewed.'
                : 'When Owner assigns projects or writes instructions for you, they will appear here instantly.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

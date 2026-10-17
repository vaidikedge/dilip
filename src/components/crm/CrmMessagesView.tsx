import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Image,
  Paperclip,
  MapPin,
  X,
  Search,
  Users,
  Shield,
  Phone,
  CheckCheck,
  Check,
  ExternalLink,
  Download,
  FileText,
  Navigation,
  Sparkles,
  AlertCircle,
  MessageSquare,
  ArrowLeft,
} from 'lucide-react';
import { CrmChatMessage, ChatAttachment, CrmUser } from '../../data/crmData';

interface CrmMessagesViewProps {
  currentUser: CrmUser;
  staffUsers: CrmUser[];
  messages: CrmChatMessage[];
  onSendMessage: (
    receiverId: string,
    receiverName: string,
    text: string,
    attachments?: ChatAttachment[]
  ) => void;
  onMarkMessagesAsRead: (senderId: string, receiverId: string) => void;
  playActionSound?: () => void;
}

export const CrmMessagesView: React.FC<CrmMessagesViewProps> = ({
  currentUser,
  staffUsers,
  messages,
  onSendMessage,
  onMarkMessagesAsRead,
  playActionSound,
}) => {
  // Selected conversation: 'group-all' or specific userId (default to 'usr-owner-1' for employee, or 'group-all' for owner)
  const defaultRecipientId =
    currentUser.role === 'employee' ? 'usr-owner-1' : 'group-all';
  const [selectedChatId, setSelectedChatId] = useState<string>(defaultRecipientId);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [inputText, setInputText] = useState('');

  // Attachments pending send
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationNameInput, setLocationNameInput] = useState('');
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isFetchingGps, setIsFetchingGps] = useState(false);
  const [gpsError, setGpsError] = useState('');

  // Image full preview lightbox
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Available direct contacts
  const otherUsers = staffUsers.filter((u) => u.id !== currentUser.id && u.status === 'active');
  const ownerUser = staffUsers.find((u) => u.role === 'owner');

  // Determine active conversation recipient info
  const isGroupChat = selectedChatId === 'group-all';
  const activeRecipientUser = staffUsers.find((u) => u.id === selectedChatId);
  const activeRecipientName = isGroupChat
    ? 'General Team & Field Updates (All Members)'
    : activeRecipientUser?.name || 'Dilip Enterprises (Owner)';
  const activeRecipientRole = isGroupChat
    ? 'All Staff & Owner Channel'
    : activeRecipientUser?.roleTitle || 'Owner & Super Admin';
  const activeRecipientPhone = activeRecipientUser?.phone;

  // Filter messages for current active thread:
  // If group-all: messages with receiverId === 'group-all'
  // If direct: (senderId === currentUser.id && receiverId === selectedChatId) OR (senderId === selectedChatId && receiverId === currentUser.id)
  const activeThreadMessages = messages.filter((m) => {
    if (isGroupChat) {
      return m.receiverId === 'group-all';
    }
    return (
      (m.senderId === currentUser.id && m.receiverId === selectedChatId) ||
      (m.senderId === selectedChatId && m.receiverId === currentUser.id)
    );
  });

  // Automatically scroll to bottom on new messages or thread switch
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThreadMessages.length, selectedChatId]);

  // Mark incoming messages as read when opening a thread
  useEffect(() => {
    onMarkMessagesAsRead(selectedChatId, currentUser.id);
  }, [selectedChatId]);

  // Handle Photo selection from device/camera
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setPendingAttachments((prev) => [
        ...prev,
        {
          type: 'image',
          url: base64Url,
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          fileType: file.type,
        },
      ]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle Document selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setPendingAttachments((prev) => [
        ...prev,
        {
          type: 'file',
          url: base64Url,
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          fileType: file.type,
        },
      ]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Trigger GPS location capture
  const handleOpenLocationModal = () => {
    setIsLocationModalOpen(true);
    setGpsError('');
    setIsFetchingGps(true);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = parseFloat(position.coords.latitude.toFixed(5));
          const lng = parseFloat(position.coords.longitude.toFixed(5));
          setLocationCoords({ lat, lng });
          setLocationNameInput('Prayagraj Solar Site Location');
          setIsFetchingGps(false);
        },
        (error) => {
          console.warn('Geolocation error or denied:', error.message);
          // Fallback to high-accuracy Prayagraj coordinates
          setLocationCoords({ lat: 25.4358, lng: 81.8463 });
          setLocationNameInput('Prayagraj Rooftop Project Site');
          setGpsError('GPS permission was denied or timed out. Defaulted to Prayagraj center coordinates.');
          setIsFetchingGps(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setLocationCoords({ lat: 25.4358, lng: 81.8463 });
      setLocationNameInput('Prayagraj Rooftop Project Site');
      setIsFetchingGps(false);
    }
  };

  const handleConfirmAddLocation = () => {
    if (!locationCoords) return;
    const mapsUrl = `https://www.google.com/maps?q=${locationCoords.lat},${locationCoords.lng}`;
    setPendingAttachments((prev) => [
      ...prev,
      {
        type: 'location',
        latitude: locationCoords.lat,
        longitude: locationCoords.lng,
        locationName: locationNameInput.trim() || `Site GPS: ${locationCoords.lat}, ${locationCoords.lng}`,
        mapsUrl,
      },
    ]);
    setIsLocationModalOpen(false);
  };

  // Remove pending attachment
  const handleRemovePendingAttachment = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit message
  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed && pendingAttachments.length === 0) return;

    onSendMessage(
      selectedChatId,
      activeRecipientName,
      trimmed,
      pendingAttachments.length > 0 ? pendingAttachments : undefined
    );

    if (playActionSound) playActionSound();
    setInputText('');
    setPendingAttachments([]);
  };

  // Count unread messages per contact
  const getUnreadCount = (contactId: string) => {
    if (contactId === 'group-all') {
      return messages.filter(
        (m) => m.receiverId === 'group-all' && m.senderId !== currentUser.id && !m.isRead
      ).length;
    }
    return messages.filter(
      (m) => m.senderId === contactId && m.receiverId === currentUser.id && !m.isRead
    ).length;
  };

  // Filtered contacts list
  const filteredUsers = otherUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      u.roleTitle.toLowerCase().includes(contactSearch.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col md:flex-row h-[720px] max-h-[82vh]">
      {/* Hidden File & Image Inputs */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
      />
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.txt,.zip"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* ================= LEFT CONTACTS & CHANNELS SIDEBAR ================= */}
      <div className={`w-full md:w-80 bg-slate-900 border-r border-slate-800 text-white flex flex-col shrink-0 ${mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-[#152e6b]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Internal Solar Chat</h3>
                <p className="text-[10px] text-blue-200">Owner & Field Engineers Desk</p>
              </div>
            </div>
            <span className="text-[10px] bg-white/20 text-blue-100 px-2 py-0.5 rounded-full font-bold">
              {currentUser.role === 'owner' ? 'Super Admin' : currentUser.name}
            </span>
          </div>

          {/* Search bar */}
          <div className="relative mt-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search team member..."
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* Contacts Scrollable List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-800/40">
          {/* 1. General Team Broadcast Channel (Always at Top) */}
          <button
            onClick={() => {
              setSelectedChatId('group-all');
              setMobileShowChat(true);
            }}
            className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-left transition-all cursor-pointer ${
              selectedChatId === 'group-all'
                ? 'bg-blue-700 text-white shadow font-bold'
                : 'hover:bg-slate-800/80 text-slate-200'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/30 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold truncate">General Team & Updates</span>
                {getUnreadCount('group-all') > 0 && (
                  <span className="bg-rose-500 text-white font-extrabold text-[10px] px-1.5 py-0.2 rounded-full animate-pulse">
                    {getUnreadCount('group-all')}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-blue-200/80 truncate mt-0.5">
                All engineers + Dilip Enterprises (Owner)
              </p>
            </div>
          </button>

          {/* Section Divider */}
          <div className="pt-2 px-2 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Direct Messages (1-on-1)
            </span>
          </div>

          {/* 2. If Staff User: Dilip Enterprises (Owner) is highlighted prominently */}
          {currentUser.role === 'employee' && ownerUser && (
            <button
              onClick={() => setSelectedChatId(ownerUser.id)}
              className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-left transition-all cursor-pointer border ${
                selectedChatId === ownerUser.id
                  ? 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow-md ring-2 ring-amber-300'
                  : 'bg-amber-950/30 border-amber-500/30 hover:bg-amber-900/40 text-amber-200'
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold truncate flex items-center gap-1">
                    <span>{ownerUser.name}</span>
                    <span className="text-[9px] bg-slate-950 text-amber-300 px-1 py-0.2 rounded font-mono">
                      OWNER
                    </span>
                  </span>
                  {getUnreadCount(ownerUser.id) > 0 && (
                    <span className="bg-rose-500 text-white font-extrabold text-[10px] px-1.5 py-0.2 rounded-full animate-pulse">
                      {getUnreadCount(ownerUser.id)}
                    </span>
                  )}
                </div>
                <p className="text-[10px] opacity-80 truncate mt-0.5">
                  Direct Line to Super Admin
                </p>
              </div>
            </button>
          )}

          {/* 3. Colleagues / Staff Members */}
          {filteredUsers
            .filter((u) => u.role !== 'owner' || currentUser.role === 'owner')
            .map((user) => {
              const isSelected = selectedChatId === user.id;
              const unread = getUnreadCount(user.id);

              return (
                <button
                  key={user.id}
                  onClick={() => {
                    setSelectedChatId(user.id);
                    setMobileShowChat(true);
                  }}
                  className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-700 text-white shadow font-bold'
                      : 'hover:bg-slate-800/80 text-slate-200'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center text-white font-bold text-xs">
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate">{user.name}</span>
                      {unread > 0 && (
                        <span className="bg-rose-500 text-white font-extrabold text-[10px] px-1.5 py-0.2 rounded-full animate-pulse">
                          {unread}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.roleTitle}</p>
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* ================= RIGHT ACTIVE CHAT STREAM ================= */}
      <div className={`flex-1 flex flex-col bg-slate-50 min-w-0 ${!mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
        {/* Chat Stream Header */}
        <div className="p-3 sm:p-3.5 px-3 sm:px-5 bg-white border-b border-slate-200 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Back to Contacts Button */}
            <button
              type="button"
              onClick={() => setMobileShowChat(false)}
              className="md:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              title="Back to team contacts"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="w-9 h-9 rounded-xl bg-[#1a3882] text-amber-400 flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
              {isGroupChat ? (
                <Users className="w-5 h-5" />
              ) : activeRecipientUser?.role === 'owner' ? (
                <Shield className="w-5 h-5" />
              ) : (
                activeRecipientName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-slate-900 leading-tight truncate">
                  {activeRecipientName}
                </h4>
                <span className="hidden xs:flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">{activeRecipientRole}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeRecipientPhone && (
              <a
                href={`tel:${activeRecipientPhone}`}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold"
                title={`Call ${activeRecipientPhone}`}
              >
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>{activeRecipientPhone}</span>
              </a>
            )}
            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded font-mono">
              Live Encrypted Internal Channel
            </span>
          </div>
        </div>

        {/* Message Bubbles Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeThreadMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1a3882] flex items-center justify-center mb-3">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">No messages in this chat yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Say hello, share site photos, upload electrical drawings, or send live GPS location of your solar rooftop plant.
              </p>
            </div>
          ) : (
            activeThreadMessages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[11px] font-bold text-slate-700">
                      {isMe ? 'You' : msg.senderName}
                    </span>
                    {msg.senderRole === 'owner' && (
                      <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1 rounded">
                        Super Owner
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Message Bubble Container */}
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 shadow-xs space-y-2.5 ${
                      isMe
                        ? 'bg-[#1a3882] text-white rounded-tr-none'
                        : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none'
                    }`}
                  >
                    {/* Text Body */}
                    {msg.text && (
                      <p className="text-xs leading-relaxed whitespace-pre-wrap font-medium">
                        {msg.text}
                      </p>
                    )}

                    {/* Attachments Section */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="space-y-2 pt-1 border-t border-white/15">
                        {msg.attachments.map((att, idx) => {
                          if (att.type === 'image' && att.url) {
                            return (
                              <div key={idx} className="rounded-xl overflow-hidden group relative">
                                <img
                                  src={att.url}
                                  alt={att.fileName || 'Shared Site Photo'}
                                  onClick={() => setPreviewImageUrl(att.url || null)}
                                  className="w-full max-h-64 object-cover rounded-lg cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
                                />
                                <div className="mt-1 flex items-center justify-between text-[10px] opacity-80">
                                  <span className="truncate">{att.fileName || 'Site Photo'}</span>
                                  <button
                                    onClick={() => setPreviewImageUrl(att.url || null)}
                                    className="underline cursor-pointer"
                                  >
                                    Enlarge
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          if (att.type === 'file') {
                            return (
                              <div
                                key={idx}
                                className={`flex items-center justify-between p-2.5 rounded-xl text-xs border ${
                                  isMe
                                    ? 'bg-white/10 border-white/20 text-white'
                                    : 'bg-slate-50 border-slate-200 text-slate-800'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0 pr-2">
                                  <FileText className="w-5 h-5 text-amber-400 shrink-0" />
                                  <div className="truncate">
                                    <span className="font-bold truncate block">
                                      {att.fileName || 'Attachment Document'}
                                    </span>
                                    {att.fileSize && (
                                      <span className="text-[10px] opacity-70 block">
                                        {att.fileSize}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {att.url && (
                                  <a
                                    href={att.url}
                                    download={att.fileName || 'solar-attachment'}
                                    className={`p-1.5 rounded-lg shrink-0 cursor-pointer ${
                                      isMe
                                        ? 'bg-white/20 hover:bg-white/30 text-white'
                                        : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                                    }`}
                                    title="Download File"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            );
                          }

                          if (att.type === 'location') {
                            return (
                              <div
                                key={idx}
                                className={`rounded-xl p-3 border shadow-xs ${
                                  isMe
                                    ? 'bg-white/10 border-white/25 text-white'
                                    : 'bg-emerald-50/70 border-emerald-200 text-slate-900'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1.5">
                                  <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                                    <MapPin className="w-4 h-4 animate-bounce" />
                                  </div>
                                  <div>
                                    <span className="text-xs font-bold block">
                                      📍 {att.locationName || 'Live Solar Site GPS Location'}
                                    </span>
                                    <span className="text-[10px] font-mono opacity-80 block">
                                      Lat: {att.latitude?.toFixed(4)}, Lng: {att.longitude?.toFixed(4)}
                                    </span>
                                  </div>
                                </div>

                                {att.mapsUrl && (
                                  <a
                                    href={att.mapsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`mt-2 w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer ${
                                      isMe
                                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    }`}
                                  >
                                    <Navigation className="w-3.5 h-3.5" />
                                    <span>Open in Google Maps</span>
                                    <ExternalLink className="w-3 h-3 ml-0.5" />
                                  </a>
                                )}
                              </div>
                            );
                          }

                          return null;
                        })}
                      </div>
                    )}
                  </div>

                  {/* Read status check */}
                  {isMe && (
                    <div className="flex items-center gap-1 mt-0.5 px-1 text-[10px] text-slate-400">
                      <span>Sent</span>
                      <CheckCheck className="w-3 h-3 text-blue-500" />
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Pending Attachment Chips (Preview before send) */}
        {pendingAttachments.length > 0 && (
          <div className="p-2.5 px-4 bg-amber-50/80 border-t border-amber-200 flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-amber-900 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Attached ({pendingAttachments.length}):
            </span>
            {pendingAttachments.map((att, index) => (
              <div
                key={index}
                className="bg-white border border-amber-300 rounded-lg pl-2.5 pr-1.5 py-1 flex items-center gap-2 text-xs font-semibold text-slate-800 shadow-2xs shrink-0"
              >
                {att.type === 'image' && <Image className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                {att.type === 'file' && <Paperclip className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                {att.type === 'location' && <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />}

                <span className="truncate max-w-[140px]">
                  {att.type === 'location' ? att.locationName : att.fileName}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemovePendingAttachment(index)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Quick Action Shortcuts */}
        <div className="px-4 py-1.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-400 font-bold text-[10px] uppercase shrink-0">Quick:</span>
          {[
            '📍 Site Survey Completed',
            '⚡ Inverter Error Check',
            '📄 Net-Metering Paper Ready',
            '✅ Structure Done',
            '💰 Customer Advance Received',
          ].map((quick) => (
            <button
              key={quick}
              type="button"
              onClick={() => setInputText((prev) => (prev ? `${prev} - ${quick}` : quick))}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full whitespace-nowrap cursor-pointer transition-colors"
            >
              {quick}
            </button>
          ))}
        </div>

        {/* Bottom Input Form */}
        <form
          onSubmit={handleSend}
          className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          {/* Attachment Buttons */}
          <div className="flex items-center gap-1 text-slate-500">
            {/* 1. Share Photo Button */}
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              title="Share Site Photo / Roof Image / Meter Picture"
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-blue-600 cursor-pointer transition-colors border border-slate-200"
            >
              <Image className="w-4 h-4" />
            </button>

            {/* 2. Share File Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Share File / PDF Bill / Drawing / Quotation"
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-amber-600 cursor-pointer transition-colors border border-slate-200"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* 3. Share Live GPS Location Button */}
            <button
              type="button"
              onClick={handleOpenLocationModal}
              title="Send Real-Time Solar Site GPS Location on Google Maps"
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer transition-colors border border-rose-200"
            >
              <MapPin className="w-4 h-4" />
            </button>
          </div>

          {/* Text input */}
          <input
            type="text"
            placeholder={
              isGroupChat
                ? 'Type message to all team members & owner...'
                : `Message ${activeRecipientName}...`
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3882] bg-slate-50 focus:bg-white transition-colors"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() && pendingAttachments.length === 0}
            className={`p-2.5 sm:px-4 rounded-xl flex items-center gap-1.5 font-bold text-xs shadow cursor-pointer transition-all ${
              inputText.trim() || pendingAttachments.length > 0
                ? 'bg-[#1a3882] hover:bg-blue-900 text-white shadow-md active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>

      {/* ================= MODAL: SHARE GPS SITE LOCATION ================= */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Share Solar Site GPS Location
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Send exact coordinates & Google Maps link to {activeRecipientName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isFetchingGps ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-bold text-slate-700">
                  Detecting device GPS coordinates...
                </p>
                <p className="text-[11px] text-slate-400">
                  Please allow location access if prompted by your browser.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {gpsError && (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{gpsError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Site / Rooftop Project Landmark
                  </label>
                  <input
                    type="text"
                    value={locationNameInput}
                    onChange={(e) => setLocationNameInput(e.target.value)}
                    placeholder="e.g. Lowther Road Rooftop Plant, Prayagraj"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Latitude</span>
                    <span className="font-bold text-slate-800">{locationCoords?.lat}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Longitude</span>
                    <span className="font-bold text-slate-800">{locationCoords?.lng}</span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-blue-600" />
                    <span>Google Maps Link will be generated</span>
                  </div>
                  <span className="font-mono text-[10px] bg-blue-200 px-1.5 py-0.5 rounded font-bold">
                    maps.google.com
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(false)}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAddLocation}
                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Attach Location</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= LIGHTBOX: FULL IMAGE PREVIEW ================= */}
      {previewImageUrl && (
        <div
          onClick={() => setPreviewImageUrl(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden p-2 shadow-2xl">
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImageUrl}
              alt="Expanded Site Photo"
              className="max-h-[85vh] max-w-full object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

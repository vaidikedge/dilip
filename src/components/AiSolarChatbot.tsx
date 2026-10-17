import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sun,
  Sparkles,
  Bot,
  User,
  Phone,
  ArrowUpRight,
  RefreshCw,
  Zap,
  CheckCircle2,
  FileCheck2,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { COMPANY_INFO } from '../data/solarData';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  actions?: Array<{
    type: 'survey' | 'whatsapp' | 'call' | 'bill' | 'custom';
    label: string;
    payload?: string;
  }>;
}

interface AiSolarChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenConsultation: () => void;
}

const INITIAL_SUGGESTIONS = [
  'नमस्ते भाई! 3 kW सोलर में कितना खर्च आएगा?',
  '₹3,000 बिजली बिल पर कितने kW चाहिए?',
  'UPPCL नेट-मीटरिंग और ₹1.08 लाख सब्सिडी कैसे मिलेगी?',
  'TOPCon vs Mono PERC पैनल में क्या अंतर है?',
  'बारिश और आंधी में छत को कोई नुकसान तो नहीं होगा?',
  '7% ब्याज पर PM सूर्य घर सोलर लोन कैसे लें?',
  'प्रयागराज में फ्री रूफटॉप साइट सर्वे बुक करें'
];

export const AiSolarChatbot: React.FC<AiSolarChatbotProps> = ({
  isOpen,
  onClose,
  onOpenConsultation
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: `नमस्ते! 🙏 मैं **SuryaMitra AI (सूर्यमित्र)** हूँ — दिलीप एंटरप्राइजेज (प्रयागराज, UPNEDA Approved) का सीनियर सोलर कंसलटेंट व आपका साथी।\n\nआप मुझसे अपनी पसंद की भाषा (**हिंदी, Hinglish या English**) में बेझिझक खुलकर बातचीत कर सकते हैं:\n\n• 💰 **PM सूर्य घर डबल सब्सिडी** (केंद्र ₹78K + UP सरकार ₹30K = कुल ₹1,08,000 DBT)\n• ⚡ **बिजली बिल से सटीक साइजिंग** (3 kW लगवाने पर बिजली बिल ₹0)\n• 📑 **UPPCL नेट-मीटरिंग & लोड अप्रूवल** (100% कागजी काम हमारी जिम्मेदारी)\n• 🔬 **एडवांस टेक्नोलॉजी** (TOPCon, Bifacial, हाइब्रिड बैटरी सिस्टम)\n• 🏡 **छत की मजबूती & लीकेज सुरक्षा** (केमिकल फास्टनिंग, 150 km/h आंधी प्रूफ)\n• 📍 **प्रयागराज में फ्री साइट सर्वे** (मिस्टर देवाशीष +91-76074 07159)\n\nबताइए, आपका हर महीने लगभग कितना बिजली बिल आता है, या आप सोलर के बारे में क्या जानना चाहते हैं?`,
      timestamp: new Date(),
      actions: [
        { type: 'survey', label: 'Book Free Site Survey' },
        { type: 'whatsapp', label: 'Chat on WhatsApp' }
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 200);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Text-to-speech helper
  const speakText = (text: string) => {
    if (!isSpeechEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner speech
    const clean = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = /[\u0900-\u097F]/.test(text) ? 'hi-IN' : 'en-IN';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Speech-to-text mic input
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          handleSendMessage(transcript);
        }
      };
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition start failed:', e);
      setIsListening(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          conversationHistory: messages.slice(-6).map((m) => ({
            sender: m.sender,
            text: m.text
          }))
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const replyText = data.reply || 'Thank you for your question. You can also call Mr. Devashish at +91-76074 07159 for instant technical assistance.';

      // Determine smart action pills
      const smartActions: ChatMessage['actions'] = [];
      const lower = query.toLowerCase() + ' ' + replyText.toLowerCase();

      if (lower.includes('survey') || lower.includes('site') || lower.includes('book') || lower.includes('visit') || lower.includes('rooftop')) {
        smartActions.push({ type: 'survey', label: 'Book Free Site Survey' });
      }
      if (lower.includes('bill') || lower.includes('uppcl') || lower.includes('load')) {
        smartActions.push({ type: 'bill', label: 'Upload Electricity Bill' });
      }
      smartActions.push({
        type: 'whatsapp',
        label: 'Chat on WhatsApp',
        payload: `Hello Mr. Devashish, I asked SuryaMitra AI: "${query}". Can you advise further?`
      });
      smartActions.push({ type: 'call', label: 'Call +91-76074 07159' });

      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: replyText,
        timestamp: new Date(),
        actions: smartActions
      };

      setMessages((prev) => [...prev, botMsg]);
      speakText(replyText);
    } catch (err: any) {
      console.error('Chat error:', err);
      // Fallback message
      const fallbackMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: `Under the **PM Surya Ghar Yojana & UP State Subsidy**, rooftop solar installations receive up to **₹1,08,000 direct DBT subsidy**:\n\n• **1 kW:** ₹45,000 Subsidy\n• **2 kW:** ₹90,000 Subsidy\n• **3 kW:** ₹1,08,000 Subsidy\n\nFor personalized technical advice and net-metering feasibility in Prayagraj, connect with Mr. Devashish directly.`,
        timestamp: new Date(),
        actions: [
          { type: 'survey', label: 'Book Free Rooftop Survey' },
          { type: 'whatsapp', label: 'WhatsApp Mr. Devashish' },
          { type: 'call', label: 'Call +91-76074 07159' }
        ]
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: NonNullable<ChatMessage['actions']>[number]) => {
    if (action.type === 'survey') {
      onClose();
      onOpenConsultation();
    } else if (action.type === 'whatsapp') {
      const text = action.payload || `Hello Mr. Devashish, I am inquiring about solar installation in Prayagraj from Dilip Enterprises.`;
      window.open(`https://wa.me/${COMPANY_INFO.phoneClean}?text=${encodeURIComponent(text)}`, '_blank');
    } else if (action.type === 'call') {
      window.location.href = `tel:${COMPANY_INFO.phoneClean}`;
    } else if (action.type === 'bill') {
      onClose();
      const el = document.getElementById('uppcl-bill-upload');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        onOpenConsultation();
      }
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'bot',
        text: `Chat cleared. Ask me anything about Solar Subsidies, UPPCL Net-Metering, or Rooftop Solar Plant sizing in Prayagraj!`,
        timestamp: new Date(),
        actions: [
          { type: 'survey', label: 'Book Free Site Survey' },
          { type: 'whatsapp', label: 'WhatsApp Inquiry' }
        ]
      }
    ]);
  };

  // Helper to format simple markdown (bold, bullet points, line breaks)
  const formatMarkdown = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed">
        {lines.map((line, i) => {
          if (!line.trim()) return <div key={i} className="h-1" />;

          // Process bullet lines
          const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
          const text = isBullet ? line.replace(/^[•-]\s*/, '') : line;

          // Simple bold formatting parser
          const parts = text.split(/(\*\*[^*]+\*\*)/g);
          const formatted = parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={index} className="font-bold text-slate-950">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });

          if (isBullet) {
            return (
              <div key={i} className="flex items-start gap-1.5 pl-1 text-slate-800">
                <span className="text-amber-500 font-bold shrink-0">•</span>
                <span>{formatted}</span>
              </div>
            );
          }

          return (
            <p key={i} className="text-slate-800">
              {formatted}
            </p>
          );
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div
        className={`relative w-full ${
          isExpanded ? 'sm:max-w-3xl h-[94vh]' : 'sm:max-w-lg h-[86vh] sm:h-[620px]'
        } bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-amber-950 p-4 text-white flex items-center justify-between shrink-0 border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/30">
                <Sun className="w-6 h-6 animate-[spin_16s_linear_infinite]" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm sm:text-base text-white">SuryaMitra AI</h3>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-1.5 py-0.2 rounded">
                  UPNEDA Guide
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Dilip Enterprises Solar Expert • Prayagraj
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                const next = !isSpeechEnabled;
                setIsSpeechEnabled(next);
                if (!next && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
              }}
              title={isSpeechEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isSpeechEnabled
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {isSpeechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Clear Chat */}
            <button
              onClick={handleClearChat}
              title="Clear Conversation"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Expand / Minimize (desktop) */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Collapse size' : 'Expand size'}
              className="hidden sm:block p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 shrink-0 overflow-x-auto no-scrollbar flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase text-slate-500 shrink-0 flex items-center gap-1 pl-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Quick:
          </span>
          {INITIAL_SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(s)}
              disabled={isLoading}
              className="text-[11px] whitespace-nowrap bg-white hover:bg-amber-50 hover:text-amber-900 border border-slate-200 hover:border-amber-300 text-slate-700 font-medium px-2.5 py-1 rounded-full shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Message Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <div className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Sun className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm space-y-2.5 ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200/80 rounded-tl-none'
                }`}
              >
                {msg.sender === 'user' ? (
                  <p className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  formatMarkdown(msg.text)
                )}

                {/* Smart Action Buttons in Bot Messages */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {msg.actions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleActionClick(act)}
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          act.type === 'survey'
                            ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs'
                            : act.type === 'whatsapp'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : act.type === 'bill'
                            ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {act.type === 'survey' && <Zap className="w-3 h-3 fill-slate-950" />}
                        {act.type === 'whatsapp' && <ArrowUpRight className="w-3 h-3" />}
                        {act.type === 'bill' && <FileCheck2 className="w-3 h-3 text-amber-600" />}
                        {act.type === 'call' && <Phone className="w-3 h-3 text-slate-600" />}
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[9px] ${
                    msg.sender === 'user' ? 'text-slate-400 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-2.5 items-start">
              <div className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
                <Sun className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-xs space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-500" />
                  <span>SuryaMitra calculating solar feasibility...</span>
                </div>
                <div className="flex gap-1 py-1">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.15s]" />
                  <div className="w-2 h-2 rounded-full bg-amber-600 animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Mic button */}
            <button
              type="button"
              onClick={toggleListening}
              title={isListening ? 'Stop listening' : 'Voice input (Speak in Hindi/English)'}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything: e.g. 5kW solar price, subsidy, loan..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold p-2.5 sm:px-4 sm:py-2.5 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Send</span>
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 px-1">
            <span>Powered by Gemini 3.8 Flash & Dilip Enterprises</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenConsultation();
              }}
              className="text-amber-600 font-bold hover:underline cursor-pointer"
            >
              Book Free Site Survey →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

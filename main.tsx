import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Sparkles, AlertCircle, RefreshCw, Send, Radio } from "lucide-react";
import { ChatMessage, EchoState } from "../types";

// Safety declaration for browser WebkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface EchoDotProps {
  chatState: EchoState;
  setChatState: (state: EchoState) => void;
  messages: ChatMessage[];
  onSendMessage: (text: string, useAiVoice: boolean) => Promise<void>;
  isGeneratingVoice: boolean;
  apiKeyLoaded: boolean;
}

export default function EchoDot({
  chatState,
  setChatState,
  messages,
  onSendMessage,
  isGeneratingVoice,
  apiKeyLoaded,
}: EchoDotProps) {
  const [inputText, setInputText] = useState("");
  const [useAiVoice, setUseAiVoice] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize Speech Recognition for Arabic
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "ar-SA"; // Saudi Arabic for native recognition

      rec.onstart = () => {
        setIsRecording(true);
        setChatState("listening");
        setMicError(null);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event);
        setIsRecording(false);
        setChatState("idle");
        if (event.error === "not-allowed") {
          setMicError("تم رفض الوصول إلى الميكروفون. يرجى تفعيل الصلاحية للمتصفح.");
        } else if (event.error === "no-speech") {
          setMicError("لم يتم الكشف عن صوت. يرجى التحدث بوضوح.");
        } else {
          setMicError("حدث خطأ أثناء التعرف على الصوت. الرجاء التجربة مجدداً.");
        }
      };

      rec.onend = () => {
        setIsRecording(false);
        if (chatState === "listening") {
          setChatState("idle");
        }
      };

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        if (resultText && resultText.trim()) {
          onSendMessage(resultText, useAiVoice);
        }
      };

      recognitionRef.current = rec;
    }
  }, [useAiVoice, onSendMessage, chatState, setChatState]);

  // Scroll to bottom of chat list
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleRecording = () => {
    if (!speechSupported) {
      setMicError("ميزة التعرف على الصوت غير مدعومة في متصفحك الحالي. استخدام الإدخال النصي.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      try {
        setMicError(null);
        recognitionRef.current?.start();
      } catch (error) {
        console.error("Failed to start voice recognition", error);
        setMicError("فشل تشغيل الميكروفون. يرجى الكتابة يدوياً.");
      }
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), useAiVoice);
    setInputText("");
  };

  // Pre-configured Alexa Commands
  const testCommands = [
    "يا أليكسا، ما هي نصيحة اليوم للإنتاجية؟",
    "أليكسا، احكِ لي قصة دقيقة واحدة عن الفضاء",
    "أليكسا، كيف يساعدني الذكاء الفائق في حياتي؟",
    "أليكسا، ما هي حالة الطقس المتوقعة اليوم بمكة؟"
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative" id="echo_dot_section">
      {/* Top Bar Indicators */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${apiKeyLoaded ? 'bg-emerald-500' : 'bg-red-500'} ${chatState !== 'idle' ? 'animate-ping' : ''}`}></span>
          <span className="font-mono text-[10px]">ECHO DOT 5 SIMULATOR (AR)</span>
        </div>
        
        {/* Toggle Speech Mode */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={useAiVoice} 
              onChange={() => setUseAiVoice(!useAiVoice)}
              className="sr-only peer"
            />
            <div className="relative w-8 h-4 bg-slate-800 rounded-full peer peer-focus:ring-1 peer-focus:ring-blue-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>صوت الذكاء (جميناي)</span>
            </span>
          </label>
        </div>
      </div>

      {/* Main Interactive Interactive Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-900 overflow-y-auto min-h-[350px]">
        
        {/* PHYSICAL ECHO DOT 5 MODULE */}
        <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center mb-8 transform hover:scale-[1.02] transition-transform duration-500">
          
          {/* External Shadow & Ambient Lighting */}
          <div className="absolute inset-0 rounded-full bg-slate-950/40 blur-2xl"></div>
          
          {/* Inner Glowing Body Ring */}
          <div className="absolute w-[94%] h-[94%] rounded-full bg-slate-950/80 border border-slate-800 shadow-inner flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/40 via-transparent to-transparent"></div>
          </div>
          
          {/* Echo Dot Top Mesh Surface */}
          <div className="absolute w-[90%] h-[90%] rounded-full bg-slate-800 border-2 border-slate-700/50 shadow-inner flex flex-col items-center justify-center p-6 text-center z-10">
            {/* Top Surface Interface buttons mockup */}
            <div className="absolute top-4 flex gap-4 text-[10px] text-slate-500 font-bold select-none">
              <span>+</span>
              <span>•</span>
              <span>-</span>
              <span>∅</span>
            </div>
            
            {/* State Icon and Message display */}
            <div className="flex flex-col items-center justify-center gap-2 mt-4">
              {chatState === "idle" && (
                <>
                  <Radio className="w-10 h-10 text-slate-500 animate-pulse" />
                  <p className="text-slate-400 text-sm font-semibold mt-1">أليكسا في وضع الاستعداد</p>
                  <p className="text-xs text-slate-500">انطق "أليكسا" وتحدث، أو اكتب بالأسفل</p>
                </>
              )}
              {chatState === "listening" && (
                <>
                  <Mic className="w-10 h-10 text-cyan-400 animate-bounce" />
                  <p className="text-cyan-400 text-sm font-bold tracking-wide mt-1 animate-pulse">جاري الاستماع...</p>
                  <p className="text-[11px] text-slate-400">قل سؤالك باللغة العربية الآن</p>
                </>
              )}
              {chatState === "processing" && (
                <>
                  <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
                  <p className="text-amber-500 text-sm font-semibold mt-1">جاري التفكير بالذكاء الفائق...</p>
                  <p className="text-[11px] text-slate-400">إنتاج الإجابة الذكية</p>
                </>
              )}
              {chatState === "speaking" && (
                <>
                  <Volume2 className="w-10 h-10 text-emerald-400 animate-pulse" />
                  <p className="text-emerald-400 text-sm font-bold mt-1">أليكسا تتحدث الآن</p>
                  <p className="text-[11px] text-slate-400">استمع للإجابة المنسقة</p>
                </>
              )}
              {isGeneratingVoice && (
                <span className="text-[10px] text-amber-400 animate-pulse bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-800">
                  جاري توليد ملف الصوت بالذكاء الاصطناعي...
                </span>
              )}
            </div>
            
            {/* Small status line */}
            {micError && (
              <div className="absolute bottom-6 left-4 right-4 bg-red-950/70 border border-red-800 px-3 py-1 rounded-lg text-[10px] text-red-300 flex items-center gap-1.5 justify-center">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{micError}</span>
              </div>
            )}
          </div>

          {/* CHAMELEON LED BASE RING - ECHO DOT Glow */}
          <div 
            className={`absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-[85%] h-5 rounded-full transition-all duration-700 blur-[8px] z-0
              ${chatState === "idle" ? "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-700/80 via-blue-900/40 to-transparent scale-[1.0] opacity-55" : ""}
              ${chatState === "listening" ? "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400 via-blue-500 to-transparent scale-[1.2] opacity-100 animate-pulse" : ""}
              ${chatState === "processing" ? "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400 via-yellow-600 to-transparent scale-[1.1] opacity-90 animate-pulse" : ""}
              ${chatState === "speaking" ? "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-400 via-teal-500 to-transparent scale-[1.25] opacity-100" : ""}
            `}
          ></div>
          <div 
            className={`absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-[90%] h-3 rounded-full transition-all duration-500 border-t-2 z-10
              ${chatState === "idle" ? "border-indigo-600/30 opacity-40" : ""}
              ${chatState === "listening" ? "border-cyan-400 shadow-[0_0_15px_#22d3ee] animate-pulse" : ""}
              ${chatState === "processing" ? "border-amber-400 shadow-[0_0_15px_#fbbf24] animate-pulse" : ""}
              ${chatState === "speaking" ? "border-emerald-400 shadow-[0_0_15px_#34d399]" : ""}
            `}
          ></div>

        </div>

        {/* Suggestion Quick Prompts Grid */}
        <div className="w-full">
          <p className="text-[11px] text-slate-500 font-semibold mb-2 text-right">أوامر سريعة مقترحة لاختبار الذكاء:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full text-xs">
            {testCommands.map((cmd, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputText("");
                  onSendMessage(cmd, useAiVoice);
                }}
                disabled={chatState === "processing" || chatState === "listening"}
                className="p-2 border border-slate-800 hover:border-blue-600/30 text-right bg-slate-950/40 hover:bg-slate-950/100 text-slate-300 rounded-xl transition-all truncate"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CHAT LOG DISPLAY */}
      <div className="h-44 overflow-y-auto bg-slate-950/70 py-3 px-4 border-t border-b border-slate-800/80 text-right">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-600">
            سجل المحادثات فارغ. اضغط على الميكروفون وتحدث أو اكتب سؤالاً.
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                  msg.sender === "user" 
                    ? "bg-slate-850 border border-slate-800 text-indigo-300 ms-auto" 
                    : "bg-slate-900 border border-blue-950/50 text-emerald-300 me-auto"
                }`}
              >
                <div className="flex items-center gap-1.5 justify-end font-semibold text-[10px] text-slate-500 mb-1">
                  <span>{msg.sender === "user" ? "أنت" : "أليكسا"}</span>
                  {msg.sender === "alexa" && msg.isAiVoice && (
                    <span className="bg-amber-950/60 text-amber-400 text-[8px] px-1 py-0.2 rounded border border-amber-900 leading-none">صوت ذكاء</span>
                  )}
                </div>
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* INPUT FORM */}
      <form onSubmit={handleTextSubmit} className="p-3 bg-slate-950 border-t border-slate-800">
        <div className="flex gap-2 items-center">
          {/* Button audio input */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-3.5 rounded-2xl flex items-center justify-center transition-all focus:outline-none ${
              isRecording 
                ? "bg-red-600 text-white animate-pulse shadow-[0_0_12px_rgba(220,38,38,0.5)]" 
                : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            }`}
            title={isRecording ? "إيقاف التسجيل وتوليد الرد" : "تحدث بصوتك باللغة العربية"}
            disabled={chatState === "processing"}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text entry field */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="اسأل أليكسا شيئاً باللغة العربية..."
            disabled={chatState === "processing" || isRecording}
            className="flex-1 px-4 py-3 bg-slate-900 border border-slate-850 hover:border-slate-800 focus:border-blue-600 focus:outline-none rounded-2xl text-xs text-right text-slate-100 placeholder-slate-500"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || chatState === "processing" || isRecording}
            className="p-3.5 bg-blue-650 hover:bg-blue-600 disabled:bg-slate-800/50 disabled:text-slate-600 text-white rounded-2xl flex items-center justify-center transition-all focus:outline-none cursor-pointer"
          >
            <Send className="w-4 h-4 rtl:transform rtl:scale-x-[-1]" />
          </button>
        </div>
      </form>
    </div>
  );
}

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, Send, Globe, Bot, User, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिंदी", flag: "🇮🇳" },
  { code: "te", label: "తెలుగు", flag: "🇮🇳" },
  { code: "ta", label: "தமிழ்", flag: "🇮🇳" },
  { code: "kn", label: "ಕನ್ನಡ", flag: "🇮🇳" },
];

const LANG_TO_BCP47: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  te: "te-IN",
  ta: "ta-IN",
  kn: "kn-IN",
};

const QUICK_QUESTIONS: Record<string, string[]> = {
  en: ["How to identify crop disease?", "Best fertilizer for wheat?", "Today's market price for rice?", "PM Kisan scheme details?", "Weather tips for sowing?"],
  hi: ["फसल की बीमारी कैसे पहचानें?", "गेहूं के लिए सबसे अच्छा उर्वरक?", "आज चावल का बाज़ार भाव?", "PM किसान योजना की जानकारी?", "बुवाई के लिए मौसम की सलाह?"],
  te: ["పంట వ్యాధిని ఎలా గుర్తించాలి?", "గోధుమకు ఉత్తమ ఎరువు?", "బియ్యం ధర ఈరోజు?", "PM కిసాన్ పథకం వివరాలు?", "విత్తనానికి వాతావరణ సలహా?"],
  ta: ["பயிர் நோயை எவ்வாறு கண்டறிவது?", "கோதுமைக்கு சிறந்த உரம்?", "அரிசி இன்றைய சந்தை விலை?", "PM கிசான் திட்ட விவரங்கள்?", "விதைப்புக்கான வானிலை ஆலோசனை?"],
  kn: ["ಬೆಳೆ ರೋಗವನ್ನು ಹೇಗೆ ಗುರುತಿಸುವುದು?", "ಗೋಧಿಗೆ ಉತ್ತಮ ರಸಗೊಬ್ಬರ?", "ಅಕ್ಕಿ ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ?", "PM ಕಿಸಾನ್ ಯೋಜನೆ ವಿವರ?", "ಬಿತ್ತನೆಗೆ ಹವಾಮಾನ ಸಲಹೆ?"],
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/farm-assistant`;

const ChatAssistant = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const streamChat = useCallback(async (allMessages: Msg[]) => {
    setIsLoading(true);
    let assistantSoFar = "";

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages, language }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Request failed" }));
        toast({ variant: "destructive", title: "Error", description: err.error || "Something went wrong" });
        setIsLoading(false);
        return;
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error", description: "Failed to connect to assistant" });
    }
    setIsLoading(false);
  }, [language, toast]);

  const send = useCallback(async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    await streamChat(newMessages);
  }, [messages, streamChat]);

  const toggleListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: "destructive", title: "Not Supported", description: "Speech recognition is not supported in your browser." });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = LANG_TO_BCP47[language] || "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast({ variant: "destructive", title: "Mic Error", description: "Could not capture speech. Try again." });
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, language, toast]);

  const speakText = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_TO_BCP47[language] || "en-IN";
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [language]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl">Kisan Mitra</h1>
            <p className="text-muted-foreground text-xs">AI Farming Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l.code} value={l.code}>
                  {l.flag} {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto rounded-xl bg-muted/30 border border-border p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="h-12 w-12 mx-auto text-primary mb-3" />
            <h2 className="font-display font-semibold text-lg mb-1">
              {language === "hi" ? "नमस्ते! मैं किसान मित्र हूं" : "Namaste! I'm Kisan Mitra"}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              {language === "hi" ? "मुझसे खेती से जुड़ा कोई भी सवाल पूछें" : "Ask me anything about farming"}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {(QUICK_QUESTIONS[language] || QUICK_QUESTIONS.en).map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-xs bg-card border border-border rounded-full px-3 py-1.5 hover:bg-accent transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-xl px-4 py-3 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>
              {m.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm">{m.content}</p>
              )}
              {m.role === "assistant" && m.content && (
                <button onClick={() => speakText(m.content)} className="mt-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <Volume2 className="h-3 w-3" /> {isSpeaking ? "Speaking..." : "Listen"}
                </button>
              )}
            </div>
            {m.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                <User className="h-4 w-4 text-secondary-foreground" />
              </div>
            )}
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="bg-card border border-border rounded-xl px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="mt-3 flex gap-2 items-end">
        <Button
          variant={isListening ? "destructive" : "outline"}
          size="icon"
          onClick={toggleListening}
          className="shrink-0 h-11 w-11 rounded-xl"
          title="Voice input"
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          placeholder={language === "hi" ? "अपना सवाल लिखें..." : "Type your question..."}
          className="resize-none min-h-[44px] max-h-[120px] rounded-xl"
          rows={1}
        />
        <Button
          onClick={() => send(input)}
          disabled={!input.trim() || isLoading}
          size="icon"
          className="shrink-0 h-11 w-11 rounded-xl bg-primary"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {isListening && (
        <div className="mt-2 text-center">
          <span className="inline-flex items-center gap-2 text-sm text-destructive animate-pulse">
            <Mic className="h-4 w-4" /> Listening... Speak now
          </span>
        </div>
      )}
    </div>
  );
};

export default ChatAssistant;

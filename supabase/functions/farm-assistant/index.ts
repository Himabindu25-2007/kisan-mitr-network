import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LANGUAGE_PROMPTS: Record<string, string> = {
  en: "You are Kisan Mitra, a helpful AI farming assistant for Indian farmers. Answer questions about crop diseases, fertilizers, market prices, weather advice, and government schemes. Keep answers practical, concise, and farmer-friendly. Reply in English.",
  hi: "आप किसान मित्र हैं, भारतीय किसानों के लिए एक सहायक AI कृषि सहायक। फसल रोगों, उर्वरकों, बाज़ार मूल्यों, मौसम सलाह और सरकारी योजनाओं के बारे में प्रश्नों का उत्तर दें। उत्तर व्यावहारिक, संक्षिप्त और किसान-अनुकूल रखें। हिंदी में उत्तर दें।",
  te: "మీరు కిసాన్ మిత్ర, భారతీయ రైతులకు సహాయకారి AI వ్యవసాయ సహాయకుడు. పంట వ్యాధులు, ఎరువులు, మార్కెట్ ధరలు, వాతావరణ సలహా మరియు ప్రభుత్వ పథకాల గురించి ప్రశ్నలకు సమాధానం ఇవ్వండి. తెలుగులో సమాధానం ఇవ్వండి.",
  ta: "நீங்கள் கிசான் மித்ரா, இந்திய விவசாயிகளுக்கான AI வேளாண் உதவியாளர். பயிர் நோய்கள், உரங்கள், சந்தை விலைகள், வானிலை ஆலோசனை மற்றும் அரசு திட்டங்கள் பற்றிய கேள்விகளுக்கு பதிலளிக்கவும். தமிழில் பதிலளிக்கவும்.",
  kn: "ನೀವು ಕಿಸಾನ್ ಮಿತ್ರ, ಭಾರತೀಯ ರೈತರಿಗೆ AI ಕೃಷಿ ಸಹಾಯಕ. ಬೆಳೆ ರೋಗಗಳು, ರಸಗೊಬ್ಬರಗಳು, ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು, ಹವಾಮಾನ ಸಲಹೆ ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ. ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = "en" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = LANGUAGE_PROMPTS[language] || LANGUAGE_PROMPTS.en;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("farm-assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

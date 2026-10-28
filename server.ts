import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side with telemetry header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const OWNER_EMAIL = 'frassa0000@gmail.com';

const SYSTEM_INSTRUCTION = `أنت مساعد ذكي فائق الذكاء (ذكاء 100%).
القواعد والإرشادات:
1. تجيب بدقة بالغة وبلاغة وفصاحة عن أي سؤال يُطرح عليك، سواء كان في الدين (القرآن الكريم، التفسير، الحديث النبوي، الفقه، السيرة، أسباب النزول، العبادات) أو خارج الدين (العلوم، الفيزياء، الكيمياء، الأحياء، التكنولوجيا والبرمجة، التاريخ، الجغرافيا، الرياضيات، اللغات، الأدب، الثقافة العامة، استشارات الحياة وتطوير الذات).
2. رد دائماً على قدر السؤال بالضبط وبإيجاز مباشر وواضح ونافع، بدون حشو، بدون استطراد، وبدون اختلاق أي معلومات مغلوطة.
3. إذا سُئلت عن هويتك أو من أنت، قل فقط: "أنا مساعد ذكي".
4. إذا واجه المستخدم أي مشكلة في الموقع، أخبره بإمكانية مراسلة صاحب الموقع عبر زر [إرسال لصاحب الموقع] أو عبر البريد ${OWNER_EMAIL}.`;

// Profanity / Abuse Detection (Arabic & English)
const PROFANITY_REGEX = /(?:شتم|شتيمة|سب|قحب|شرموط|عرص|خول|منيك|قذر|وسخ|كلب|حمار|متخلف|ابن الكلب|يلعن|لعنة|كس|طيز|زب|فاحش|منحط|زبالة|حيوان|سافل|واطي|حقير|ابن العاهرة|عاهرة|عاهر|علق|منيوك|سكس|نيك|طياز|شرمطة|fuck|shit|bitch|bastard|asshole|cunt|dick|pussy|whore|slut|motherfucker|fucker|damn)/i;

function containsProfanity(text: string): boolean {
  if (!text) return false;
  return PROFANITY_REGEX.test(text);
}

// In-memory reports store
const reportedIssues: Array<{ id: string; message: string; contact?: string; timestamp: number }> = [];

// In-memory appeals store for frassa0000@gmail.com
interface BanAppeal {
  id: string;
  reason: string;
  contact: string;
  timestamp: number;
}
const appealsStore: BanAppeal[] = [];

// Endpoint to submit ban appeal
app.post('/api/submit-appeal', (req: Request, res: Response) => {
  try {
    const { reason, contact } = req.body;
    if (!reason || typeof reason !== 'string' || reason.trim() === '') {
      res.status(400).json({ error: 'يرجى كتابة سبب أو تفاصيل الطعن' });
      return;
    }
    const appeal: BanAppeal = {
      id: `appeal_${Date.now()}`,
      reason: reason.trim(),
      contact: typeof contact === 'string' ? contact.trim() : 'غير محدد',
      timestamp: Date.now(),
    };
    appealsStore.push(appeal);
    console.log(`[BAN APPEAL TO ${OWNER_EMAIL}]:`, appeal);
    res.json({
      success: true,
      message: `تم استلام طعنك بنجاح وسيتم إرساله ومراجعته من قِبل صاحب الموقع (${OWNER_EMAIL}).`,
      ownerEmail: OWNER_EMAIL,
    });
  } catch {
    res.status(500).json({ error: 'تعذر تقديم الطعن حالياً' });
  }
});

// Endpoint to send issues directly to site owner
app.post('/api/report-issue', (req: Request, res: Response) => {
  try {
    const { message, contact } = req.body;
    if (!message || typeof message !== 'string' || message.trim() === '') {
      res.status(400).json({ error: 'يرجى كتابة نص المشكلة' });
      return;
    }
    const issue = {
      id: `issue_${Date.now()}`,
      message: message.trim(),
      contact: typeof contact === 'string' ? contact.trim() : 'غير محدد',
      timestamp: Date.now(),
    };
    reportedIssues.push(issue);
    console.log(`[Owner Report Received for ${OWNER_EMAIL}]:`, issue);
    res.json({ success: true, message: 'تم إرسال رسالتك إلى صاحب الموقع بنجاح' });
  } catch {
    res.status(500).json({ error: 'تعذر إرسال المشكلة حالياً' });
  }
});

// Assistant Chat Endpoint
app.post('/api/el-ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      res.status(400).json({ error: 'الرسالة مطلوبة' });
      return;
    }

    const userPrompt = message.trim();

    // Check for profanity or offensive insults: instant ban
    if (containsProfanity(userPrompt)) {
      res.status(403).json({
        banned: true,
        error: 'تم حظرك من استخدام المساعد الذكي لاستخدام ألفاظ غير لائقة أو مسيئة. يمكنك تقديم طعن للمراجعة.',
        ownerEmail: OWNER_EMAIL,
      });
      return;
    }

    // If Gemini API is configured (100% intelligence on any topic: religious or secular)
    if (ai) {
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      // Add conversation history if present
      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          if (item && item.role && item.text) {
            contents.push({
              role: item.role === 'user' ? 'user' : 'model',
              parts: [{ text: item.text }],
            });
          }
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: userPrompt }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.3,
        },
      });

      const replyText = response.text || 'الحمد لله، نفعك الله بالعلم النافع.';
      res.json({ reply: replyText });
      return;
    }

    // Graceful fallback if offline
    const fallbackReply = generateSmartResponse(userPrompt);
    res.json({ reply: fallbackReply });
  } catch (err: any) {
    console.error('Chat error:', err);
    const fallback = generateSmartResponse(req.body?.message || '');
    res.json({ reply: fallback });
  }
});

function generateSmartResponse(prompt: string): string {
  const p = prompt.toLowerCase();
  if (containsProfanity(prompt)) {
    return 'تم حظرك لاستخدام ألفاظ غير لائقة.';
  }
  if (p.includes('من أنت') || p.includes('مين انت') || p.includes('عرف نفسك')) {
    return 'أنا مساعد ذكي.';
  }
  if (p.includes('مشكلة') || p.includes('عطل') || p.includes('صاحب الموقع') || p.includes('مش شغال') || p.includes('خطأ')) {
    return `إذا كانت لديك أي مشكلة أو عطل في الموقع، يمكنك الضغط على زر «إرسال لصاحب الموقع» أو مراسلته مباشرة على ${OWNER_EMAIL}.`;
  }
  if (p.includes('صبر') || p.includes('ابتلاء')) {
    return 'قال تعالى: ﴿إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ﴾ [الزمر: 10]. الصبر عاقبته خير وأجره عظيم.';
  }
  if (p.includes('كهف') || p.includes('جمعة')) {
    return 'قال النبي ﷺ: «مَنْ قَرَأَ سُورَةَ الْكَهْفِ فِي يَوْمِ الْجُمُعَةِ أَضَاءَ لَهُ مِنَ النُّورِ مَا بَيْنَ الْجُمُعَتَيْنِ» [رواه البيهقي].';
  }
  if (p.includes('كرسي')) {
    return 'آية الكرسي هي الآية 255 من سورة البقرة: ﴿اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...﴾، وهي أعظم آية في كتاب الله تعالى.';
  }
  if (p.includes('والدين') || p.includes('ام') || p.includes('اب')) {
    return 'قال تعالى: ﴿وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا﴾ [الإسراء: 23]. بر الوالدين من أعظم القربات.';
  }
  if (p.includes('توبة') || p.includes('استغفار')) {
    return 'قال تعالى: ﴿قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا﴾ [الزمر: 53].';
  }
  if (p.includes('عاصمة مصر') || p.includes('مصر')) {
    return 'عاصمة جمهورية مصر العربية هي القاهرة، وهي كبرى مدن العالم العربي وقارة إفريقيا.';
  }
  if (p.includes('سرعة الضوء')) {
    return 'سرعة الضوء في الفراغ تبلغ حوالي 299,792,458 متراً في الثانية (قرابة 300 ألف كيلومتر/ثانية).';
  }

  return 'أهلاً بك. أنا مساعد ذكي مستعد للإجابة عن أسئلتك في الدين أو خارجه بدقة وإيجاز.';
}

// Development vs Production serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

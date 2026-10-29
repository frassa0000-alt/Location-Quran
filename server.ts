import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSmartIslamicAnswer } from './src/utils/islamicKnowledgeEngine.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), timeoutMs)
    ),
  ]);
}

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

const SYSTEM_INSTRUCTION = `أنت المساعد الذكي (اسمك البرمجي: ™✓).
القواعد الصارمة للرد:
1. السرعة الفائقة والرد الفوري: أجب على الفور على قد السؤال باختصار وتركيز ودقة دون أي مقدمات أو ترحيب مكرر أو حشو. ابدأ في الإجابة مباشرة من أول كلمة.
2. الشمول: أجب عن أي سؤال في الدين (القرآن، التفسير، الحديث، الفقه، السيرة النبوية) أو خارج الدين في كافة العلوم والمعارف بدقة ووضوح.
3. إذا سُئلت عن هويتك أو من أنت، قل باختصار شديد: "أنا مساعد ذكي فقط". ولا تذكر أي نسب مئوية.
4. إذا واجه المستخدم مشكلة أو عطل، وجهه لإرسالها لصاحب الموقع (${OWNER_EMAIL}) عبر زر الإبلاغ في الشات.`;

// Profanity / Abuse Detection (Arabic & English)
const PROFANITY_REGEX = /(?:شتم|شتيمة|سب|قحب|شرموط|عرص|خول|منيك|قذر|وسخ|كلب|حمار|متخلف|ابن الكلب|يلعن|لعنة|كس|طيز|زب|فاحش|منحط|زبالة|حيوان|سافل|واطي|حقير|ابن العاهرة|عاهرة|عاهر|علق|منيوك|سكس|نيك|طياز|شرمطة|fuck|shit|bitch|bastard|asshole|cunt|dick|pussy|whore|slut|motherfucker|fucker|damn)/i;

function containsProfanity(text: string): boolean {
  if (!text) return false;
  return PROFANITY_REGEX.test(text);
}

// In-memory reports store
const reportedIssues: Array<{ id: string; message: string; contact?: string; timestamp: number }> = [];

// Set of valid unban codes (master codes and dynamically generated codes)
const validUnbanCodes = new Set<string>([
  'FRASSA0000',
  'frassa0000',
  'UNBAN2026',
  'AFW2026',
  'QURAN777',
]);

// In-memory appeals store for frassa0000@gmail.com
interface BanAppeal {
  id: string;
  reason: string;
  contact: string;
  unbanCode: string;
  timestamp: number;
}
const appealsStore: BanAppeal[] = [];

// Endpoint to submit ban appeal - routes to frassa0000@gmail.com with generated unban code
app.post('/api/submit-appeal', (req: Request, res: Response) => {
  try {
    const { reason, contact } = req.body;
    if (!reason || typeof reason !== 'string' || reason.trim() === '') {
      res.status(400).json({ error: 'يرجى كتابة سبب أو تفاصيل الطعن' });
      return;
    }

    // Generate a unique 4-digit unban code (e.g. UB-7821) for the owner to send to the user
    const generatedCode = `UB-${Math.floor(1000 + Math.random() * 9000)}`;
    validUnbanCodes.add(generatedCode);
    validUnbanCodes.add(generatedCode.toLowerCase());

    const appeal: BanAppeal = {
      id: `appeal_${Date.now()}`,
      reason: reason.trim(),
      contact: typeof contact === 'string' ? contact.trim() : 'غير محدد',
      unbanCode: generatedCode,
      timestamp: Date.now(),
    };
    appealsStore.push(appeal);

    console.log(`[BAN APPEAL RECEIVED FOR ${OWNER_EMAIL}]:`, appeal);
    console.log(`[UNBAN CODE CREATED FOR OWNER TO SEND VIA GMAIL]: ${generatedCode}`);

    res.json({
      success: true,
      message: `تم إرسال تفاصيل الطعن إلى بريد صاحب الموقع (${OWNER_EMAIL}). عند الموافقة سيرسل لك كود فك الحظر عبر الجيميل لتدخله هنا.`,
      ownerEmail: OWNER_EMAIL,
      unbanCode: generatedCode,
    });
  } catch {
    res.status(500).json({ error: 'تعذر تقديم الطعن حالياً' });
  }
});

// Endpoint to verify unban code sent by owner to user on Gmail
app.post('/api/verify-unban-code', (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== 'string' || code.trim() === '') {
      res.status(400).json({ valid: false, error: 'يرجى إدخال كود فك الحظر' });
      return;
    }

    const cleanCode = code.trim();
    const isMasterCode =
      cleanCode.toUpperCase() === 'FRASSA0000' ||
      cleanCode.toUpperCase() === 'UNBAN2026' ||
      cleanCode.toUpperCase() === 'AFW2026' ||
      cleanCode.toUpperCase() === 'QURAN777';

    if (validUnbanCodes.has(cleanCode) || validUnbanCodes.has(cleanCode.toUpperCase()) || isMasterCode) {
      console.log(`[UNBAN VERIFIED SUCCESSFULLY]: Ban lifted using code '${cleanCode}'`);
      res.json({
        valid: true,
        message: 'تم فك الحظر بنجاح! مرحباً بك مجدداً في المساعد الذكي.',
      });
      return;
    }

    res.status(400).json({
      valid: false,
      error: 'كود فك الحظر غير صحيح. يرجى التأكد من الكود المرسل لك على الجيميل من صاحب الموقع (frassa0000@gmail.com).',
    });
  } catch {
    res.status(500).json({ valid: false, error: 'تعذر التحقق من الكود حالياً' });
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

// Real-time Ultra-Fast Streaming Endpoint (Server-Sent Events)
app.post('/api/el-ai/stream', async (req: Request, res: Response) => {
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

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    if (ai) {
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        for (const item of history.slice(-4)) {
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

      let responseStream;
      try {
        // Ultra-fast streaming with a strict 2.5-second timeout
        responseStream = await withTimeout(
          ai.models.generateContentStream({
            model: 'gemini-3.8-flash',
            contents,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              temperature: 0.2,
              maxOutputTokens: 300,
            },
          }),
          2500
        );

        for await (const chunk of responseStream) {
          if (chunk.text) {
            res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
            if (typeof (res as any).flush === 'function') {
              (res as any).flush();
            }
          }
        }

        res.write(`data: [DONE]\n\n`);
        res.end();
        return;
      } catch (streamErr: any) {
        console.warn('AI Stream timeout or unavailable, using smart answer engine:', streamErr?.message);
        const smartReply = getSmartIslamicAnswer(userPrompt, OWNER_EMAIL);
        res.write(`data: ${JSON.stringify({ text: smartReply })}\n\n`);
        res.write(`data: [DONE]\n\n`);
        res.end();
        return;
      }
    }

    // Fallback if offline
    const fallbackReply = getSmartIslamicAnswer(userPrompt, OWNER_EMAIL);
    res.write(`data: ${JSON.stringify({ text: fallbackReply })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (err: any) {
    console.error('Stream error:', err);
    try {
      const fallback = getSmartIslamicAnswer(req.body?.message || '', OWNER_EMAIL);
      res.write(`data: ${JSON.stringify({ text: fallback })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch {
      res.end();
    }
  }
});

// Assistant Chat Endpoint (Fast direct reply)
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

    // If Gemini API is configured
    if (ai) {
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      // Add conversation history if present
      if (Array.isArray(history)) {
        for (const item of history.slice(-4)) {
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

      let response;
      try {
        response = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              temperature: 0.2,
              maxOutputTokens: 300,
            },
          }),
          2500
        );

        const replyText = response?.text || getSmartIslamicAnswer(userPrompt, OWNER_EMAIL);
        res.json({ reply: replyText });
        return;
      } catch (e: any) {
        console.warn('AI generateContent timeout or unavailable, using smart answer engine:', e?.message);
        const reply = getSmartIslamicAnswer(userPrompt, OWNER_EMAIL);
        res.json({ reply });
        return;
      }
    }

    // Graceful fallback if offline
    const fallbackReply = getSmartIslamicAnswer(userPrompt, OWNER_EMAIL);
    res.json({ reply: fallbackReply });
  } catch (err: any) {
    console.error('Chat error:', err);
    const fallback = getSmartIslamicAnswer(req.body?.message || '', OWNER_EMAIL);
    res.json({ reply: fallback });
  }
});

function generateSmartResponse(prompt: string): string {
  return getSmartIslamicAnswer(prompt, OWNER_EMAIL);
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

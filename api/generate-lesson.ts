import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, levelId } = req.body || {};

    if (!topic || !levelId) {
      return res.status(400).json({ error: 'Missing topic or levelId' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenRouter API key is not configured' });
    }

    const prompt = `أَنْتَ عَالِمٌ وَبَاحِثٌ مَالِكِيٌّ رَفِيعُ المُسْتَوَى. قُمْ بِإِعْدَادِ دَرْسٍ لِـ "${topic}" بِمُسْتَوَى "${levelId}".
      أَرْجِعِ النَّتِيجَةَ بِصِيغَةِ JSON حَصْرًا. تَقَيَّدْ بِالتَّشْكِيلِ الكَامِلِ.
      الهَيْكَلُ المَطْلُوبُ:
      {
        "title": "عنوان الدرس",
        "nazmOrMatn": "النص الموثق",
        "introduction": "مقدمة",
        "content": ["فقرة 1", "فقرة 2"],
        "evidence": "الدليل الأصولي",
        "examples": ["مثال 1", "مثال 2"],
        "mnemonics": [{"verse": "شطر أو بيت", "explanation": "شرحه"}],
        "riddles": [{"question": "اللغز", "answer": "الجواب"}],
        "comparativeFiqh": "الخلاف العالي",
        "references": ["المصدر 1", "المصدر 2"],
        "quiz": [{"question": "سؤال", "options": ["أ", "ب", "ج"], "correctAnswer": 0, "explanation": "توضيح"}]
      }`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://malekite-academy.v2',
        'X-Title': 'Malekite Academy v2',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 4000
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'API Error');

    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('No content');

    // Robust extraction
    let jsonStr = '';
    const startIdx = content.indexOf('{');
    const endIdx = content.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      jsonStr = content.substring(startIdx, endIdx + 1);
    } else {
      jsonStr = content.trim();
    }

    const parsed = JSON.parse(jsonStr);

    // --- SAFETY LAYER: FORCING STRINGS ---
    const ensureString = (val: any): string => {
      if (!val) return '';
      if (typeof val === 'string') return val;
      if (typeof val === 'object') {
        return val.text || val.content || val.value || JSON.stringify(val);
      }
      return String(val);
    };

    const ensureStringArray = (arr: any): string[] => {
      if (!Array.isArray(arr)) return [ensureString(arr)];
      return arr.map(item => ensureString(item)).filter(s => s.length > 0);
    };

    const result = {
      title: ensureString(parsed.title) || `${topic} - ${levelId}`,
      nazmOrMatn: ensureString(parsed.nazmOrMatn),
      introduction: ensureString(parsed.introduction),
      content: ensureStringArray(parsed.content),
      evidence: ensureString(parsed.evidence),
      examples: ensureStringArray(parsed.examples),
      mnemonics: Array.isArray(parsed.mnemonics) ? parsed.mnemonics.map((m: any) => ({
        verse: ensureString(m.verse || m.text),
        explanation: ensureString(m.explanation || m.content)
      })) : [],
      riddles: Array.isArray(parsed.riddles) ? parsed.riddles.map((r: any) => ({
        question: ensureString(r.question),
        answer: ensureString(r.answer)
      })) : [],
      comparativeFiqh: ensureString(parsed.comparativeFiqh),
      references: ensureStringArray(parsed.references),
      quiz: Array.isArray(parsed.quiz) ? parsed.quiz.map((q: any) => ({
        question: ensureString(q.question),
        options: ensureStringArray(q.options),
        correctAnswer: Number(q.correctAnswer) || 0,
        explanation: ensureString(q.explanation)
      })) : []
    };

    return res.status(200).json(result);

  } catch (error: any) {
    console.error('Final Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}

import { GoogleGenAI, Type } from '@google/genai';

const lessonSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    matn: { type: Type.STRING },
    body: { type: Type.STRING },
    detailedExamples: { type: Type.ARRAY, items: { type: Type.STRING } },
    fiqhIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
    fiqhRiddles: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          riddle: { type: Type.STRING },
          answer: { type: Type.STRING }
        },
        required: ['riddle', 'answer']
      }
    },
    evidence: { type: Type.STRING },
    comparativeFiqh: { type: Type.STRING },
    references: { type: Type.ARRAY, items: { type: Type.STRING } },
    quiz: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.INTEGER },
          explanation: { type: Type.STRING }
        },
        required: ['question', 'options', 'correctAnswer', 'explanation']
      }
    }
  },
  required: [
    'title',
    'matn',
    'body',
    'detailedExamples',
    'fiqhIssues',
    'fiqhRiddles',
    'evidence',
    'comparativeFiqh',
    'references',
    'quiz'
  ]
};

const allowedModels = new Set(['gemini-3-flash-preview', 'gemini-3-pro-preview']);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key is not configured' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const model = allowedModels.has(body?.model) ? body.model : 'gemini-3-flash-preview';
    const contents = typeof body?.contents === 'string' ? body.contents : '';

    if (!contents.trim()) {
      return res.status(400).json({ error: 'Missing lesson prompt' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: lessonSchema
      }
    });

    return res.status(200).json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('generate-lesson failed', error);
    return res.status(500).json({ error: 'Lesson generation failed' });
  }
}

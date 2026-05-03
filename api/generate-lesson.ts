import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, levelId } = req.body || {};

    if (!topic || !levelId) {
      return res.status(400).json({ 
        error: 'Missing topic or levelId', 
        received: req.body 
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'OpenRouter API key is not configured in Vercel environment variables.' 
      });
    }

    const prompt = `أَنْتَ عَالِمٌ وَبَاحِثٌ مَالِكِيٌّ رَفِيعُ المُسْتَوَى. قُمْ بِإِعْدَادِ دَرْسٍ لِـ "${topic}" بِمُسْتَوَى "${levelId}".
      أَرْجِعِ النَّتِيجَةَ بِصِيغَةِ JSON حَصْرًا. تَقَيَّدْ بِالتَّشْكِيلِ الكَامِلِ.
      الهَيْكَلُ المَطْلُوبُ: nazmOrMatn, content, evidence, examples, riddles, comparativeFiqh, references, quiz.`;

    const model = 'google/gemini-2.0-flash-001';
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://malekite-academy.v2',
        'X-Title': 'Malekite Academy v2',
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        top_p: 0.9,
        max_tokens: 4000
      })
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return res.status(500).json({ 
        error: 'OpenRouter returned non-JSON response', 
        rawResponse: responseText.substring(0, 500) 
      });
    }

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `OpenRouter Error: ${data.error?.message || 'Unknown error'}`,
        code: data.error?.code 
      });
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(500).json({ 
        error: 'No content received from OpenRouter choices', 
        data: data 
      });
    }

    // --- ROBUST JSON EXTRACTION ---
    let jsonStr = '';
    const startIdx = content.indexOf('{');
    const endIdx = content.lastIndexOf('}');
    
    if (startIdx !== -1 && endIdx !== -1) {
      jsonStr = content.substring(startIdx, endIdx + 1);
    } else {
      jsonStr = content.trim();
    }

    try {
      const parsed = JSON.parse(jsonStr);
      
      const contentStr = parsed.content || '';
      const contentArray = typeof contentStr === 'string' 
        ? contentStr.split(/\n\s*\n|\.\s*\n|\.(?=\s*[A-Zأ-ي])/).map((s: string) => s.trim()).filter((s: string) => s.length > 20)
        : (Array.isArray(contentStr) ? contentStr : [contentStr]);

      const result = {
        title: parsed.title || `${topic} - ${levelId}`,
        nazmOrMatn: parsed.nazmOrMatn || '',
        introduction: parsed.introduction || '',
        content: contentArray.length > 0 ? contentArray : [contentStr],
        evidence: parsed.evidence || '',
        examples: parsed.examples || [],
        importantIssues: parsed.importantIssues || [],
        mnemonics: parsed.mnemonics || [],
        riddles: parsed.riddles || [],
        comparativeFiqh: parsed.comparativeFiqh || '',
        references: parsed.references || [],
        quiz: parsed.quiz || []
      };

      return res.status(200).json(result);
    } catch (parseErr) {
      return res.status(500).json({ 
        error: 'JSON Parse Error of AI content', 
        snippet: jsonStr.substring(0, 500) 
      });
    }

  } catch (error: any) {
    return res.status(500).json({ 
      error: 'Final Handler Crash', 
      message: error.message 
    });
  }
}

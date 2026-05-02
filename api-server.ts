import { createServer } from 'http';
import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

const envPath = existsSync('.env.local') ? '.env.local' : '.env';
dotenv.config({ path: resolve(envPath) });
console.log(`Loaded env from: ${envPath}`);
console.log(`API Key present: ${!!process.env.OPENROUTER_API_KEY}`);

const PORT = 3006;

const server = createServer(async (req, res) => {
  // Health check endpoint
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (req.url === '/api/generate-lesson' && req.method === 'POST') {
    let body = '';
    
    req.on('error', (err) => {
      console.error('Request error:', err);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Bad request' }));
    });

    for await (const chunk of req) {
      body += chunk;
    }

    try {
      console.log('Received body:', body.substring(0, 200));
      const { topic, levelId } = JSON.parse(body);

      if (!topic || !levelId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing topic or levelId' }));
        return;
      }

      const prompt = `أَنْتَ عَالِمٌ مَالِكِيٌّ. قُمْ بِإِعْدَادِ دَرْسٍ قَصِيرٍ عَنْ '${topic}' بِمُسْتَوَى '${levelId}'.

        قُواعدٌ صَارِمَةٌ:
        1. أَرْجِعِ النَّتِيجَةَ بِصِيغَةِ JSON حَصْرًا.
        2. لَا تَسْتَخْدِمْ عَلَامَاتِ الاقْتِبَاسِ المُزْدَوَجَةِ ( " ) دَاخِلَ قِيمِ النُّصُوصِ. اسْتَخْدِمْ عَلَامَاتِ الاقْتِبَاسِ المُفَرَّدَةِ ( ' ) بَدَلًا مِنْهَا.
        3. تَأَكَّدْ مِنْ صِحَّةِ صِيغَةِ JSON.

        البِنْيَةُ المَطْلُوبَةُ:
        {
          "nazmOrMatn": "نَصٌّ مَالِكِيٌّ مُوَثَّقٌ",
          "content": "شَرْحٌ مُفَصَّلٌ",
          "evidence": "دَلِيلٌ مِنَ الكِتَابِ أَوِ السُّنَّةِ",
          "examples": ["مِثَالٌ 1", "مِثَالٌ 2"],
          "riddles": [{"question": "سُؤَالٌ", "answer": "جَوَابٌ"}],
          "comparativeFiqh": "مُقَارَنَةٌ مَعَ المَذَاهِبِ الأُخْرَى",
          "references": ["المُدَوَّنَةِ", "الرِّسَالَةِ"],
          "quiz": [{"question": "سُؤَالٌ", "options": ["أ", "ب", "ج"], "correctAnswer": 0}]
        }`;

      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'OpenRouter API key is not configured' }));
        return;
      }

      const model = 'google/gemini-2.5-pro-preview';
      
      console.log('--- [OPENROUTER OPTIMIZED CALL] ---');
      console.log('Model:', model);
      console.log('Topic:', topic);
      console.log('API Key length:', apiKey.length);

      const controller = new AbortController();
      const apiTimeout = setTimeout(() => {
        console.log('Aborting API call due to timeout');
        controller.abort();
      }, 15000);

      console.log('Starting fetch...');
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
          max_tokens: 8000
        }),
        signal: controller.signal
      });
      clearTimeout(apiTimeout);

      console.log('Fetch completed, status:', response.status);
      const responseText = await response.text();
      console.log('Response text received, length:', responseText.length);
      console.log('Response preview:', responseText.substring(0, 200));
      const data = JSON.parse(responseText);
      console.log('Response data parsed');

      if (!response.ok) {
        const errorMsg = data.error?.message || `API Error ${response.status}`;
        const errorCode = data.error?.code || 'unknown';
        console.error(`[OPENROUTER ERROR] Code: ${errorCode} | Message: ${errorMsg}`);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `OpenRouter Error: ${errorMsg}` }));
        return;
      }

      console.log('Data keys:', Object.keys(data));
      console.log('Choice keys:', data.choices?.[0] ? Object.keys(data.choices[0]) : 'no choices');
      console.log('Message keys:', data.choices?.[0]?.message ? Object.keys(data.choices[0].message) : 'no message');
      
      const content = data.choices?.[0]?.message?.content;
      const reasoning = data.choices?.[0]?.message?.reasoning;
      console.log('Content present:', !!content);
      console.log('Content length:', content?.length);
      console.log('Reasoning present:', !!reasoning);
      
      if (!content) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No content received from model', data: data.choices?.[0] }));
        return;
      }

      let jsonStr = content.trim();
      try {
        // Strip markdown code blocks if present
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.slice(7);
        } else if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.slice(3);
        }
        if (jsonStr.endsWith('```')) {
          jsonStr = jsonStr.slice(0, -3);
        }
        jsonStr = jsonStr.trim();
        
          const parsed = JSON.parse(jsonStr);
          
          // Convert content string to array: split by double newlines or periods
          const contentStr = parsed.content || '';
          const contentArray = contentStr
            .split(/\n\s*\n|\.\s*\n|\.(?=\s*[A-Zأ-ي])/)
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 20);
          
          // If content is too short as single piece, keep as one element
          const finalContent = contentArray.length > 1 ? contentArray : [contentStr];
          
          const result = {
            title: parsed.title || `${topic} - ${levelId}`,
            nazmOrMatn: parsed.nazmOrMatn || '',
            introduction: parsed.introduction || '',
            content: finalContent,
            evidence: parsed.evidence || '',
            examples: parsed.examples || [],
            importantIssues: parsed.importantIssues || [],
            mnemonics: parsed.mnemonics || [],
            riddles: parsed.riddles || [],
            comparativeFiqh: parsed.comparativeFiqh || '',
            references: parsed.references || [],
            quiz: parsed.quiz || []
          };
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
      } catch (parseErr) {
        console.error('JSON Parse Error. Stripped string:', jsonStr.substring(0, 500));
        console.error('JSON Parse Error. Original content:', content.substring(0, 500));
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Le modèle a renvoyé un format invalide. Réessayez.' }));
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('API call timed out');
        res.writeHead(504, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'API request timed out. Please try again.' }));
        return;
      }
      console.error('Final Handler Error:', error.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
});

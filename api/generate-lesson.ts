import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, levelId } = req.body;

    if (!topic || !levelId) {
      return res.status(400).json({ error: 'Missing topic or levelId' });
    }

    const prompt = `أَنْتَ عَالِمٌ وَبَاحِثٌ مَالِكِيٌّ رَفِيعُ المُسْتَوَى. قُمْ بِإِعْدَادِ دَرْسٍ لِـ "${topic}" بِمُسْتَوَى "${levelId}" يُعَادِلُ الدِّرَاسَاتِ العُلْيَا فِي المَعَاهِدِ الشَّرْعِيَّةِ الكُبْرَى.

      يَجِبُ أَنْ يَكُونَ المُحْتَوَى "سَخِيًّا بِالعِلْمِ" وَكَثِيفًا وَمُوَجَّهًا لِطُلَّابِ العِلْمِ الجَادِّينَ، مَعَ الِالْتِزَامِ التَّامِّ بِمَذْهَبِ الإِمَامِ مَالِكِ بْنِ أَنَسٍ وَالمُصْطَلَحَاتِ الدَّقِيقَةِ (المُعْتَمَد، الأَشْهَر، المَشْهُور، مَا جَرَى بِهِ العَمَل).

      الهَيْكَلُ المَطْلُوبُ (8 أَجْزَاءٍ أَسَاسِيَّةٍ):
      1. nazmOrMatn: نَصٌّ مُوَثَّقٌ مِنَ المَصَادِرِ المَالِكِيَّةِ الأَصْلِيَّةِ.
      2. content: تَقْرِيرٌ فِقْهِيٌّ مَتِينٌ يَشْرَحُ المَسَائِلَ بِعُمْقٍ.
      3. evidence: اسْتِخْرَاجُ الأَحْكَامِ بِالمَنْهَجِيَّةِ الأُصُولِيَّةِ.
      4. examples: حَالَاتٌ نَادِرَةٌ أَوْ مُعَاصِرَةٌ.
      5. riddles: لُغْزٌ فِقْهِيٌّ.
      6. comparativeFiqh: تَحْلِيلُ الخِلَافِ العَالِي مَعَ تَرْجِيحِ المَالِكِيَّةِ.
      7. references: التَّوْثِيقُ مِنَ المَصَادِرِ الأُمِّ.
      8. quiz: 7 أَسْئِلَةٍ مَنْهَجِيَّةٍ دَقِيقَةٍ.

      أَرْجِعِ النَّتِيجَةَ بِصِيغَةِ JSON حَصْرًا. تَقَيَّدْ بِالتَّشْكِيلِ الكَامِلِ.
      مُلَاحَظَةٌ هَامَّةٌ: لَا تَضَعِ اسْمَ المُسْتَوَى فِي حَقْلِ الـ "title".`;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OpenRouter API key is not configured');

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

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error?.message || `API Error ${response.status}`;
      throw new Error(`OpenRouter Error: ${errorMsg}`);
    }

    const responseText = data.choices?.[0]?.message?.content;
    if (!responseText) throw new Error('No content received from model');

    // --- ROBUST JSON EXTRACTION ---
    let jsonStr = '';
    const startIdx = responseText.indexOf('{');
    const endIdx = responseText.lastIndexOf('}');
    
    if (startIdx !== -1 && endIdx !== -1) {
      jsonStr = responseText.substring(startIdx, endIdx + 1);
    } else {
      jsonStr = responseText.trim();
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
      console.error('JSON Parse Error. Cleaned string:', jsonStr.substring(0, 500));
      throw new Error('Le modèle a renvoyé un format invalide. Réessayez.');
    }

  } catch (error: any) {
    console.error('API Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}

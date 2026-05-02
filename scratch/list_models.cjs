const https = require('https');
const key = process.env.OPENROUTER_API_KEY || 'YOUR_API_KEY';
const req = https.request({
  hostname: 'openrouter.ai',
  path: '/api/v1/models',
  method: 'GET',
  headers: { 'Authorization': 'Bearer ' + key }
}, (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const j = JSON.parse(d);
    const models = j.data
      .filter(m => m.pricing && parseFloat(m.pricing.prompt) >= 0)
      .map(m => ({
        id: m.id,
        name: m.name,
        ctx: m.context_length,
        price_in: (parseFloat(m.pricing.prompt) * 1000000).toFixed(2),
        price_out: (parseFloat(m.pricing.completion) * 1000000).toFixed(2)
      }))
      .filter(m => m.ctx >= 30000)
      .sort((a, b) => b.ctx - a.ctx);
    console.log('TOTAL models (ctx>=30k):', models.length);
    models.forEach(m => console.log(m.id + ' | ' + m.name + ' | ctx=' + m.ctx + ' | in=' + m.price_in + ' | out=' + m.price_out));
  });
});
req.on('error', e => console.log('ERROR:', e.message));
req.end();

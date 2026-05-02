import { chromium } from 'playwright';

async function dump() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3005');
  
  const storage = await page.evaluate(() => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data[key] = localStorage.getItem(key);
    }
    return data;
  });
  
  console.log(JSON.stringify(storage, null, 2));
  await browser.close();
}

dump().catch(err => {
  console.error(err);
  process.exit(1);
});

const puppeteer = require('puppeteer-core');
const http = require('http');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const mimeTypes = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' };

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  let filePath = path.join(distDir, reqPath === '/' ? 'index.html' : reqPath);
  if (!path.extname(filePath)) filePath = path.join(distDir, 'index.html');
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(path.join(distDir, 'index.html')).pipe(res);
  }
});

server.listen(8108, async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 393, height: 851, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  await page.goto('http://localhost:8108/food/search', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  // Click on "রান্না করা (Cooked)" state filter chip
  const chipCoord = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const cookedChip = all.find(el => el.textContent && el.textContent.trim() === 'রান্না করা (Cooked)');
    if (cookedChip) {
      const r = cookedChip.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
    return null;
  });

  if (chipCoord) {
    await page.mouse.click(chipCoord.x, chipCoord.y);
    await new Promise(r => setTimeout(r, 800));
  }

  // Find the first card for cooked rice (Rice BR-28 boiled)
  const cardCoord = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const item = all.find(el => el.textContent && el.textContent.includes('১০৯') && el.getBoundingClientRect().height > 50);
    if (item) {
      const r = item.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
    return null;
  });

  console.log('Card coordinate:', cardCoord);
  if (cardCoord) {
    await page.mouse.click(cardCoord.x, cardCoord.y);
    await new Promise(r => setTimeout(r, 1200));
  }

  await page.screenshot({ path: path.join(__dirname, '..', 'docs', 'screenshots', 'food_quantity_sheet_state_switcher.png') });
  await browser.close();
  server.close();
  console.log('Saved quantity sheet screenshot!');
});

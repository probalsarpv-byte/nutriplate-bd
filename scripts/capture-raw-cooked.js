const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const distDir = path.join(__dirname, '..', 'dist');
const outDir = path.join(__dirname, '..', 'docs', 'screenshots');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  let filePath = path.join(distDir, reqPath === '/' ? 'index.html' : reqPath);

  if (!path.extname(filePath)) {
    filePath = path.join(distDir, 'index.html');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    const indexHtml = path.join(distDir, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(indexHtml).pipe(res);
  }
});

const PORT = 8097;

server.listen(PORT, async () => {
  console.log(`Local preview server listening on port ${PORT}...`);
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  try {
    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({
      width: 393,
      height: 851,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });

    // 1. Food Search with Raw / Cooked / Prepared filters and badges
    console.log('Capturing Food Search with State Filters...');
    await page.goto(`http://localhost:${PORT}/food/search?mealType=lunch`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(outDir, 'food_search_state_filters.png') });

    // 2. Open Food Quantity Sheet on first food card
    console.log('Opening Food Quantity Sheet with State Switcher...');
    const cardEl = await page.evaluateHandle(() => {
      // Find food cards
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.find(el => el.textContent && el.textContent.includes('kcal/100g'));
    });
    const el = cardEl ? cardEl.asElement() : null;
    if (el) {
      const box = await el.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        await new Promise(r => setTimeout(r, 1200));
        await page.screenshot({ path: path.join(outDir, 'food_quantity_sheet_state_switcher.png') });
      }
    }

    // 3. Food Tracker Diary with Raw / Cooked / Prepared badges
    console.log('Capturing Food Tracker with State Badges...');
    await page.goto(`http://localhost:${PORT}/tracker`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(outDir, 'food_tracker_state_badges.png') });

    // 4. Recipes Screen and Custom Portion Logging Modal
    console.log('Capturing Recipes Screen with Portion Modal...');
    await page.goto(`http://localhost:${PORT}/recipes`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));
    
    // Click "ডায়েরিতে যোগ" button
    const logBtnHandle = await page.evaluateHandle(() => {
      const all = Array.from(document.querySelectorAll('*'));
      return all.find(el => el.textContent && el.textContent.trim() === 'ডায়েরিতে যোগ');
    });
    const logEl = logBtnHandle ? logBtnHandle.asElement() : null;
    if (logEl) {
      const box = await logEl.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        await new Promise(r => setTimeout(r, 1200));
        await page.screenshot({ path: path.join(outDir, 'recipe_portion_modal.png') });
      }
    }

    await browser.close();
    server.close();
    console.log('Successfully captured all raw vs cooked screenshots in docs/screenshots/!');
    process.exit(0);
  } catch (err) {
    console.error('Error during screenshot capture:', err);
    server.close();
    process.exit(1);
  }
});

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

const PORT = 8096;

server.listen(PORT, async () => {
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

    // 1. Capture Food Quantity Sheet
    await page.goto(`http://localhost:${PORT}/food/search`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));

    // Find and click the element containing "যব, গোটা"
    const clicked = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const foodNode = elements.find(el => el.textContent && el.textContent.trim() === 'যব, গোটা');
      if (foodNode) {
        foodNode.click();
        return true;
      }
      return false;
    });
    console.log('Clicked food item:', clicked);
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(outDir, '10_food_quantity_sheet.png') });
    console.log('Captured 10_food_quantity_sheet.png');

    // 2. Capture Dark Mode Home Dashboard
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));
    // Click theme toggle button (button containing Moon SVG or second button in header)
    const toggled = await page.evaluate(() => {
      // Find buttons in header
      const buttons = Array.from(document.querySelectorAll('div[role="button"]'));
      // The theme button is the last button in the header (has an SVG inside)
      if (buttons.length >= 2) {
        buttons[1].click();
        return true;
      }
      return false;
    });
    console.log('Theme toggle clicked:', toggled);
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(outDir, '11_home_dashboard_dark.png') });
    console.log('Captured 11_home_dashboard_dark.png');

    await browser.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    server.close();
  }
});

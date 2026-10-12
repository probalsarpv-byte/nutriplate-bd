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

const PORT = 8095;

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

    // Capture Dark Mode Home Dashboard
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));

    // On top right, the buttons are the lang and theme toggles
    // Let's click at coordinates (x: 360, y: 36) which is right over the moon icon button
    await page.mouse.click(360, 36);
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(outDir, '11_home_dashboard_dark.png') });
    console.log('Captured 11_home_dashboard_dark.png');

    // Also capture dark mode for Food Tracker
    await page.goto(`http://localhost:${PORT}/tracker`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, '12_tracker_dark.png') });
    console.log('Captured 12_tracker_dark.png');

    await browser.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    server.close();
  }
});

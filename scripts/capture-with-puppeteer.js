const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const distDir = path.join(__dirname, '..', 'dist');
const outDir = path.join(__dirname, '..', 'docs', 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

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

const PORT = 8099;

server.listen(PORT, async () => {
  console.log(`Server listening on http://localhost:${PORT}`);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const executablePath = fs.existsSync(chromePath) ? chromePath : edgePath;

  console.log('Using browser executable:', executablePath);

  try {
    const browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    });

    const page = await browser.newPage();
    await page.setViewport({
      width: 393,
      height: 851,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });

    const routes = [
      { name: '01_home_dashboard', path: '/' },
      { name: '02_food_tracker', path: '/tracker' },
      { name: '03_recipe_lab', path: '/recipes' },
      { name: '04_insights', path: '/insights' },
      { name: '05_profile', path: '/profile' },
      { name: '06_food_search', path: '/food/search' },
      { name: '07_family_pot', path: '/family-pot' },
      { name: '08_smart_plate', path: '/smart-plate' },
      { name: '09_recipe_new', path: '/recipe/new' },
    ];

    for (const r of routes) {
      const url = `http://localhost:${PORT}${r.path}`;
      console.log(`Navigating to ${url}...`);
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
      // Short delay for animations/render settlement
      await new Promise(res => setTimeout(res, 1200));

      const screenshotPath = path.join(outDir, `${r.name}.png`);
      await page.screenshot({ path: screenshotPath });
      console.log(`Captured ${r.name} -> ${screenshotPath}`);
    }

    await browser.close();
    console.log('All screens captured successfully!');
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    server.close();
  }
});

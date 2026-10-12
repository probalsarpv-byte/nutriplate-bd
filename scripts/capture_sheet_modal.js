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

server.listen(8103, async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 393, height: 851, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  await page.goto('http://localhost:8103/food/search', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  // Find clickable food card element in DOM and trigger touch/click sequence
  const opened = await page.evaluate(() => {
    // Look for element with role="button" or containing "যব"
    const candidates = Array.from(document.querySelectorAll('*'));
    const target = candidates.find(el => el.textContent && el.textContent.includes('যব, গোটা') && el.getAttribute('role') === 'button') ||
                   candidates.find(el => el.textContent && el.textContent.includes('যব, গোটা') && el.onclick != null) ||
                   candidates.find(el => el.textContent && el.textContent.includes('যব, গোটা') && el.parentElement && el.parentElement.getAttribute('role') === 'button')?.parentElement;
    
    if (target) {
      target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
      target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }));
      target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
      target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return true;
    }
    return false;
  });

  console.log('Opened status:', opened);
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: path.join(__dirname, '..', 'docs', 'screenshots', 'food_quantity_sheet_state_switcher.png') });
  await browser.close();
  server.close();
  console.log('Capture finished.');
});

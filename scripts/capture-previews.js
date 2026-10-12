const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

  // If path has no extension, serve index.html for SPA routing
  if (!path.extname(filePath)) {
    filePath = path.join(distDir, 'index.html');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // SPA fallback
    const indexHtml = path.join(distDir, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(indexHtml).pipe(res);
  }
});

const PORT = 8089;
server.listen(PORT, async () => {
  console.log(`Server listening on http://localhost:${PORT}`);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browserPath = fs.existsSync(chromePath) ? chromePath : edgePath;

  const routes = [
    { name: '01_home_dashboard', url: `http://localhost:${PORT}/` },
    { name: '02_food_tracker', url: `http://localhost:${PORT}/tracker` },
    { name: '03_recipe_lab', url: `http://localhost:${PORT}/recipes` },
    { name: '04_insights', url: `http://localhost:${PORT}/insights` },
    { name: '05_profile', url: `http://localhost:${PORT}/profile` },
    { name: '06_food_search', url: `http://localhost:${PORT}/food/search` },
    { name: '07_family_pot', url: `http://localhost:${PORT}/family-pot` },
    { name: '08_smart_plate', url: `http://localhost:${PORT}/smart-plate` },
  ];

  for (const r of routes) {
    const outFile = path.join(outDir, `${r.name}.png`);
    console.log(`Capturing ${r.name} from ${r.url}...`);
    try {
      const cmd = `"${browserPath}" --headless=new --screenshot="${outFile}" --window-size=393,851 --hide-scrollbars --virtual-time-budget=2000 "${r.url}"`;
      execSync(cmd, { stdio: 'ignore' });
      if (fs.existsSync(outFile)) {
        const stats = fs.statSync(outFile);
        console.log(`  ✓ Saved ${outFile} (${stats.size} bytes)`);
      } else {
        console.log(`  ✗ Failed to create ${outFile}`);
      }
    } catch (err) {
      console.error(`  Error capturing ${r.name}:`, err.message);
    }
  }

  server.close(() => {
    console.log('Capture server finished and closed.');
  });
});

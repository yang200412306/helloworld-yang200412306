/**
 * 本地预览脚本（模拟 Vercel 的运行方式）
 * - 静态文件：public/ 目录
 * - 接口：api/xxx.js -> /api/xxx
 *
 * 用法：npm start 或 node local-dev.js
 * 访问：http://localhost:3000
 *
 * 注意：这个文件只用于本地预览，Vercel 上不会用到（Vercel 自己处理 public/ 和 api/）。
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const API_DIR = path.join(__dirname, 'api');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname);
  } catch {
    res.writeHead(400);
    res.end('400 Bad Request');
    return;
  }

  // 1) /api/* —— 交给 api 目录下的处理函数
  if (pathname.startsWith('/api/')) {
    const name = pathname.slice('/api/'.length).replace(/\.js$/, '');
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      res.writeHead(400);
      res.end('400 Bad Request');
      return;
    }
    const apiFile = path.join(API_DIR, `${name}.js`);
    if (fs.existsSync(apiFile)) {
      require(apiFile)(req, res);
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`404 Not Found：/api/${name}`);
    return;
  }

  // 2) 静态文件
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  const filePath = path.normalize(path.join(PUBLIC_DIR, relativePath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 Not Found：${pathname}`);
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`本地预览已启动：http://localhost:${PORT}`);
  console.log(`接口地址：http://localhost:${PORT}/api/time`);
});

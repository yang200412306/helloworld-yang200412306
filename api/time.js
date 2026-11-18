/**
 * GET /api/time —— 返回服务器当前时间（北京时间 UTC+8）
 *
 * Vercel 会把 api/ 目录下的文件自动变成 Serverless Function，
 * 访问路径与文件名一致：api/time.js -> /api/time
 */

function pad2(value) {
  return String(value).padStart(2, '0');
}

function getServerTime(date = new Date()) {
  const CST_OFFSET_MS = 8 * 60 * 60 * 1000; // UTC+8
  const shifted = new Date(date.getTime() + CST_OFFSET_MS);

  const year = shifted.getUTCFullYear();
  const month = shifted.getUTCMonth() + 1;
  const day = shifted.getUTCDate();
  const hour = shifted.getUTCHours();
  const minute = shifted.getUTCMinutes();
  const second = shifted.getUTCSeconds();

  const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const weekday = WEEKDAYS[shifted.getUTCDay()];

  const dateText = `${year} 年 ${pad2(month)} 月 ${pad2(day)} 日`;
  const timeText = `${pad2(hour)}:${pad2(minute)}:${pad2(second)}`;

  return {
    text: `${dateText} ${weekday} ${timeText}`,
    dateText,
    weekday,
    timeText,
    iso: `${year}-${pad2(month)}-${pad2(day)} ${timeText}`,
    timeZone: 'UTC+8 (Asia/Shanghai)',
    timestamp: date.getTime()
  };
}

module.exports = (req, res) => {
  const now = getServerTime();

  const payload = {
    ok: true,
    ...now,
    environment: process.env.VERCEL ? 'Vercel Serverless' : '本地 Node.js',
    nodeVersion: process.version,
    // x-vercel-id 形如 hkg1::abcde-1234567890，第一段是执行区域
    region: String(req.headers['x-vercel-id'] || 'local').split('::')[0]
  };

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.statusCode = 200;
  res.end(JSON.stringify(payload));
};

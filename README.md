# helloworld-yang200412306

部署在 **Vercel** 上的 HelloWorld 网站：首页显示 **Hello World!**，同时实时显示**当前服务器时间**。

- Vercel 线上地址：`https://helloworld-yang200412306.vercel.app`（部署完成后生效）
- 技术栈：纯静态页面 + Vercel Serverless Function，零第三方依赖

## 一、项目结构（Vercel 原生约定）

```
helloworld-yang200412306/
├── api/
│   └── time.js           # Serverless 函数：/api/time 返回服务器时间（UTC+8）
├── public/
│   ├── index.html        # 静态首页：Hello World! + 时间面板
│   └── style.css         # 页面样式
├── local-dev.js          # 本地预览：模拟 Vercel 的 public/ + api/ 行为
├── package.json
├── .gitignore
└── README.md
```

Vercel 的两条约定：

1. `public/` 下的文件直接按路径提供静态访问（`public/index.html` → `/`）。
2. `api/` 下的每个 `.js` 文件自动变成一个 Serverless Function（`api/time.js` → `/api/time`）。

正因为 Vercel 是「无服务器」平台，**不能**用它跑 `server.js` 里那种 `http.listen(3000)` 的常驻服务；所以本项目把时间逻辑拆成了 `api/time.js`。

## 二、本地运行

```bash
npm start          # 启动 local-dev.js（无需 npm install）
# 打开 http://localhost:3000
```

也可以用 Vercel 官方 CLI，行为和线上完全一致：

```bash
npm i -g vercel
vercel dev
```

## 三、接口说明

`GET /api/time` 返回：

```json
{
  "ok": true,
  "text": "2026 年 11 月 18 日 星期三 21:40:00",
  "dateText": "2026 年 11 月 18 日",
  "weekday": "星期三",
  "timeText": "21:40:00",
  "iso": "2026-11-18 21:40:00",
  "timeZone": "UTC+8 (Asia/Shanghai)",
  "timestamp": 1795011600000,
  "environment": "Vercel Serverless",
  "nodeVersion": "v18.x",
  "region": "hkg1"
}
```

页面每 1 秒请求一次该接口刷新时钟；网络异常时会降级为本地走秒，并把状态标红。

## 四、部署到 Vercel

1. 打开 <https://vercel.com>，用 GitHub 账号登录。
2. **Add New… → Project**。
3. 在仓库列表里找到 `helloworld-yang200412306`，点 **Import**。
4. Framework Preset 选 **Other**，Build Command、Output Directory 都留空（本项目无需构建）。
5. 点 **Deploy**，等约 1 分钟。
6. 出现 🎉 恭喜页面后，点击 **Visit** 或复制 `https://helloworld-yang200412306.vercel.app` 到浏览器打开。

> 本项目**不需要** `vercel.json`：Vercel 的零配置规则会自动把 `public/` 当作静态输出目录、把 `api/*.js` 编译成 Serverless Function。这也是保持 "Framework: Other + 全部默认" 的最稳妥做法。

## 五、常见问题

**Q：Vercel 上访问首页 404？**
确认 `public/index.html` 存在、仓库根目录没有多余的构建配置；重新 Deploy 一次即可。

**Q：时间和北京时间差 8 小时？**
`api/time.js` 里固定按 UTC+8 换算，与函数所在区域无关，正常不会差 8 小时。若确实出现，检查是否改动了 `CST_OFFSET_MS`。

**Q：想改成本地常驻版本（含 HTTPS）？**
见同目录另一份项目 `hello-world-nodejs`，它用 `node:http` / `node:https` 双栈跑在 3000 / 3443。

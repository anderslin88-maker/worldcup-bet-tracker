# 世界盃投注紀錄 Dashboard — Supabase + Vercel 版

這是可部署到 Vercel 的版本。你人在外面用手機打開網址，就可以新增投注，資料會存在 Supabase，不會只存在單一瀏覽器。

## 1. 建 Supabase 專案

1. 到 Supabase 建立新專案
2. 進入 SQL Editor
3. 貼上 `supabase-schema.sql` 的內容並執行

## 2. 取得 Supabase Key

到 Supabase：

Project Settings → API

複製：

- Project URL
- anon public key

## 3. 本機測試，可選

```bash
npm install
cp .env.example .env.local
npm run dev
```

然後把 `.env.local` 改成：

```env
NEXT_PUBLIC_SUPABASE_URL=你的 Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 anon public key
```

## 4. 部署到 Vercel

1. 把這個資料夾上傳到 GitHub
2. 到 Vercel 新增 Project
3. 選這個 GitHub repo
4. 在 Environment Variables 加入：

```env
NEXT_PUBLIC_SUPABASE_URL=你的 Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 anon public key
```

5. Deploy

完成後會得到網址，例如：

```text
https://worldcup-bet-tracker.vercel.app
```

## 注意

這個第一版的 Supabase RLS 是公開可讀寫，方便你直接用手機操作。

如果網址會給很多人知道，建議下一版改成：
- Google Login
- 只有你的帳號能新增 / 修改 / 刪除
- 或加一組簡單密碼

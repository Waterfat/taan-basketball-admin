# taan-basketball-admin — 後台前端製作規格

## 專案概覽

大安ㄍㄤㄍㄤ好籃球聯盟後台管理介面，供管理員輸入賽務數據、管理球員與賽程、查看統計概覽。

---

## 技術選型

| 層級 | 技術 | 理由 |
|------|------|------|
| **框架** | React 19 + TypeScript | 生態成熟、元件化開發 |
| **建構工具** | Vite | 極快 HMR、零配置 |
| **路由** | React Router v7 | 標準選擇 |
| **樣式** | TailwindCSS v4 | 快速原型、一致設計 |
| **狀態管理** | Zustand | 輕量、簡單，適合中小專案 |
| **API 請求** | TanStack Query (React Query) | 快取、自動重試、loading/error 狀態 |
| **表單** | React Hook Form + Zod | 型別安全驗證 |
| **表格** | TanStack Table | 排序、篩選、分頁 |
| **通知** | Sonner | 輕量 toast |
| **圖標** | Lucide React | 一致風格 |

---

## 專案結構

```
taan-basketball-admin/
├── public/
├── src/
│   ├── main.tsx                       # 進入點
│   ├── App.tsx                        # 路由設定
│   ├── lib/
│   │   ├── api-client.ts              # fetch wrapper（附 JWT）
│   │   ├── constants.ts               # API URL、隊伍顏色等常數
│   │   └── utils.ts                   # 工具函式
│   ├── stores/
│   │   └── auth.store.ts              # Zustand auth 狀態
│   ├── hooks/
│   │   ├── useAuth.ts                 # 登入/登出/token refresh
│   │   └── useApi.ts                  # TanStack Query hooks
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx          # 側邊欄 + 頂部列 + 內容區
│   │   │   ├── Sidebar.tsx            # 側邊導覽
│   │   │   └── TopBar.tsx             # 頂部列（使用者資訊、登出）
│   │   ├── ui/                        # 通用 UI 元件
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── DataTable.tsx          # 通用資料表格
│   │   │   ├── Dialog.tsx
│   │   │   ├── FormField.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── Pagination.tsx
│   │   ├── TeamBadge.tsx              # 隊伍色標元件
│   │   ├── PlayerSelect.tsx           # 球員選擇器（含搜尋）
│   │   └── ProtectedRoute.tsx         # 權限路由守衛
│   ├── pages/
│   │   ├── Login.tsx                  # 登入頁
│   │   ├── Dashboard.tsx              # 總覽儀表板
│   │   ├── seasons/
│   │   │   ├── SeasonList.tsx
│   │   │   └── SeasonForm.tsx
│   │   ├── teams/
│   │   │   ├── TeamList.tsx
│   │   │   └── TeamForm.tsx
│   │   ├── players/
│   │   │   ├── PlayerList.tsx         # 球員列表（搜尋、篩選隊伍）
│   │   │   ├── PlayerForm.tsx         # 新增/編輯球員
│   │   │   └── PlayerAssign.tsx       # 分配隊伍
│   │   ├── schedule/
│   │   │   ├── WeekList.tsx           # 週次列表
│   │   │   ├── WeekForm.tsx           # 新增/編輯週次
│   │   │   └── WeekGames.tsx          # 該週比賽管理
│   │   ├── boxscore/
│   │   │   ├── GameSelect.tsx         # 選擇比賽（依週次）
│   │   │   └── ScoreEntry.tsx         # 數據輸入表格（核心頁面）
│   │   ├── attendance/
│   │   │   └── AttendanceGrid.tsx     # 出席勾選矩陣
│   │   ├── rotation/
│   │   │   └── DutyAssign.tsx         # 輪值指派
│   │   ├── dragon/
│   │   │   └── DragonManage.tsx       # 龍虎榜積分管理
│   │   ├── announcements/
│   │   │   ├── AnnouncementList.tsx
│   │   │   └── AnnouncementForm.tsx
│   │   └── users/
│   │       ├── UserList.tsx           # SUPER_ADMIN 專用
│   │       └── UserForm.tsx
│   └── types/
│       └── index.ts                   # API 回傳型別定義
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── SPEC.md                            # 本文件
```

---

## 路由規劃

```typescript
/login                          # 登入頁（未登入唯一可見）
/                               # Dashboard 總覽
/seasons                        # 賽季管理
/seasons/new                    # 新增賽季
/seasons/:id/edit               # 編輯賽季
/teams                          # 隊伍管理
/teams/:id/edit                 # 編輯隊伍
/players                        # 球員管理
/players/new                    # 新增球員
/players/:id/edit               # 編輯球員
/schedule                       # 賽程管理（週次列表）
/schedule/new                   # 新增週次
/schedule/:weekId               # 該週比賽管理
/boxscore                       # 選擇比賽
/boxscore/:gameId               # 數據輸入
/attendance                     # 出席管理
/rotation                       # 輪值管理
/dragon                         # 龍虎榜管理
/announcements                  # 公告管理
/announcements/new              # 新增公告
/announcements/:id/edit         # 編輯公告
/users                          # 使用者管理（SUPER_ADMIN）
/users/new                      # 新增使用者
/users/:id/edit                 # 編輯使用者
```

---

## 頁面規格

### 1. Login（登入頁）

- 簡潔表單：帳號 + 密碼 + 登入按鈕
- 錯誤提示（帳密錯誤、網路失敗）
- 登入成功後 redirect 至 Dashboard
- 已登入狀態自動跳轉

### 2. Dashboard（總覽儀表板）

**卡片區（4 格）：**
- 本季賽季資訊（第 N 屆、進行中的賽制）
- 本週賽程摘要（日期、場地、幾場比賽）
- 全體出席率（本季平均 %）
- 待處理項目計數

**待處理提醒：**
- 尚未輸入數據的已完成比賽
- 尚未標記出席的已過週次
- 尚未指派輪值的upcoming 週次

**最近活動：**
- 最近 10 筆資料變更紀錄

### 3. Boxscore 數據輸入（核心頁面）

**Step 1 — 選擇比賽 `GameSelect.tsx`**

```
┌──────────────────────────────────────┐
│ 選擇週次：[▼ 第 5 週 - 2026/2/7    ]│
│                                      │
│  第 1 場  綠 29 : 23 紅  ✅ 已輸入  │
│  第 2 場  黑 -- : -- 黃  ⚠ 待輸入   │
│  第 3 場  藍 -- : -- 白  ⚠ 待輸入   │
│  ...                                 │
└──────────────────────────────────────┘
```

**Step 2 — 輸入數據 `ScoreEntry.tsx`**

```
┌─────────────────────────────────────────────────────────────────┐
│ 第 5 週 · 第 2 場 · 黑 vs 黃                                   │
│                                                                 │
│ ── 主隊：黑隊 ──────────────────────────────────────────────── │
│ 球員     │2P✕│2P○│3P✕│3P○│FT✕│FT○│PTS│OR│DR│AST│BLK│STL│TO│PF│
│ 林毅豐   │ 3 │ 2 │ 1 │ 0 │ 0 │ 1 │  5│ 1│ 3│  2│  0│  1│ 2│ 1│
│ 喻柏淵   │ 2 │ 4 │ 0 │ 2 │ 1 │ 2 │ 16│ 0│ 5│  1│  1│  0│ 1│ 0│
│ ...      │   │   │   │   │   │   │   │  │  │   │   │   │  │  │
│ 合計     │ 12│ 14│ 4 │ 5 │ 3 │ 7 │ 50│ 4│16│  8│  3│  4│ 7│ 3│
│                                                                 │
│ ── 客隊：黃隊 ──────────────────────────────────────────────── │
│ (同上格式)                                                      │
│                                                                 │
│ [儲存]  [儲存並前往下一場]                                       │
└─────────────────────────────────────────────────────────────────┘
```

**自動計算：**
- PTS = fg2Made×2 + fg3Made×3 + ftMade（即時算、但可手動覆寫）
- 合計列即時加總
- 資料驗證：提醒主客隊比分是否合理

### 4. Attendance 出席管理

**勾選矩陣 `AttendanceGrid.tsx`**

```
┌──────────────────────────────────────────────────────┐
│ 隊伍篩選：[全部] [紅] [黑] [藍] [綠] [黃] [白]      │
│                                                      │
│           │ W1  │ W2  │ W3  │ W4  │ W5  │           │
│           │1/10 │1/17 │1/24 │1/31 │2/7  │           │
│ ─────────┼─────┼─────┼─────┼─────┼─────┤           │
│ 韋承志(紅)│ [1] │ [1] │ [1] │ [0] │ [1] │ 80%      │
│ 何靖懋(紅)│ [1] │ [1] │ [x] │ [1] │ [?] │ 75%      │
│ ...       │     │     │     │     │     │           │
│                                                      │
│ 符號：1=出席  0=請假  x=曠賽  ?=未舉行               │
│ 點擊循環切換：? → 1 → 0 → x → ?                     │
│                                                      │
│ [批次儲存]                                           │
└──────────────────────────────────────────────────────┘
```

### 5. Schedule 賽程管理

**週次列表 `WeekList.tsx`**

```
┌────────────────────────────────────────────────┐
│ [+ 新增週次]                                    │
│                                                │
│ #  │ 日期      │ 賽制   │ 場地 │ 狀態    │ 操作│
│ W1 │ 2026/1/10 │ 熱身賽 │ 大安 │ 已完成  │ 編輯│
│ W2 │ 2026/1/17 │ 熱身賽 │ 三重 │ 已完成  │ 編輯│
│ -- │ 2026/2/14 │ 停賽   │ --   │ 過年    │ 編輯│
│ W5 │ 2026/2/7  │ 例行賽 │ 三重 │ 進行中  │ 編輯│
│ W6 │ 2026/2/21 │ 例行賽 │ 大安 │ 未開始  │ 編輯│
└────────────────────────────────────────────────┘
```

**週次詳情 `WeekGames.tsx`**

- 顯示該週 6 場比賽
- 可調整主客隊、比賽順序
- [自動產生] 按鈕：依對戰組合表自動建立 6 場
- 每場可設定時間、工作人員

### 6. Player 球員管理

**列表功能：**
- 搜尋（姓名）
- 篩選（隊伍、裁判身份）
- 顯示：姓名、隊伍、背號、是否隊長、帳號綁定狀態
- 操作：編輯、分配隊伍、刪除

**表單欄位：**
- 姓名（必填）
- 大頭照（上傳）
- 電話
- 是否裁判
- 背號
- 所屬隊伍（下拉選擇）
- 是否隊長

### 7. Dragon 龍虎榜管理

- 顯示所有球員積分（出席/輪值/拖地/季後賽/總計）
- [重新計算] 按鈕：從 Attendance + DutyRecord 重算
- 可手動調整個別欄位（拖地、季後賽積分為手動）
- 平民/奴隸門檻設定

### 8. Rotation 輪值管理

- 選擇週次
- 依角色（裁判/場務/攝影/器材/數據）拖拉指派球員
- 顯示每人累計輪值次數，方便平均分配
- 自動排除該週缺席球員

### 9. User 使用者管理（SUPER_ADMIN 專用）

- 列表：帳號、顯示名稱、角色、綁定球員、最後登入
- 新增：帳號 + 初始密碼 + 角色 + 可選綁定球員
- 編輯：變更角色、重設密碼
- 刪除

### 10. Announcement 公告管理

- 列表：標題、發布時間、是否置頂
- 新增/編輯：標題 + 內容（Markdown）+ 是否置頂
- 預覽功能

---

## 認證流程（前端）

### 登入

```
1. 使用者填帳號密碼 → POST /api/auth/login
2. 收到 { accessToken, refreshToken, user }
3. accessToken 存 memory（Zustand store）
4. refreshToken 存 localStorage
5. 導向 Dashboard
```

### API 請求

```
1. api-client.ts 自動附 Authorization: Bearer <accessToken>
2. 收到 401 → 自動嘗試 POST /api/auth/refresh
3. refresh 成功 → 用新 token 重試原請求
4. refresh 失敗 → 清除狀態 → 導向 Login
```

### 權限路由守衛

```typescript
// ProtectedRoute.tsx
<ProtectedRoute requiredRole={Role.ADMIN}>
  <BoxscoreEntry />
</ProtectedRoute>

// 檢查 user.role 是否 >= requiredRole
// 權限不足 → 顯示 403 或 redirect
```

---

## 側邊欄導覽結構

```
┌─────────────────────┐
│ 🏀 大安聯盟後台      │
│                     │
│ ■ 總覽              │  ← 所有角色
│                     │
│ 賽務管理            │
│  ├ 賽程             │  ← ADMIN+
│  ├ 數據輸入         │  ← ADMIN+
│  ├ 出席管理         │  ← TEAM_CAPTAIN+
│  └ 輪值排班         │  ← ADMIN+
│                     │
│ 資料管理            │
│  ├ 球員             │  ← ADMIN+
│  ├ 隊伍             │  ← SUPER_ADMIN
│  ├ 賽季             │  ← SUPER_ADMIN
│  └ 龍虎榜           │  ← ADMIN+
│                     │
│ 內容管理            │
│  └ 公告             │  ← ADMIN+
│                     │
│ 系統管理            │  ← SUPER_ADMIN only
│  └ 使用者           │
│                     │
│ ─────────────────── │
│ 👤 管理員名稱       │
│ [登出]              │
└─────────────────────┘
```

依登入者角色動態顯示可見項目。

---

## UI/UX 設計原則

1. **配色** — 沿用主站風格：`--orange: #ff6b35` 為主色，暖色系
2. **隊伍色標** — 所有涉及隊伍的地方都顯示 `TeamBadge`（色點 + 隊名）
3. **表格** — 統一使用 `DataTable` 元件，支援排序、篩選、分頁
4. **表單驗證** — 即時驗證 + 提交前二次確認（刪除操作）
5. **Loading** — 骨架屏（skeleton）而非 spinner
6. **Toast** — 操作成功/失敗的輕量通知
7. **響應式** — 最低支援 768px（管理員可能用平板在場邊操作）
8. **鍵盤操作** — Boxscore 輸入支援 Tab 快速跳欄

---

## 實作順序

| Phase | 內容 | 預估 |
|-------|------|------|
| **A** | 專案初始化 (Vite + React + Tailwind + Router) | 0.5 天 |
| **B** | 共用元件 (Layout / DataTable / FormField / TeamBadge) | 1-2 天 |
| **C** | 認證 (Login / auth store / api-client / ProtectedRoute) | 1-2 天 |
| **D** | Dashboard 總覽頁 | 1 天 |
| **E** | Boxscore 數據輸入（最核心功能） | 2-3 天 |
| **F** | Attendance 出席管理 | 1-2 天 |
| **G** | Schedule 賽程管理 | 1-2 天 |
| **H** | Player 球員管理 | 1 天 |
| **I** | Rotation / Dragon / Announcement | 2-3 天 |
| **J** | User 使用者管理 | 1 天 |
| **K** | 優化（響應式、鍵盤操作、error boundary） | 1-2 天 |

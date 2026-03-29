# ByteZero: Enterprise Digital Carbon Footprint Management

ByteZero is a full-stack platform designed to monitor and reduce the digital carbon footprint of enterprises. It integrates directly into employee workflows via Microsoft Outlook, providing real-time recommendations and a centralized organization dashboard for environmental impact tracking.

## 👥 Team

- Виктория Чакърова
- Erkut Kılınç
- Андреа Белорешка
- Йоана Идакиева
- Гаврил Гаврилов

## 🏗️ Project Architecture

The repository is organized as a monorepo containing three core applications:

- **`/apps/extension`**: A React-based Outlook Add-in (Task Pane) that scans mailboxes and provides actionable carbon-reduction tasks (deleting emails, removing large attachments, clearing cache).
- **`/apps/dashboard`**: A Next.js 15+ organization dashboard featuring a real-time activity feed, department leaderboard, and key performance metrics.
- **`/apps/backend`**: A NestJS API service powered by TypeORM (SQLite) that handles event ingestion, user management, and metric aggregation.

## 🚀 Quick Start

You can start the entire platform (extension, backend, and dashboard) with a three simple commands through the terminal:

From apps/extension
```
$npm run dev 
```
From apps/backend
```
npm run start:dev
```
From apps/dashboard
```
npx next dev --hostname 127.0.0.1
```

### Accessing the Components:
- **Outlook Extension**: [https://localhost:3000](https://localhost:3000)
- **Organization Dashboard**: [http://localhost:3002](http://localhost:3002)
- **Backend API**: [http://localhost:3001/api/metrics/overview](http://localhost:3001/api/metrics/overview)

## 🎨 Brand Identity
ByteZero uses a premium "eco-tech" aesthetic:
- **Palette**: Deep Forest Green (`#0C3303`), Neon Lime (`#E5FF7D`), and Cream (`#FCFFED`).
- **Design**: Dark-themed glassmorphism with neon accents and high-contrast typography.

## 🛠️ Tech Stack
- **Frontend**: Next.js, React, Vite, Tailwind CSS (v4), Lucide React, Framer Motion.
- **Backend**: NestJS, TypeORM, SQLite.
- **Add-in**: Office.js API.

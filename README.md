# Nexus Platform

A comprehensive productivity platform that integrates the best features of **Jira, Miro, Notion, Slack, and Trello** into one seamless application.

## 🚀 Features

### 📊 Project Management (Jira-inspired)
- Issue tracking with custom statuses
- Sprint planning and management  
- Multiple view modes (Kanban, Calendar, Table)
- Priority and type management
- Analytics dashboard

### 📋 Task Boards (Trello-inspired)
- Kanban-style boards with drag-and-drop
- Custom lists and cards
- Card assignments and labels
- Beautiful background images

### 🎨 Whiteboard (Miro-inspired)
- Infinite canvas for visual collaboration
- **Live multiplayer editing with Socket.io**
- Real-time cursor tracking for all collaborators
- Drawing tools (pen, rectangle, ellipse, text, notes)
- Adjustable brush colors and sizes
- Grid background for alignment
- Instant synchronization across users

### 📝 Documentation (Notion-inspired)
- Hierarchical document structure
- Rich block-based editor
- Cover images and icons
- Public sharing

### �� Team Communication (Slack-inspired)
- Channels for team discussions
- Direct messages
- Message threading
- Emoji reactions
- Real-time messaging

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js v5
- **UI:** Shadcn/ui + Radix UI + Tailwind CSS 4
- **State:** TanStack Query + Zustand
- **Real-time:** Socket.io + Liveblocks

## 📦 Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Set up environment variables:
\`\`\`bash
cp .env.example .env
\`\`\`

3. Run the database:
\`\`\`bash
npx prisma dev
\`\`\`

4. Start development server:
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- **[ROUTING_GUIDE.md](./ROUTING_GUIDE.md)** - Complete routing architecture and best practices
- **[ROUTING_IMPROVEMENTS.md](./ROUTING_IMPROVEMENTS.md)** - Summary of recent routing refactoring
- **[WHITEBOARD_COLLABORATION_GUIDE.md](./WHITEBOARD_COLLABORATION_GUIDE.md)** - Live whiteboard collaboration with Socket.io
- **[UPDATES_SUMMARY.md](./UPDATES_SUMMARY.md)** - Latest features: projects display & collaborative whiteboard
- **[CODEBASE_ANALYSIS.md](./CODEBASE_ANALYSIS.md)** - Detailed analysis of the source projects

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.

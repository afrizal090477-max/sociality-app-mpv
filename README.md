# 🚀 Sociality - Social Media MVP

[![Deploy on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel)](https://sociality-app-mpv.vercel.app/)

**Live Demo:** [https://sociality-app-mpv.vercel.app/](https://sociality-app-mpv.vercel.app/)

Sociality is a modern, full-stack frontend social media web application built as a final MVP project (Batch New York). It features a highly responsive UI, robust state management, and real-time feel interactions using Optimistic UI updates.

## ✨ Features

- **🔐 Authentication:** Secure Login and Registration with form validation.
- **👤 User Profile:** View and edit profiles, track followers/following, and manage avatars.
- **📝 Post Management:** Create posts with image uploads and captions, and delete own posts.
- **📰 Personalized Feed:** Infinite scrolling timeline featuring posts from followed users.
- **❤️ Interactive Engagements:** Like, Comment, Save, and Follow users instantly.
- **⚡ Optimistic UI:** Zero-delay interactions with automatic background reconciliation and rollback on errors.

## 🛠️ Tech Stack

This project is built with industry-standard technologies to ensure high performance, maintainability, and type safety:

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Server State & Caching:** [TanStack Query (React Query)](https://tanstack.com/query/v5)
- **Client/Global State:** [Redux Toolkit](https://redux-toolkit.js.org/)
- **Form Validation:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Date Formatting:** [Day.js](https://day.js.org/)
- **HTTP Client:** [Axios](https://axios-http.com/)

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   
   git clone [https://github.com/afrizal090477-max/sociality-app-mpv.git](https://github.com/afrizal090477-max/sociality-app-mpv.git)
   cd sociality-app-mpv

2. npm install
   # or
   yarn install

3. Create a .env.local file in the root directory and add your API endpoint URL:
   Code snippet
   NEXT_PUBLIC_API_URL=[https://be-social-media-api-production.up.railway.app/api](https://be-social-media-api-production.up.railway.app/api)

4. npm run dev
   # or
   yarn dev

5. Open your browser:
   Navigate to http://localhost:3000 to view the application.

Architecture Highlights
Separation of Concerns: Clearly separated Client State (Redux for Auth/User data) and Server State (React Query for feeds and interactions) to minimize unnecessary API calls.

Optimistic Updates: Leveraged React Query's onMutate to provide a seamless, instantaneous user experience for liking, saving, and following.

Strict Type Safety: Comprehensive TypeScript interfaces and Zod schemas to catch errors during development.

Built with passion for the Final MVP Assignment - Batch New York.
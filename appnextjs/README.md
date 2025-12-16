# Flexcoz

Flexcoz is a web application for checking contracts and managing orders with an intuitive, spreadsheet-like interface.

## Features

- **Contract Management**: Create, edit, and manage contracts with detailed sheets.
- **Order Management**: Track orders and manage line items.
- **Project & Vendor Management**: Organize projects and vendor relationships.
- **Master Data**: Manage Reference Types and Units of Measure.
- **PWA Support**: Installable as an app with auto-update capabilities.
- **Dark Mode**: Fully supports light and dark themes.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand, React Query
- **UI Components**: Custom components with Material Icons
- **Spreadsheet**: jspreadsheet-ce

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

3. **Build for Production**:
   ```bash
   npm run build
   npm run start
   ```

## Testing

- **Unit Tests**:
  ```bash
  npm test
  ```
- **E2E Tests**:
  ```bash
  npx playwright test
  ```

## Service Worker

This app uses `next-pwa` for offline capabilities and auto-updates. The service worker is enabled in production builds (`npm run build`).

## Directory Structure

- `src/app`: App Router pages and layouts.
- `src/components`: Reusable UI components.
- `src/hooks`: Custom React hooks (React Query).
- `src/services`: API service layers.
- `src/store`: Zustand stores.
- `public`: Static assets.

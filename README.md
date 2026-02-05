This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## PWA Cache Notes (Dev)

This project registers a service worker (`public/sw.js`) with versioned caches.

- When changing visual assets or caching logic, bump `SW_VERSION` in `public/sw.js`.
- If your browser keeps showing stale UI during local development:
  1. Open DevTools `Application` tab.
  2. Go to `Service Workers` and unregister current worker.
  3. Go to `Storage` and clear site data.
  4. Reload the app.

## Invoice Parser Provider

The invoice parser can switch providers via environment variables:

- `INVOICE_PARSER_PROVIDER`: `mock` (default) or `openai`
- `INVOICE_PARSER_MODEL`: model name for OpenAI (default: `gpt-4.1-mini`)
- `OPENAI_API_KEY`: required when provider is `openai`

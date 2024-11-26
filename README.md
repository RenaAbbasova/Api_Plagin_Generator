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


****************************

To set up and run the server for this project, follow these steps:

1. First, make sure you have Node.js installed on your computer. You can download it from [https://nodejs.org/](https://nodejs.org/)
2. Create a new folder for your project and navigate to it in your terminal:

mkdir plugin-generator
cd plugin-generator

npx create-next-app@latest .

When prompted, choose the following options:

- Would you like to use TypeScript? Yes
- Would you like to use ESLint? Yes
- Would you like to use Tailwind CSS? No
- Would you like to use `src/` directory? No
- Would you like to use App Router? Yes
- Would you like to customize the default import alias? No

Update the `package.json` file with the dependencies we specified earlier.
Install the required dependencies:

npm install archiver
npm install --save-dev @types/archiver

To serve the static HTML file, we need to make a small change to the Next.js configuration. Create a new file called `next.config.js` in the root of your project with the following conttent:
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/page.html',
      },
    ];
  },
}

module.exports = nextConfig

This configuration will serve the `page.html` file when accessing the root URL.


npm run dev
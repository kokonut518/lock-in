# LockIn

LockIn is an app to optimise time spent during group study sessions by measuring the decibels of the surrounding environment, then triggering an alarm if the chosen sound threshold is exceeded for 5 seconds. A points system is incorporated: every second spent focusing earns a point, while every incident of triggering the alarm is a ten-point deduction. Points may be used as a reference of how productive a session was or how suitable an environment may be for locking in.

**Link:** https://wit-hackathon-lock-in.vercel.app/

## Using LockIn

Ensure your system is on light mode to see all features. Pick your desired decibel level respective to the initial volume level measured by the app. Speaking level is approximately +25db above initial value and can be adjusted to preference.

## How It's Made
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

**Tech used:** JavaScript, TypeScript, CSS, Next.js, React

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

Open [http://localhost:3000](http://localhost:3000) with your browser and enable microphone input to see the result.
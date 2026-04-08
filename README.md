# CardPilot

CardPilot is a personal credit card tracker built with Expo and React Native.

I built this for myself because I wanted a simpler way to save money, use the correct credit card for each purchase, and get the most points possible without overthinking every swipe. I kept running into the same problem: I had good cards, but I was still forgetting which one was best for dining, grocery, travel, or credits that were about to expire. CardPilot is my lightweight answer to that.

## Why I Built It

Credit cards can be valuable, but they are also easy to misuse.

The goal of this app is to help me:

- see all my cards in one place
- know which card to use for the right category
- track annual fees and benefits
- avoid wasting monthly or yearly credits
- get more value and more points from cards I already have

This is meant to be practical, fast, and personal-use first.

## What It Does

The current version includes:

- a `Home` dashboard with wallet summaries
- a `Cards` tab showing all saved cards
- a `Best` tab with simple category-based recommendations
- a `Benefits` tab for tracking unused credits
- a local `Add Card` flow with bank filters and search
- card detail screens with benefit tracking
- delete flow for removing cards from the wallet
- local-only persistence using AsyncStorage

## Current Product Behavior

- first launch starts with an empty wallet
- cards you add are saved locally on that device/browser
- closing and reopening the app keeps your saved data
- clearing browser storage or using a different device starts fresh again

This app does not use bank syncing or cloud storage right now.

## Tech Stack

- Expo
- React Native
- TypeScript
- AsyncStorage
- React Native Web

## Running Locally

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm start
```

Useful commands:

```bash
npm run ios
npm run android
npm run web
```

## Web Build

To generate a production web build:

```bash
npm run build:web
```

This app can be deployed to Vercel as a web app.

## Project Goals

Near-term goals:

- make choosing the best card feel instant
- make benefits and credits harder to forget
- make annual fee decisions easier
- keep the UI clean, fast, and mobile-friendly

Future ideas:

- notifications for expiring benefits
- smarter fee-value analysis
- richer card image coverage
- lightweight AI help for “which card should I use?”

## Notes

- card metadata is currently local, not API-driven
- some card templates have local art, and some still use styled placeholders
- this project is optimized for personal workflow over enterprise complexity

## Author

Made by Bowen with a heart.

![banner](https://i.imgur.com/mjhd6j9.png)

<br />
<div align="center">
  <h2 align="center">Tetra</h2>

  <p align="center">
    Emote management Discord bot.
    <br />
    <a href="https://tetra.lol/invite">Bot Invite Link</a>
    ·
    <a href="https://github.com/ike-gg/Tetra/issues">Report Bug</a>
    ·
    <a href="https://github.com/ike-gg/Tetra/issues">Request Feature</a>
  </p>
</div>

## About The Project

Tetra is a Discord bot project that greatly simplifies importing emotes from various services such as 7TV, BTTV, FFZ or direct links to sources onto your Discord server.

The built-in automatic file optimization feature requires no additional action from users, and the optional scaling function allows you to adjust the emote to look its best.

Additionally Tetra offers a few other smaller but equally exciting features, such as adding unavailable emotes directly from messages or reactions.

---

## Built with

![discordjs](https://img.shields.io/badge/discord.js-000000?style=for-the-badge&logo=discord&logoColor=FFFFFF)
![express](https://img.shields.io/badge/express.js-000000?style=for-the-badge&logo=express&logoColor=FFFFFF)
![nodejs](https://img.shields.io/badge/nodejs-000000?style=for-the-badge&logo=nodedotjs&logoColor=FFFFFF)
![typescript](https://img.shields.io/badge/typescript-000000?style=for-the-badge&logo=typescript&logoColor=FFFFFF)
![sharpjs](https://img.shields.io/badge/sharp-000000?style=for-the-badge&logo=sharp&logoColor=FFFFFF)
![zod](https://img.shields.io/badge/zod-000000?style=for-the-badge&logo=sharp&logoColor=FFFFFF)

---

## Getting Started

1. Clone repo

```
git clone https://github.com/ike-gg/Tetra
```

2. Install dependencies

```
npm install
```

3. Create .env file and fill it with your credentials

4. Deploy global commands and push prisma schema

```
npm run deploy && npm run prisma:push
```

5. Run bot

```
npm run start
```

---

## Roadmap

- [x] Import emotes from 7TV, FFZ, BTTV
  - [x] by name
  - [x] by link (even with direct link to source)
  - [x] by channel emote set (limited to 7TV)
- [x] Automatically emote optimization
- [x] Optional emote scaling option
- [x] Context Commands for "stealing" emotes from messages and reactions
- [x] Media command to extract media files from various socialmedia platform posts (Twitter, Instagram, Tiktok)
- [ ] Fully integrated ~~[Tetra Web](https://github.com/ike-gg/Tetra-web)~~ [Tetra Panel](https://github.com/ike-gg/Tetra-panel)
  - [x] Emote search engine using 7TV, BTTV and FZZ apis
  - [x] Server scope emote managmenet from panel level
  - [x] Manual adjustment
  - [ ] Mass import / emote queue (dealing with discord api limits)
  - [ ] Sync Twitch channel with you discord server
- [ ] Tetra Premium 🤭
- [ ] ~~Users without permission can make request to add emote~~ (?)

---

## Contributing

To contribute, simply fork this project and create a pull request with your changes. Whether it's a new feature, bug fix, or documentation improvement, we appreciate all contributions. Thank you for your interest in helping to make this project even better!

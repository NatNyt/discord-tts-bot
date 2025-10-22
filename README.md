# 🎙️ Discord TTS Bot

A simple Discord bot that joins a voice channel and speaks messages using text-to-speech (TTS).  
Built with **discord.js**, **TypeScript**, and a lightweight SQLite/Drizzle database.

---

## 🚀 Features

- Slash commands for joining/leaving voice channels  
- Speak messages with Text-to-Speech (TTS)  
- Persistent language & nickname settings per user (stored in SQLite)  
- Easy configuration via `.env`  
- Fully typed with TypeScript  

---

---

### 1️⃣ How to install
```bash
git clone https://github.com/Natnyt/discord-tts-bot.git
cd discord-tts-bot
npm install
```
### 2️⃣ Configure 

Rename .env.exmaple to .env and edit that
```
DISCORD_TOKEN=your_discord_bot_token
DISCORD_GUILD_ID=your_server_id
DB_FILE_NAME=file:local.db
```

‼️ You need insert key from gcp account service json file on google and rename into `exmaple.json` remove `auth.exmaple.json` too

### 3️⃣ Build & Run
```
npm run build
npm start
```

### 🗣️ Usage
Use the /join command to connect to your current voice channel.
Use /set lang <language> to change your voice/language.
Use /set nickname <nickname> to change your nickname
Use /set xsaid <boolean> to set xsaid 
Use /set model to model your model


### PS Thank you Chat GPT For Help me Writing this Readme
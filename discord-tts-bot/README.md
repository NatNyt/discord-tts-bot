# Discord TTS Bot

This project is a Discord bot that utilizes Google Cloud's Text-to-Speech API to convert text messages into speech. The bot listens for specific commands in a Discord server and responds by generating audio from the provided text.

## Features

- Text-to-Speech functionality using Google Cloud API
- Easy integration with Discord
- Configurable settings for API keys and other constants
- Database support for storing user preferences and command history

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/discord-tts-bot.git
   ```

2. Navigate to the project directory:
   ```
   cd discord-tts-bot
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Set up your environment variables:
   - Rename `.env.example` to `.env` and fill in the required values, including your Discord bot token and database file name.
   - Set up your Google Cloud authentication by filling in the `google/auth.json` file with your credentials.

## Usage

To start the bot, run the following command:
```
npm start
```

The bot will connect to your specified Discord server and begin listening for commands.

## Commands

- `/tts <text>`: Converts the provided text into speech and plays it in the voice channel.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
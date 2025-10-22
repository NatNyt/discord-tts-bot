import { Client, GatewayIntentBits } from 'discord.js';
import { config } from './config/config';
import { handleTextToSpeechCommand } from './commands/tts';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user?.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.content.startsWith('!tts')) {
        await handleTextToSpeechCommand(message);
    }
});

client.login(config.DISCORD_TOKEN);
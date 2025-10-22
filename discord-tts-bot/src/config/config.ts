export const config = {
    DISCORD_TOKEN: process.env.DISCORD_TOKEN || '',
    DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID || '',
    DB_FILE_NAME: process.env.DB_FILE_NAME || 'file:local.db',
    GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
    GOOGLE_CLOUD_PRIVATE_KEY: process.env.GOOGLE_CLOUD_PRIVATE_KEY || '',
    GOOGLE_CLOUD_CLIENT_EMAIL: process.env.GOOGLE_CLOUD_CLIENT_EMAIL || '',
};
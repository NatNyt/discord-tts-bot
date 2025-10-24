import {ActionRowBuilder, Client, Collection, IntentsBitField, InteractionContextType, InteractionResponse, MessageFlags, Routes, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, VoiceConnectionStates} from 'discord.js';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import dotenv from 'dotenv'
import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel, VoiceConnection } from '@discordjs/voice';
import language from './tts/language.js';
import db from './db/index.js';
import { usersTable } from './db/schema.js';
import { eq } from 'drizzle-orm';
import { Readable } from 'stream';

dotenv.config()

process.env.GOOGLE_APPLICATION_CREDENTIALS = "./google/auth.json"

const ttsClient = new TextToSpeechClient()

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.GuildMembers
    ]
});

const oldInteraction = new Collection<string, InteractionResponse>()


async function getUser(id: string) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.discordId, id))
    if(user) return user;
    const [newUser] = await db.insert(usersTable).values({
        discordId: id,
    }).returning()
    return newUser
}

client.on("clientReady", async (client) => {
    const lang = new Map<string, string>()
    language.forEach(e => lang.set(e.language, e.code))
    const commands = [
        new SlashCommandBuilder().setName("join").setContexts(InteractionContextType.Guild).setDescription("Join the voice channel"),
        new SlashCommandBuilder()
            .setName('set')
            .setDescription('Settings TTS Bot')
            .setContexts(InteractionContextType.Guild)
            .addSubcommand(subcommand =>
                subcommand
                    .setName('language')
                    .setDescription('Set TTS language')
                    .addStringOption(option =>
                        option
                            .setName('language')
                            .setDescription('Select language')
                            .setRequired(true)
                            .addChoices(
                                lang.keys().toArray().map(e => ({
                                    name: e,
                                    value: lang.get(e) as string
                                }))
                            )
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('xsaid')
                    .setDescription('Enable or disable "<nickname> said" before message')
                    .addBooleanOption(option =>
                        option
                            .setName('value')
                            .setDescription('True to enable, false to disable')
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('nickname')
                    .setDescription('Set your nickname')
                    .addStringOption(option =>
                        option
                            .setName('nickname')
                            .setDescription('Your nickname')
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcommand => subcommand.setName("model").setDescription("Set model tts language"))
    ]
    console.log(`Login as ${client.user.username} !`)
    await client.rest.put(Routes.applicationGuildCommands(client.user.id, process.env.DISCORD_GUILD_ID!), {
        body: commands.map(e => e.toJSON())
    }).catch(console.error)
    console.log("Refreshing commands done !")
})

interface ConnectionState {
    connection: VoiceConnection,
    player: AudioPlayer
    queue: AudioResource<null>[];
    isPlaying: boolean
}

const connections = new Collection<string, ConnectionState>()
const queue = new Map<string, AudioResource<null>>()

function playNext(guildId: string) {
  const g = connections.get(guildId);
  if (!g || g.queue.length === 0) return;

  const next = g.queue[0];

  g.player.play(next);
  g.connection.subscribe(g.player);
  g.isPlaying = true;
}

function enqueue(guildId: string, audioContent: AudioResource<null>) {
  const guildQueue = connections.get(guildId);
  if(!guildQueue) return;
  guildQueue.queue.push(audioContent);
  if (!guildQueue.isPlaying) playNext(guildId);
}


client.on("interactionCreate", async (interaction) => {
    if(interaction.isStringSelectMenu() && interaction.inCachedGuild() && interaction.customId == "select_model") {
        const value = interaction.values[0];
        const user = await getUser(interaction.user.id);
        await db.update(usersTable).set({
            model: value
        }).where(eq(usersTable.id, user.id))
        const Interaction = oldInteraction.get(interaction.user.id)
        if(Interaction) Interaction.delete();
        return interaction.reply({
            content: "Your current model is " + value,
            flags: [MessageFlags.Ephemeral]
        })
    }
    if(!interaction.isChatInputCommand()) return;
    if(!interaction.inCachedGuild()) return;
    if(interaction.commandName == "join"){
        if(!interaction.member.voice.channel) return interaction.reply({
            content: "Please join vc first !",
            flags: [MessageFlags.Ephemeral]
        })
        const player = createAudioPlayer({
        });
        const connection = joinVoiceChannel({
            channelId: interaction.channelId,
            guildId: interaction.guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator
        })
        connections.set(interaction.guildId, {
            connection,
            player,
            queue: [],
            isPlaying: false
        })
        player.on("stateChange", (oldStatem, newState) => {
            if(newState.status == AudioPlayerStatus.Idle){
                const g = connections.get(interaction.guildId);
                if (!g) return;
                g.queue.shift();
                if (g.queue.length > 0) playNext(interaction.guildId);
                else g.isPlaying = false;
            }
        })
        interaction.reply({
            content: "I joined your voice channels",
        })
    }else if(interaction.commandName == "set"){
        const subcommand = interaction.options.getSubcommand()
        if(!subcommand) return
        if(subcommand == "language"){
            const user = await getUser(interaction.user.id);
            const value = interaction.options.getString("language", true)
            const lang = language.find(e => e.code == value)
            if(!lang) return interaction.reply({
                content: "Incorrect language",
                flags: "Ephemeral",
            })
            await db.update(usersTable).set({
                language: value
            }).where(eq(usersTable.id, user.id))
            return interaction.reply({
                content: "Changed your voice to " + lang.language
            })
        }else if(subcommand == "xsaid"){
            const user = await getUser(interaction.user.id);
            const value = interaction.options.getBoolean("value", true)
            await db.update(usersTable).set({
                readUserName: value ? 0 : 1
            }).where(eq(usersTable.id, user.id))
            return interaction.reply({
                content: "Xsaid is " + value ? "enabled" : "disabled"
            })
        }else if(subcommand == "nickname"){
            const user = await getUser(interaction.user.id);
            const value = interaction.options.getString("nickname", true)
            await db.update(usersTable).set({
                nickname: value
            }).where(eq(usersTable.id, user.id))
            return interaction.reply({
                content: "Your nickname is " + value
            })
        }else if(subcommand == "model"){
            const user = await getUser(interaction.user.id);
            const models = language.filter(e => e.code == (user.language || "th-TH"))
            const model = (models.length <= 0 ? language.filter(e => e.code == (user.language || "th-TH")) : models).slice(0, 24)
            const select = new StringSelectMenuBuilder()
			.setCustomId('select_model')
			.setPlaceholder('[Select your model]')
			.addOptions(
				model.map((e,i) => new StringSelectMenuOptionBuilder().setDefault(i == 0).setDescription(`Model : ${e.model} - Gender : ${e.gender}`).setEmoji(e.gender == "MALE" ? "🧒" : "👧").setValue(e.model).setLabel(e.model))
			);
            const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
            const msg =  await interaction.reply({
			    components: [row],
                flags: [MessageFlags.Ephemeral]
		    });
            oldInteraction.set(interaction.user.id, msg);
        }
    }
})

client.on("messageCreate", async (message) => {
    if(message.author.bot) return;
    if(message.webhookId) return;
    if(!message.inGuild()) return;
    if(!message.member || !message.member.voice.channel) return;
    try {
        const connection = connections.get(message.guildId)
        if(!connection || !(connection.connection.joinConfig.channelId === message.member.voice.channel.id)) return;
        const user = await getUser(message.author.id);
        let msgTts = ""
        const displayeName = message.member.displayName || message.member.user.displayName
        if(user.readUserName == 0) msgTts = msgTts + `${user.nickname ? user.nickname.length > 0 ? user.nickname : displayeName : displayeName} said `
        msgTts = msgTts + message.content
        const lang = user.language ||  "th-TH"
        let model = language.find(e => e.code == (user.language || "th-TH") && e?.model == user.model)
        if(!model)  language.find(e => e.code == "th-TH")
        const [result] = await ttsClient.synthesizeSpeech({
            input: {
                text: msgTts
            },
            voice: {
                languageCode: lang,
                name: model?.model,
                ssmlGender: model?.gender as "FEMALE" | "MALE"
            },
            audioConfig: {audioEncoding: 'MP3'},
        })
        if(!result.audioContent) return;
        if(!connection) return;
        
        const readable = Readable.from(result.audioContent);
        let resource = createAudioResource(readable)
        enqueue(message.guildId, resource)
    } catch (error) {
        console.error(error)
    }
})


client.login(process.env.DISCORD_TOKEN)

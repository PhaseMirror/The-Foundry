import 'dotenv/config';
import { Client, Collection, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import * as dissonance from './commands/dissonance.js';
import * as l0check from './commands/l0-check.js';
import * as adrStatus from './commands/adr-status.js';
import * as consentCheck from './commands/consent-check.js';
import * as mission from './commands/mission.js';
import * as agencyStatus from './commands/agency-status.js';

const DISCORD_TOKEN = process.env.DISCORD_TOKEN ?? '';
const CLIENT_ID = process.env.DISCORD_CLIENT_ID ?? '';
const ALLOWED_GUILDS = (process.env.DISCORD_ALLOWED_GUILDS ?? '').split(',').filter(Boolean);

type Command = { data: { name: string; toJSON(): unknown }; execute(i: ChatInputCommandInteraction): Promise<void> };

const commands: Command[] = [dissonance, l0check, adrStatus, consentCheck, mission, agencyStatus];
const commandMap = new Collection<string, Command>(commands.map((c) => [c.data.name, c]));

async function registerCommands(): Promise<void> {
  const rest = new REST().setToken(DISCORD_TOKEN);
  for (const guildId of ALLOWED_GUILDS) {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, guildId), {
      body: commands.map((c) => c.data.toJSON()),
    });
    console.log(`[bot] Registered commands in guild ${guildId}`);
  }
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async (c) => {
  console.log(`[bot] Logged in as ${c.user.tag}`);
  await registerCommands();
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // Guild allowlist check
  if (ALLOWED_GUILDS.length > 0 && !ALLOWED_GUILDS.includes(interaction.guildId ?? '')) {
    await interaction.reply({ content: '⛔ Not an allowed guild.', ephemeral: true });
    return;
  }

  const command = commandMap.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`[bot] Error in /${interaction.commandName}:`, err);
    const msg = { content: '❌ Command failed. Check server logs.', ephemeral: true };
    if (interaction.deferred) await interaction.editReply(msg);
    else await interaction.reply(msg);
  }
});

client.login(DISCORD_TOKEN);

// LawfulRecursionVersion:1.0

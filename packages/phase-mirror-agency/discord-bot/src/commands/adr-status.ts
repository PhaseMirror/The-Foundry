import { SlashCommandBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { callTool } from '../mcp-client.js';
import { hasAccess, deny, formatResult } from '../util.js';

export const data = new SlashCommandBuilder()
  .setName('adr-status')
  .setDescription('List ADR gate statuses via the MCP server');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!hasAccess(interaction)) return deny(interaction);
  await interaction.deferReply({ ephemeral: true });
  const result = await callTool('adr_status');
  await interaction.editReply({ content: formatResult(result) });
}

// LawfulRecursionVersion:1.0

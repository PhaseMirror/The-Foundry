import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { AgencyClient } from '../agency-client.js';

export const data = new SlashCommandBuilder()
  .setName('agency-status')
  .setDescription('Check the live status of the Phase Mirror Agency and Sedona Spine');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  const health = await AgencyClient.checkHealth();
  const isOnline = health.includes('ONLINE');

  const embed = new EmbedBuilder()
    .setTitle('Phase Mirror Agency Status')
    .setColor(isOnline ? 0x00ff00 : 0xff0000)
    .addFields(
      { name: 'Agency Server', value: isOnline ? '🟢 ONLINE' : '🔴 OFFLINE', inline: true },
      { name: 'Sedona Spine', value: isOnline ? '🟢 ACTIVE' : '⚪ UNKNOWN', inline: true },
      { name: 'Mission Bus', value: '🟢 READY', inline: true },
      { name: 'System Context', value: `\`\`\`${health}\`\`\`` }
    )
    .setFooter({ text: 'Lawful Recursion v1.0' })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

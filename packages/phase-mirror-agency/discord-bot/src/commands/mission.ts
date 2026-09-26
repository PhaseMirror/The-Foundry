import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { AgencyClient } from '../agency-client.js';

export const data = new SlashCommandBuilder()
  .setName('mission')
  .setDescription('Dispatch a mission to the Phase Mirror Agency')
  .addStringOption(option =>
    option.setName('input')
      .setDescription('The mission objective or inquiry')
      .setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const mission = interaction.options.getString('input', true);
  
  await interaction.deferReply({ ephemeral: false });

  try {
    const result = await AgencyClient.dispatchMission(mission);

    const embed = new EmbedBuilder()
      .setTitle(`Mission Complete: ${result.id}`)
      .setDescription(result.completion.length > 2048 ? result.completion.substring(0, 2045) + '...' : result.completion)
      .setColor(result.governance_status === 'VERIFIED' ? 0x00ff00 : 0xff9900)
      .addFields(
        { name: 'Governance Status', value: `\`${result.governance_status}\``, inline: true },
        { name: 'Witness Hash', value: `\`${result.witness_hash.substring(0, 16)}...\``, inline: true }
      )
      .setFooter({ text: 'Phase Mirror Agency • Triple-Lock Validation' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    await interaction.editReply({ content: `❌ Mission failed: ${error.message}` });
  }
}

import type { ChatInputCommandInteraction, GuildMember } from 'discord.js';

const ROLE_MAP = (process.env.DISCORD_ROLE_MAP ?? '').split(',').filter(Boolean);

export function hasAccess(interaction: ChatInputCommandInteraction): boolean {
  const member = interaction.member as GuildMember | null;
  if (!member) return false;
  if (ROLE_MAP.length === 0) return true; // open if no roles configured
  return ROLE_MAP.some((r) => member.roles.cache.has(r));
}

export async function deny(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.reply({ content: '⛔ Insufficient PM tier.', ephemeral: true });
}

export function formatResult(data: unknown): string {
  const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  return text.length > 1900 ? text.slice(0, 1900) + '\n…(truncated)' : text;
}

// LawfulRecursionVersion:1.0

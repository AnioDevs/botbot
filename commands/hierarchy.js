import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load config.json
const configPath = path.join(__dirname, '../config.json');
const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
const hierarchy_roles = config.hierarchy_roles;

export const data = new SlashCommandBuilder()
  .setName('hierarchy')
  .setDescription('Shows the hierarchy of staff members in the Knights Hospitaller server.');

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    // Create embed
    const embed = new EmbedBuilder()
      .setTitle('Knights Hospitaller Hierarchy')
      .setColor(0x00FF00) // Green, consistent with other commands
      .setFooter({ text: 'Serving the Order' })
      .setTimestamp();

    // Guild members cache
    const guild = interaction.guild;
    await guild.members.fetch(); // Ensure all members are cached

    // Function to get users with specific roles
    const getUsersWithRoles = (roleIds) => {
      const users = new Set();
      roleIds.forEach(roleId => {
        const role = guild.roles.cache.get(roleId);
        if (role) {
          role.members.forEach(member => {
            users.add(`<@${member.user.id}>`);
          });
        }
      });
      return users.size > 0 ? Array.from(users).join(', ') : 'No members found.';
    };

    // Add fields for each category
    embed.addFields([
      {
        name: 'Convent',
        value: getUsersWithRoles(hierarchy_roles.convent),
        inline: false
      },
      {
        name: 'High Command',
        value: getUsersWithRoles(hierarchy_roles.high_command),
        inline: false
      },
      {
        name: 'Regiment Leaders',
        value: getUsersWithRoles(hierarchy_roles.regiment_leaders),
        inline: false
      },
      {
        name: 'Officers',
        value: getUsersWithRoles(hierarchy_roles.officers),
        inline: false
      },
      {
        name: 'NCOs',
        value: getUsersWithRoles(hierarchy_roles.ncos),
        inline: false
      },
      {
        name: 'Diplomats',
        value: getUsersWithRoles(hierarchy_roles.diplomats),
        inline: false
      }
    ]);

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error(`Error processing /hierarchy for ${interaction.user.tag}:`, error.message);
    await interaction.editReply({
      content: 'There was an error retrieving the hierarchy. Please try again later.',
      ephemeral: true
    });
  }
}
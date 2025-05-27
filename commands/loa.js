import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { setTimeout } from 'timers/promises';

const requiredRoles = [
  '1376710333158391868',
  '1373958874591395870',
  '1373958845855957033',
  '1373958798208925748',
  '1376710178384117862',
  '1376709973727379556'
];

export const data = new SlashCommandBuilder()
  .setName('loa')
  .setDescription('Gives Leave of Absence (LoA) to a target user for a specified time.')
  .addUserOption(option =>
    option
      .setName('username')
      .setDescription('The user to give LoA to')
      .setRequired(true)
  )
  .addIntegerOption(option =>
    option
      .setName('time')
      .setDescription('Duration of LoA in hours')
      .setRequired(true)
      .setMinValue(1)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames);

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const targetUser = interaction.options.getUser('username');
  const durationHours = interaction.options.getInteger('time');
  const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
  const executor = interaction.member;

  // Check if the executor has one of the required roles
  const hasRequiredRole = requiredRoles.some(roleId => executor.roles.cache.has(roleId));
  if (!hasRequiredRole) {
    return interaction.editReply({
      content: 'You do not have permission to use this command.',
      ephemeral: true
    });
  }

  // Prevent users from giving LoA to themselves
  if (targetUser.id === executor.id) {
    return interaction.editReply({
      content: 'You cannot give LoA to yourself!',
      ephemeral: true
    });
  }

  // Check if the target user is valid
  if (!member) {
    return interaction.editReply({
      content: 'The specified user was not found in this server.',
      ephemeral: true
    });
  }

  // Validate durationHours
  if (typeof durationHours !== 'number' || isNaN(durationHours)) {
    console.error('Invalid durationHours:', durationHours);
    return interaction.editReply({
      content: 'Invalid time value provided. Please specify a valid number of hours.',
      ephemeral: true
    });
  }

  // Calculate duration in milliseconds
  const durationMs = durationHours * 60 * 60 * 1000; // Convert hours to milliseconds
  console.log(`Setting LoA for ${targetUser.tag} for ${durationHours} hours (${durationMs} ms)`);

  // Add [LOA] to the user's nickname
  const originalNickname = member.nickname || member.user.username;
  const newNickname = `[LOA] ${originalNickname}`.slice(0, 32); // Discord nickname limit is 32 characters
  try {
    await member.setNickname(newNickname);
  } catch (error) {
    console.error(`Error setting nickname for ${targetUser.tag}:`, error.message);
    return interaction.editReply({
      content: 'Failed to set LoA nickname. Check bot permissions.',
      ephemeral: true
    });
  }

  // Reply to confirm LoA
  await interaction.editReply({
    content: `${targetUser.tag} has been set to LoA for ${durationHours} hour(s).`,
    ephemeral: true
  });

  // Schedule removal of LoA after the specified duration
  try {
    await setTimeout(durationMs);
    await member.setNickname(originalNickname);
    console.log(`LoA removed for ${targetUser.tag}`);
  } catch (error) {
    console.error(`Error removing LoA for ${targetUser.tag}:`, error.message);
  }
}

export async function setup(client) {
  client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const mentionedUsers = message.mentions.users;
    if (!mentionedUsers.size) return;

    for (const [userId, user] of mentionedUsers) {
      const member = await message.guild.members.fetch(userId).catch(() => null);
      if (!member) continue;

      const nickname = member.nickname || member.user.username;
      if (nickname.startsWith('[LOA]')) {
        await message.reply({
          content: `${user.tag} is currently on Leave of Absence (LoA).`,
          allowedMentions: { repliedUser: false }
        });
      }
    }
  });
}
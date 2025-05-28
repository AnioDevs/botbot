import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const config = require('../config.json');

export const data = new SlashCommandBuilder()
  .setName('enlist')
  .setDescription('Enlist into the regiment')
  .addStringOption(opt =>
    opt.setName('username').setDescription('Your username').setRequired(true))
  .addStringOption(opt =>
    opt.setName('timezone').setDescription('Your timezone').setRequired(true))
  .addStringOption(opt =>
    opt.setName('device').setDescription('Device used')
      .addChoices(
        { name: 'Mobile', value: 'Mobile' },
        { name: 'PC', value: 'PC' }
      )
      .setRequired(true))
  .addStringOption(opt =>
    opt.setName('activity').setDescription('How active are you?').setRequired(true))
  .addStringOption(opt =>
    opt.setName('experience').setDescription('Your past experience').setRequired(true))
  .addStringOption(opt =>
    opt.setName('regiment').setDescription('Choose your regiment')
      .addChoices({ name: '1TL', value: '1TL' })
      .setRequired(true))
  .addStringOption(opt =>
    opt.setName('note').setDescription('Optional note'));

export async function execute(interaction) {
  const member = interaction.member;
  const roleId = config.checkedRoleId;

  if (member.roles.cache.has(roleId)) {
    const embed = new EmbedBuilder()
      .setAuthor({ name: 'Knights Hospitaller Half-Auto Enlistment System' })
      .setTitle('Failed')
      .setDescription(`You already have the <@${roleId}> role!`)
      .setColor(0xFF0000);

    return await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // Kullanıcıya "enlisted" rolünü ver
  await member.roles.add(roleId);

  // Slash komut verilerini al
  const username = interaction.options.getString('username');
  const timezone = interaction.options.getString('timezone');
  const device = interaction.options.getString('device');
  const activity = interaction.options.getString('activity');
  const experience = interaction.options.getString('experience');
  const regiment = interaction.options.getString('regiment');
  const note = interaction.options.getString('note');

  // Eğer 1TL seçildiyse bu 5 rolü ver
  if (regiment === '1TL') {
    const extraRoles = [
      '1376724666051334194',
      '1376725530874875985',
      '1374004743445151764',
      '1373956632769335418',
      '1376709561607651378'
    ];
    for (const r of extraRoles) {
      await member.roles.add(r);
    }
  }

  // Embed oluştur (kullanıcıya özel mesaj)
  const userEmbed = new EmbedBuilder()
    .setAuthor({ name: 'Knights Hospitaller Half-Auto Enlistment System' })
    .setTitle('Enlistment Successful')
    .setColor(0x00FF00)
    .addFields(
      { name: 'Username', value: username },
      { name: 'Timezone', value: timezone },
      { name: 'Device', value: device },
      { name: 'Activity', value: activity },
      { name: 'Experience', value: experience },
      { name: 'Regiment', value: regiment }
    );

  if (note) userEmbed.addFields({ name: 'Note', value: note });

  await interaction.reply({ embeds: [userEmbed], ephemeral: true });

  // Kayıt kanalına embed gönder (public kayıt bildirimi)
  const logChannel = await interaction.client.channels.fetch('1376872115134795776');
  const logEmbed = new EmbedBuilder()
    .setTitle('New Enlistment')
    .setColor(0x0077FF)
    .addFields(
      { name: 'User', value: `${interaction.user.tag} (<@${interaction.user.id}>)` },
      { name: 'Username', value: username },
      { name: 'Timezone', value: timezone },
      { name: 'Device', value: device },
      { name: 'Activity', value: activity },
      { name: 'Experience', value: experience },
      { name: 'Regiment', value: regiment }
    );

  if (note) logEmbed.addFields({ name: 'Note', value: note });

  await logChannel.send({ embeds: [logEmbed] });
}

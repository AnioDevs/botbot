import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('uptime')
  .setDescription('It shows how many seconds, minutes, hours and days our bot has been active.');

export async function execute(interaction) {
  // Defer reply to handle processing
  await interaction.deferReply({ ephemeral: false });

  try {
    // Get bot uptime in milliseconds
    const uptimeMs = interaction.client.uptime;

    // Convert milliseconds to seconds, minutes, hours, days, months, years
    let seconds = Math.floor(uptimeMs / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);
    let months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    // Calculate remainders for each unit
    seconds = seconds % 60;
    minutes = minutes % 60;
    hours = hours % 24;
    days = days % 30;
    months = months % 12;

    // Build the uptime string based on the largest unit
    let uptimeString = '';
    if (years > 0) {
      uptimeString = `${years} year${years > 1 ? 's' : ''}`;
      if (months > 0) uptimeString += `, ${months} month${months > 1 ? 's' : ''}`;
    } else if (months > 0) {
      uptimeString = `${months} month${months > 1 ? 's' : ''}`;
      if (days > 0) uptimeString += `, ${days} day${days > 1 ? 's' : ''}`;
    } else if (days > 0) {
      uptimeString = `${days} day${days > 1 ? 's' : ''}`;
      if (hours > 0) uptimeString += `, ${hours} hr${hours > 1 ? 's' : ''}`;
      if (minutes > 0) uptimeString += `, ${minutes} min${minutes > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      uptimeString = `${hours} hr${hours > 1 ? 's' : ''}`;
      if (minutes > 0) uptimeString += `, ${minutes} min${minutes > 1 ? 's' : ''}`;
      if (seconds > 0) uptimeString += `, ${seconds} sec${seconds > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      uptimeString = `${minutes} min${minutes > 1 ? 's' : ''}`;
      if (seconds > 0) uptimeString += `, ${seconds} sec${seconds > 1 ? 's' : ''}`;
    } else {
      uptimeString = `${seconds} sec${seconds > 1 ? 's' : ''}`;
    }

    // Create embed
    const embed = new EmbedBuilder()
      .setTitle('Bot Uptime')
      .setDescription(`Our bot has been active for **${uptimeString}**.`)
      .setColor(0x00FF00) // Green, consistent with feedback.js
      .setTimestamp()
      .setFooter({ text: 'Proudly running!' });

    // Send reply
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error(`Error processing /uptime for ${interaction.user.tag}:`, error.message);
    await interaction.editReply({
      content: 'There was an error retrieving the uptime. Please try again later.',
      ephemeral: true
    });
  }
}
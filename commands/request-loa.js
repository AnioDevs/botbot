import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('request-loa')
  .setDescription('Request a Leave of Absence (LoA)')
  .addStringOption(option =>
    option
      .setName('starting-date')
      .setDescription('Start date of LoA (MM/DD/YYYY)')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('end-date')
      .setDescription('End date of LoA (MM/DD/YYYY)')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('reason')
      .setDescription('Reason for the LoA')
      .setRequired(true)
  );

export async function execute(interaction) {
  // Defer reply to handle asynchronous operations
  await interaction.deferReply({ ephemeral: true });

  // Get the user who ran the command
  const user = interaction.user;
  const startingDate = interaction.options.getString('starting-date');
  const endDate = interaction.options.getString('end-date');
  const reason = interaction.options.getString('reason');

  try {
    // Fetch the target channel
    const logChannel = await interaction.client.channels.fetch('1373742467844935820');
    
    // Construct the message
    const messageContent = `Username: <@${user.id}>\nReason: ${reason}\nStarting / Ending Date: ${startingDate} to ${endDate}\nPing: <@&1376996640535351438>`;

    // Send the message to the log channel
    const sentMessage = await logChannel.send(messageContent);

    // Add ✅ reaction to the sent message
    await sentMessage.react('✅');

    // Reply to the user
    await interaction.editReply({
      content: 'Your Leave of Absence request has been submitted successfully!',
      ephemeral: true
    });
  } catch (error) {
    console.error(`Error processing /request-loa for ${user.tag}:`, error.message);
    await interaction.editReply({
      content: 'There was an error submitting your LoA request. Please try again later.',
      ephemeral: true
    });
  }
}
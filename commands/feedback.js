import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { WebhookClient } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('feedback')
  .setDescription('Submit feedback about the bot (restricted to specific user for sending embed)');

export async function execute(interaction) {
  // Restrict command to specific user
  if (interaction.user.id !== '1046129725489299508') {
    return interaction.reply({
      content: 'This command is restricted to a specific user.',
      ephemeral: true
    });
  }

  // Defer reply to handle asynchronous operations
  await interaction.deferReply({ ephemeral: true });

  try {
    // Create the embed
    const embed = new EmbedBuilder()
      .setAuthor({ name: 'Feedback System' })
      .setDescription('Please let us know of any commands, functions, or bugs you would like to see added.')
      .setFooter({ text: 'Clicking the button will direct you to a form, the information you give us in this form will never be stored.' })
      .setColor(0x00FF00);

    // Create the Feedback button
    const feedbackButton = new ButtonBuilder()
      .setCustomId('feedback_button')
      .setLabel('Feedback')
      .setStyle(ButtonStyle.Primary);

    // Create action row for the button
    const row = new ActionRowBuilder().addComponents(feedbackButton);

    // Send embed with button to the specified channel
    const feedbackChannel = await interaction.client.channels.fetch('1376999579911847968');
    await feedbackChannel.send({ embeds: [embed], components: [row] });

    // Reply to the user
    await interaction.editReply({
      content: 'Feedback embed sent successfully!',
      ephemeral: true
    });

    // Handle button interaction (open to all users)
    const filter = i => i.customId === 'feedback_button';
    const collector = feedbackChannel.createMessageComponentCollector({ filter, time: 86400000 }); // 24 hours

    collector.on('collect', async i => {
      // Create the modal
      const modal = new ModalBuilder()
        .setCustomId('feedback_modal')
        .setTitle('Feedback Form');

      // Create text input fields
      const usernameInput = new TextInputBuilder()
        .setCustomId('username')
        .setLabel("What's your username?")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const ratingInput = new TextInputBuilder()
        .setCustomId('rating')
        .setLabel('How many points would you give out of 10?')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const likedInput = new TextInputBuilder()
        .setCustomId('liked')
        .setLabel('What did you like?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const dislikedInput = new TextInputBuilder()
        .setCustomId('disliked')
        .setLabel("What didn't you like?")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const reasonInput = new TextInputBuilder()
        .setCustomId('reason')
        .setLabel('Why did you like/dislike it?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      // Add inputs to modal (5 fields to stay within Discord's limit)
      const actionRows = [
        new ActionRowBuilder().addComponents(usernameInput),
        new ActionRowBuilder().addComponents(ratingInput),
        new ActionRowBuilder().addComponents(likedInput),
        new ActionRowBuilder().addComponents(dislikedInput),
        new ActionRowBuilder().addComponents(reasonInput)
      ];
      modal.addComponents(actionRows);

      // Show the modal
      await i.showModal(modal);
    });

    // Handle modal submission (open to all users)
    interaction.client.on('interactionCreate', async modalInteraction => {
      if (!modalInteraction.isModalSubmit() || modalInteraction.customId !== 'feedback_modal') return;

      try {
        // Get form data
        const username = modalInteraction.fields.getTextInputValue('username');
        const rating = modalInteraction.fields.getTextInputValue('rating');
        const liked = modalInteraction.fields.getTextInputValue('liked');
        const disliked = modalInteraction.fields.getTextInputValue('disliked');
        const reason = modalInteraction.fields.getTextInputValue('reason');

        // Create webhook client
        const webhookClient = new WebhookClient({ url: 'https://discord.com/api/webhooks/1377006304777994322/F_B7kwxWpN4mz9XU3bYSBftgGX8BTrJinbx6cJ1kSN4rA59V1lA4aAXEAWX4AdPYRH8t' });

        // Construct message
        const messageContent = `**Feedback Submission**\n\n` +
                              `Username: ${username}\n` +
                              `Rating: ${rating}/10\n` +
                              `Liked: ${liked}\n` +
                              `Disliked: ${disliked}\n` +
                              `Reason: ${reason}\n` +
                              `Suggestions: None`;

        // Send to webhook
        await webhookClient.send({
          content: messageContent,
          username: 'Feedback Bot',
          avatarURL: modalInteraction.client.user.displayAvatarURL()
        });

        // Reply to user
        await modalInteraction.reply({
          content: 'Your feedback has been submitted successfully!',
          ephemeral: true
        });
      } catch (error) {
        console.error(`Error processing feedback modal for ${modalInteraction.user.tag}:`, error.message);
        await modalInteraction.reply({
          content: 'There was an error submitting your feedback. Please try again later.',
          ephemeral: true
        });
      }
    });

  } catch (error) {
    console.error(`Error processing /feedback for ${interaction.user.tag}:`, error.message);
    await interaction.editReply({
      content: 'There was an error sending the feedback embed. Please try again later.',
      ephemeral: true
    });
  }
}
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('history')
  .setDescription('Shows the history of the Knights Hospitaller.');

export async function execute(interaction) {
  await interaction.deferReply();

  try {
    const embed = new EmbedBuilder()
      .setTitle('History of the Knights Hospitaller')
      .setDescription(
        'The Knights Hospitaller, officially the Order of St. John of Jerusalem, was a Catholic military order founded around 1099 in Jerusalem to care for sick and poor pilgrims. Established during the First Crusade, the Order initially ran a hospital in Jerusalem, providing medical aid to pilgrims. Over time, it took on a military role, defending the Holy Land and Christian territories.\n\n' +
        'The Order relocated to Rhodes in 1310 after the fall of Jerusalem, and later to Malta in 1530, where they became known for their naval prowess, resisting Ottoman invasions, notably during the Great Siege of Malta in 1565. The Knights maintained their charitable mission while governing as a sovereign entity.\n\n' +
        'Today, the Order continues as the Sovereign Military Order of Malta, focusing on humanitarian aid and diplomacy, with a legacy of service spanning over 900 years.'
      )
      .setColor(0x00FF00) // Green, consistent with other commands
      .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Malta_Valletta_BW_2011-10-06_11-13-46.JPG/120px-Malta_Valletta_BW_2011-10-06_11-13-46.JPG') // Malta image
      .setFooter({ text: 'Source: Wikipedia' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error(`Error processing /history for ${interaction.user.tag}:`, error.message);
    await interaction.editReply({
      content: 'There was an error retrieving the history. Please try again later.',
      ephemeral: true
    });
  }
}
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('joke')
  .setDescription('Tells a random medieval joke.');

export async function execute(interaction) {
  await interaction.deferReply();

  try {
    // Medieval-themed jokes
    const jokes = [
      { question: 'Why did the knight bring a ladder to battle?', answer: 'Because he wanted to take it to the next level!' },
      { question: 'What do you call a knight who loves to sing?', answer: 'A troubadour in armor!' },
      { question: 'Why was the Hospitaller so good at chess?', answer: 'Because he always protected the king!' },
      { question: 'How did the knight greet his horse?', answer: 'With a hearty "Neigh, good sir!"' },
      { question: 'Why did the squire join the Hospitallers?', answer: 'To become a knight in shining service!' }
    ];

    // Select random joke
    const joke = jokes[Math.floor(Math.random() * jokes.length)];

    const embed = new EmbedBuilder()
      .setTitle('Medieval Jest')
      .setDescription(`**Q:** ${joke.question}\n**A:** ${joke.answer}`)
      .setColor(0x00FF00)
      .setFooter({ text: 'A chuckle from the Middle Ages!' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error(`Error processing /joke for ${interaction.user.tag}:`, error.message);
    await interaction.editReply({
      content: 'There was an error telling the joke. Please try again later.',
      ephemeral: true
    });
  }
}
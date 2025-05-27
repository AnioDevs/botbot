import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execute as enlistExecute, data as enlistData } from './commands/enlist.js';
import { setup as loaSetup } from './commands/loa.js';
import express from 'express'; // Yeni bağımlılık

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMembers, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
  ] 
});

client.commands = new Collection();

// Dinamik komut yükleme
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  try {
    const command = await import(`./commands/${file}`);
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
      console.log(`✅ Loaded command: ${file}`);
    } else {
      console.warn(`⚠️ Warning: ${file} does not export valid command data or execute function`);
    }
  } catch (error) {
    console.error(`❌ Error loading command ${file}:`, error.message);
  }
}

client.commands.set(enlistData.name, { execute: enlistExecute });
loaSetup(client);

client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  client.user.setActivity('/enlist', { type: 0 });
  client.user.setStatus('idle');
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`Error executing command ${interaction.commandName}:`, err);
    await interaction.reply({ content: 'Error executing command.', ephemeral: true });
  }
});

// HTTP sunucusu ekle
const app = express();
app.get('/', (req, res) => {
  res.send('Bot çalışıyor!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`HTTP sunucusu http://localhost:${port} adresinde çalışıyor`);
});

client.login(process.env.DISCORD_TOKEN);
import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

config();

if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID || !process.env.GUILD_ID) {
  console.error('❌ Missing environment variables. Please check your .env file.');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  try {
    console.log(`Loading command: ${file}`);
    const commandModule = await import(`./commands/${file}`);
    
    const data = commandModule.data || commandModule.default?.data;
    
    if (data && typeof data.toJSON === 'function') {
      commands.push(data.toJSON());
      console.log(`✅ Successfully loaded: ${file}`);
    } else {
      console.warn(`⚠️  Warning: ${file} does not export a valid SlashCommandBuilder data object`);
    }
  } catch (error) {
    console.error(`❌ Error loading command ${file}:`, error.message);
  }
}

if (commands.length === 0) {
  console.error('❌ No valid commands found! Please check your command files.');
  process.exit(1);
}

console.log(`Found ${commands.length} valid command(s)`);

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
  console.log('Registering slash commands...');
  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands }
  );
  console.log('✅ Slash commands registered successfully!');
} catch (err) {
  console.error('❌ Error registering commands:', err.message);
  if (err.response) {
    console.error('API Response:', err.response.data);
  }
}
let fs = require('fs');
let Discord = require('discord.js');
let Intents = Discord.Intents;

let config = require('./config.json');
let utilsReg = require('./util/registerCommands.js');

const clientIntents = new Intents().add(
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
);

let client = new Discord.Client({intents: clientIntents});

// Read and store commands in client.commands
client.commands = new Discord.Collection();
fs.readdirSync('./commands').forEach(category => {
    fs.readdirSync(`./commands/${category}`).forEach(c => {
        let command = require(`./commands/${category}/${c}/index.js`);
        client.commands.set(command.name, {interactionHandler: command.interactionHandler, buttonHandler: command.buttonHandler});
        console.log(`Loaded ${command.name}`);
    })
})

// Helper stuff attached to client
client.registerGuildCommands = utilsReg.registerGuildCommands;

// Event listeners
client.on('ready', c => {
    console.log(`\nLogged in and ready\n`);
	c.user.setActivity(`${c.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users`, {type: 'WATCHING'});
})

client.on('error', console.error);

client.on('interactionCreate', interaction => {
    if(interaction.isCommand()) {
        if(client.commands.has(interaction.commandName)) {
            client.commands.get(interaction.commandName).interactionHandler(interaction);
        }
    } else if(interaction.isButton()) {
        let customId = interaction.customId;
        let [commandName, t, x, y, ...btnData] = customId.split('-');
        if(client.commands.has(commandName)) {  // Sanity check
            client.commands.get(commandName).buttonHandler(interaction, t, x, y, btnData);
        }
    }
})

client.on('guildCreate', guild => {
    console.log(`New guild\nName: ${guild.name}\nId: ${guild.id}`);
    utilsReg.registerGuildCommands(client.user.id, guild.id)
    .then(() => {})
    .catch(() => {});
})

if(config.token) client.login(config.token);
else if(process.env.TOKEN) client.log(process.env.TOKEN);
else throw('Invalid token.');
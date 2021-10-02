const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token } = require('../../../config.json');
const fs = require('fs');

module.exports = {
    name: "refreshguildcommands",
    desc: "Reregisters slash commands to the guild. Do not spam this command.",
    interactionHandler: async interaction => {
        await interaction.deferReply();
        
        console.log(`Registering guild commands for ${interaction.guild.id}`);
        
        let rest = new REST({ version: '9' }).setToken(token);

        let guildCommandData = [];
        // let guildCommandFiles = fs.readdirSync('../../guild/');
        let guildCommandFiles = fs.readdirSync('./commands/guild');
        for (const dir of guildCommandFiles) {
            let commandBuilder = require(`../${dir}/builder.js`);
            guildCommandData.push(commandBuilder.data.toJSON());
        }

        rest.put(
            Routes.applicationGuildCommands(interaction.client.user.id, interaction.guild.id),
            { body: guildCommandData }
        )
        .then(val => {
            console.log(`Successfully registered guild commands for ${interaction.guild.id}`);
            interaction.editReply({ content: 'Success' });
        })
        .catch(err => {
            console.log(`Failed to register guild commands for ${interaction.guild.id}. Error:\m${err}\n`);
            interaction.editReply({ content: `Failed. Error:\n${err}`});
        })
    }
}
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token } = require('../config.json');
const fs = require('fs');

let guildCommandData = [];
let guildCommandFiles = fs.readdirSync('./commands/guild');
for (const dir of guildCommandFiles) {
    let commandBuilder = require(`../commands/guild/${dir}/builder.js`);
    guildCommandData.push(commandBuilder.data.toJSON());
}

let rest = new REST({ version: '9' }).setToken(token);

async function registerGuildCommands(clientId, guildId) {
    return new Promise((resolve, reject) => {
        console.log(`Registering guild commands for ${guildId}`);

        rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: guildCommandData }
        )
        .then(val => {
            console.log(`Successfully registered guild commands for ${guildId}`);
            resolve(val);
        })
        .catch(err => {
            console.log(`Failed to register guild commands for ${guildId}. Error:\m${err}\n`);
            reject(err);
        })
    })
}

module.exports = {
    registerGuildCommands
}
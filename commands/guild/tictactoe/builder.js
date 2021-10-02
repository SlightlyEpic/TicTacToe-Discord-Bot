const { SlashCommandBuilder } = require('@discordjs/builders');
const command = require('./index.js');

let data = new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.desc)
    .addUserOption(option => option
        .setName('opponent')
        .setDescription('The person whom you want to play with')
        .setRequired(true)
        );

module.exports = { data };
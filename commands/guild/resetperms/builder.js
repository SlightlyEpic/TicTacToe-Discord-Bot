const { SlashCommandBuilder } = require('@discordjs/builders');
const command = require('./index.js');

let data = new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.desc)
    .addStringOption(option => option
        .setName('command')
        .setDescription('The command to disable')
        .setRequired(true)
        );

module.exports = { data };
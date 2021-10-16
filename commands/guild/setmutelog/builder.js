const { SlashCommandBuilder } = require('@discordjs/builders');
const command = require('./index.js');

let data = new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.desc)
    .addChannelOption(option => option
        .setName('mutelog')
        .setDescription('The channel in which mute logs are sent')
        .setRequired(true)
        );

module.exports = { data };
const { SlashCommandBuilder } = require('@discordjs/builders');
const command = require('./index.js');

let data = new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.desc)
    .addUserOption(option => option
        .setName('user')
        .setDescription('User to unmute')
        .setRequired(true)
        );

module.exports = { data };
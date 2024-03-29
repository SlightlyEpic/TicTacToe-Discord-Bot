const { SlashCommandBuilder } = require('@discordjs/builders');
const command = require('./index.js');

let data = new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.desc)
    .addUserOption(option => option
        .setName('user')
        .setDescription('User to mute')
        .setRequired(true)
        )
    .addStringOption(option => option
        .setName('reason')
        .setDescription('The reason for muting this user')
        .setRequired(false)
        );

module.exports = { data };
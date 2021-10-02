const { SlashCommandBuilder } = require('@discordjs/builders');
const command = require('./index.js');

let data = new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.desc)
    .addUserOption(option => option
        .setName('user')
        .setDescription('User to be banned')
        .setRequired(true)
        )
    .addStringOption(option => option
        .setName('reason')
        .setDescription('Reason for banning the user')
        .setRequired(false)
        );

module.exports = { data };
const { SlashCommandBuilder } = require('@discordjs/builders');
const command = require('./index.js');

let data = new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.desc)
    .addUserOption(option => option
        .setName('user')
        .setDescription('User to be kicked')
        .setRequired(true)
        )
    .addStringOption(option => option
        .setName('reason')
        .setDescription('Reason for kicking the user')
        .setRequired(false)
        );

module.exports = { data };
const { SlashCommandBuilder } = require('@discordjs/builders');
const command = require('./index.js');

let data = new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.desc)
    .addStringOption(option => option
        .setName('from')
        .setDescription('Command from which to copy role permissions')
        .setRequired(true)
        )
    .addStringOption(option => option
        .setName('to')
        .setDescription('Command to which copy the role permissions')
        .setRequired(true)
        );

module.exports = { data };
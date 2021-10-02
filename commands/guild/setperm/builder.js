const { SlashCommandBuilder } = require('@discordjs/builders');
const command = require('./index.js');

let data = new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.desc)
    .addStringOption(option => option
        .setName('command')
        .setDescription('The name of the command to update permissions for')
        .setRequired(true)
        )
    .addRoleOption(option => option
        .setName('role')
        .setDescription('The role to allow/disallow usage')
        .setRequired(true)
        )
    .addBooleanOption(option => option
        .setName('allow')
        .setDescription('Allow or disallow role from executing the provided command')
        .setRequired(true)
        );

module.exports = { data };
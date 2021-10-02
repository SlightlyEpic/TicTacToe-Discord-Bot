module.exports = {
    name: "resetperms",
    desc: "Resets all role permissions for a command",
    interactionHandler: async interaction => {
        await interaction.deferReply();

        const commandName = interaction.options.getString('command').toLowerCase().trim();
        const client = interaction.client;

        if (!client.application?.owner) await client.application?.fetch();
        if(!client.commands.has(commandName)) {
            return interaction.editReply({ content: 'Invalid command name', ephemeral: true })
        }

        if(interaction.guild.commands.cache.size == 0) await interaction.guild.commands.fetch();
        let command = interaction.guild.commands.cache.find(c => c.name === commandName);
        if(!command) {
            return interaction.editReply({ content: 'Guild command not found, perhaps it is not registered', ephemeral: true })
        }

        let permissions = []

        command.permissions.set({ permissions })
        .then(() => {
            interaction.editReply({ content: `Sucessfully reset ${commandName} role permissions` });
        })
        .catch(err => {
            interaction.editReply({ content: `Failed to update permissions. Error:\n${err}` });
        })
    }
}
module.exports = {
    name: "setperm",
    desc: "Allows setting role permissions for slash commands",
    interactionHandler: async interaction => {
        if(interaction.isCommand()) {
            await interaction.deferReply();

            if(!interaction.member.permissions.has('MANAGE_GUILD', true)) {
                return interaction.editReply({ content: 'You do not have sufficient privileges to run this command' })
            }

            const commandName = interaction.options.getString('command').toLowerCase().trim();
            const role = interaction.options.getRole('role');
            const isAllowed = interaction.options.getBoolean('allow');
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

            const permissions = [
                {
                    id: role.id,
                    type: 'ROLE',
                    permission: isAllowed
                }
            ]

            command.permissions.add({ permissions })
            .then(() => {
                interaction.editReply({ content: `Sucessfully ${isAllowed ? 'enabled' : 'disabled'} ${commandName} for ${role.name}`})
            })
            .catch(err => {
                interaction.editReply({ content: `Failed to update permissions. Error:\n${err}` })
            })
        }
    }
}
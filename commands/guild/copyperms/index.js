module.exports = {
    name: "copyperms",
    desc: "Allows copying role permissions from one command to another",
    interactionHandler: async interaction => {
        if(interaction.isCommand()) {
            await interaction.deferReply();

            if(!interaction.member.permissions.has('MANAGE_GUILD', true)) {
                return interaction.editReply({ content: 'You do not have sufficient priveleges to run this command' })
            }

            const from = interaction.options.getString('from').toLowerCase();
            const to = interaction.options.getString('to').toLowerCase();
            const client = interaction.client;

            if(!client.commands.has(from)) return interaction.editReply({ content: `${from} command could not be found`, ephemeral: true});
            if(!client.commands.has(to)) return interaction.editReply({ content: `${to} command could not be found`, ephemeral: true});

            if (!client.application?.owner) await client.application?.fetch();

            let fromCommand = interaction.guild?.commands.cache.find(c => c.name === from);
            let toCommand = interaction.guild?.commands.cache.find(c => c.name === to);

            if(!fromCommand) return interaction.editReply({ content: `${from} guild command not found`, ephemeral: true});
            if(!toCommand) return interaction.editReply({ content: `${to} guild command not found`, ephemeral: true});

            interaction.guild.commands.permissions.fetch({ command: fromCommand.id })
            .then(perms => {
                toCommand.permissions.set(perms)
                .then(p => {
                    interaction.editReply({ content: `Successfully copied permissions from ${from} to ${to}` });
                })
                .catch(err => {
                    interaction.editReply({ content: `Encountered an error while copying permissions. Error:\n${err}`});
                })
            })
        }
    }
}
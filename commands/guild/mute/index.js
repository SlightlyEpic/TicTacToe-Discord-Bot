module.exports = {
    name: "mute",
    desc: "Mutes a specific user",
    interactionHandler: async interaction => {
        if(interaction.isCommand()) {
            await interaction.deferReply();

            let memberToMute = interaction.options.getMember('user');
            let mutedRole = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === 'muted');

            if(!mutedRole) {
                mutedRole = await interaction.guild.roles.create({
                    name: 'Muted',
                    color: '#222222',
                    hoist: false,
                    position: 0,
                    permissions: ['VIEW_CHANNEL'],
                    mentionable: false
                })
            }

            memberToMute.roles.add(mutedRole)
            .then(() => {
                interaction.editReply({ content: `Successfully muted ${memberToMute.displayName}` })
            })
            .catch(err => {
                interaction.editReply({ content: `Failed to mute ${memberToMute.displayName} due to an error. Error:\n${err}`})
            })
        }
    }
}
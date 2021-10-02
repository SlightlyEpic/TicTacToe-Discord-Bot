module.exports = {
    name: "unmute",
    desc: "Unmutes a specific user",
    interactionHandler: async interaction => {
        if(interaction.isCommand()) {
            await interaction.deferReply();

            let memberToUnmute = interaction.options.getMember('user');
            let mutedRole = memberToUnmute.roles.cache.find(role => role.name.toLowerCase() === 'muted');

            if(!mutedRole) {
                return interaction.editReply({ content: `${memberToUnmute.displayName} is already unmuted` });
            }

            memberToUnmute.roles.remove(mutedRole)
            .then(() => {
                interaction.editReply({ content: `Successfully unmuted ${memberToUnmute.displayName}` })
            })
            .catch(err => {
                interaction.editReply({ content: `Failed to unmute ${memberToUnmute.displayName} due to an error. Error:\n${err}`})
            })
        }
    }
}
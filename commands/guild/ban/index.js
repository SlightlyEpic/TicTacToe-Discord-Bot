module.exports = {
    name: "ban",
    desc: "Bans a specific user from the guild",
    interactionHandler: async interaction => {
        if(interaction.isCommand()) {
            await interaction.deferReply();

            let memberToKick = interaction.options.getMember('user');
            let reason = interaction.options.getString('reason') || 'Reason not specified';

            memberToKick.ban({ reason: reason })
            .then(() => {
                interaction.editReply({ content: `Banned ${memberToKick.displayName} (${memberToKick.id}) for ${reason}` });
            })
            .catch(err => {
                interaction.editReply({ content: `Failed to ban user due to an error. Error:\n${err}` });
            })
        }
    }
}
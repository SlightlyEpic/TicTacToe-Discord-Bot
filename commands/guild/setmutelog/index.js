const { channel } = require('diagnostics_channel');
let fs = require('fs');

module.exports = {
    name: "setmutelog",
    desc: "Sets the log channel for mute records",
    interactionHandler: async interaction => {
        await interaction.deferReply();

        let muteChannel = interaction.options.getChannel('mutelog');

        let jsonData = {
            [interaction.guildId]: {
                muteChannelId: muteChannel.id
            }
        }

        try {
            fs.writeFileSync('./commands/guild/mute/muteConfig.json', JSON.stringify(jsonData))
            interaction.editReply({ content: `Successfully set mute log channel to <#${muteChannel.id}>` });
        } catch(err) {
            interaction.editReply({ content: `Failed to set mute log channel. Error:\n${err}`});
        }
    }
}
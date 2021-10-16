let { MessageEmbed } = require('discord.js');

module.exports = {
    name: "mute",
    desc: "Mutes a specific user",
    interactionHandler: async interaction => {
        if(interaction.isCommand()) {
            await interaction.deferReply();

            let muteConfig = require('./muteConfig.json');
			
			if(!interaction.member.permissions.has('KICK_MEMBERS', true)) {
                return interaction.editReply({ content: 'You do not have sufficient privileges to run this command' })
            }

            let muteChannelId = muteConfig[interaction.guildId].muteChannelId

            let memberToMute = interaction.options.getMember('user');
            let reason = interaction.options.getString('reason');

            let mutedRole = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === 'muted');
            if(!reason) reason = 'No reason specified';

            let muteLogChannel = interaction.guild.channels.cache.get(muteChannelId);

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
            .then(async () => {
                await interaction.editReply({ content: `Successfully muted ${memberToMute.displayName} for ${reason}` });

                if(muteLogChannel) {
					let reply = await interaction.fetchReply();
					
                    let emb = new MessageEmbed()
                    .setColor('AQUA')
                    .setAuthor(`${memberToMute.user.username} (${memberToMute.id}) was muted`)
                    .addField('Muted by:', `${interaction.user.username} (${interaction.user.id})`)
                    .addField('Reason:', `${reason}`)
                    .addField('Context:', `${reply.url}`)
                    .setTimestamp()
                    .setFooter('Mute Log');

                    muteLogChannel.send({ embeds: [emb] })
                    .catch(err => {
                        interaction.followUp({ content: `Could not log this mute interaction. Error:\n${err}`, ephemeral: true });
                    })
                }
            })
            .catch(err => {
                interaction.editReply({ content: `Failed to mute ${memberToMute.displayName} due to an error. Error:\n${err}`})
            })
        }
    }
}
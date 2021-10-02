module.exports = {
    name: "ping",
    desc: "Tells you the latency of the bot",
    interactionHandler: async interaction => {
        if(interaction.isCommand()) {
            const initTime = Date.now();
            await interaction.reply({ content: "Calculating..." });
            const elapsedTime = Date.now() - initTime;
            interaction.editReply({ content: `Latency: ${elapsedTime} ms` });
        }
    }
}
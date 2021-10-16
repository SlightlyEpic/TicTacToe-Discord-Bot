const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
    name: "rps",
    desc: "Starts a game of rock paper scissors with another player",
    interactionHandler: async interaction => {
        await interaction.deferReply();

        let challenger = interaction.user;
        let opponent = interaction.options.getUser('opponent');

        if(challenger.id === opponent.id) return interaction.editReply({ content: 'You cannot play with yourself' });
        if(data.waiting[challenger.id] || data.inProgress[challenger.id]) return interaction.editReply({ content: 'You are already in a match' });
        if(data.inProgress[opponent.id]) return interaction.editReply({ content: 'The person you want to play with is already in a match' });
        if(data.waiting[opponent.id]) {
            let oppMatch = data.waiting[opponent.id];
            if(oppMatch.opponent.id == challenger.id) {
                return interaction.editReply({ content: `This player is waiting for you to join their game!\nGame link: ${oppMatch.gameMessage?.url}`});
            } else {
                return interaction.editReply({ content: 'This person is waiting for someone else...' });
            }
        }

        let waitingRow1 = new MessageActionRow()
        .addComponents([
            new MessageButton()
            .setCustomId(`rps-0-0-0-${challenger.id}`)
            .setLabel('Player 1')
            .setStyle('PRIMARY')
            .setDisabled(true),
            new MessageButton()
            .setCustomId('rps-0-1-0-')
            .setLabel(challenger.username)
            .setStyle('PRIMARY')
            .setDisabled(true),
            new MessageButton()
            .setCustomId('rps-0-2-0-')
            .setLabel('READY')
            .setStyle('SUCCESS')
            .setDisabled(true)
        ]);

        let waitingRow2 = new MessageActionRow()
        .addComponents([
            new MessageButton()
            .setCustomId(`rps-0-0-1-${opponent.id}`)
            .setLabel('Player 2')
            .setStyle('PRIMARY')
            .setDisabled(true),
            new MessageButton()
            .setCustomId('rps-0-1-1-')
            .setLabel(opponent.username)
            .setStyle('PRIMARY')
            .setDisabled(true),
            new MessageButton()
            .setCustomId(`rps-0-2-1-${challenger.id}`)      //
            .setLabel('WAITING')
            .setStyle('DANGER')
            .setDisabled(false)
        ]);

        let match = new Match(challenger, opponent, interaction)

        await interaction.editReply({ content: `${opponent.toString()} has 60s to join the match`, components: [waitingRow1, waitingRow2] });
        data.waiting[challenger.id] = match;

        let reply = await interaction.fetchReply()
        match.setGameMessage(reply);

        setTimeout(() => {
            if(match.state == 0) {
                reply.edit({ content: 'The opponent didnt join in time. The game has been terminated.' });
                delete data.waiting[challenger.id];
            }
        }, 60000);
    },
    buttonHandler: async (interaction, t, x, y, btnData) => {
        // 0-1-2: opponent ready button
        switch(t) {
            case "0":
                {
                    // let m = await interaction.fetchReply();
                    // let challengerId = m.components[0].components[0].customId.split('-')[4];
                    let challengerId = btnData[0];
                    let m = data.waiting[challengerId].gameMessage;
                    let opponentId = m.components[1].components[0].customId.split('-')[4];
                    if(x == "2" && y == "1" && interaction.user.id == opponentId) {
                        let match = data.waiting[challengerId];
                    
                        let newActionRows = m.components;
                        newActionRows[1].components[2].setLabel('READY').setStyle('SUCCESS');
                        match.gameMessage = await match.gameMessage.edit({
                            content: 'Starting match...',
                            components: newActionRows
                        });
                    
                        match.state = 1;
                        data.inProgress[challengerId] = match;
                        data.inProgress[opponentId] = match;
                        delete data.waiting[challengerId];
                    
                        startMatch(match);
                    }
                }
                break;
            case "1":
                {
                    // let m = await interaction.fetchReply();
                    // let challengerId = m.components[1].components[1].customId.split('-')[4];
                    let challengerId = btnData[0];
                    let m = data.inProgress[challengerId].gameMessage;
                    let opponentId = m.components[1].components[2].customId.split('-')[4];
                    let match = data.inProgress[challengerId];

                    if(!match) return;

                    if(interaction.user.id == match.challenger.id || interaction.user.id == match.opponent.id) {
                        let btnXcoord = interaction.user.id == match.challenger.id ? 1 : 2;
                        let choice = ['ROCK', 'PAPER', 'SCISSORS'][x];
                        let choiceEmoji = rpsEmoji(choice);

                        let iUser = btnXcoord == 1 ? 'challenger' : 'opponent';
                        let iUser2 = btnXcoord == 1 ? 'opponent' : 'challenger';

                        match[`${iUser}Pick`] = choice;

                        if(match['challengerPick'] && match['opponentPick']) {
                            let challengerWinning = checkWinning(match.challengerPick, match.opponentPick);
                            let opponentWinning = checkWinning(match.opponentPick, match.challengerPick);

                            match.lastMove = Date.now() + 3000;

                            let newActionRows = m.components;
                            newActionRows[0].components[0].setDisabled(true);
                            newActionRows[0].components[1].setDisabled(true);
                            newActionRows[0].components[2].setDisabled(true);

                            newActionRows[2].components[1].setLabel(rpsEmoji(match.challengerPick)).setStyle('PRIMARY');
                            newActionRows[2].components[2].setLabel(rpsEmoji(match.opponentPick)).setStyle('PRIMARY');

                            if(challengerWinning) {
                                match.challengerScore += 1;
                                newActionRows[1].components[1].setStyle('SUCCESS');
                                newActionRows[1].components[2].setStyle('DANGER');
                                newActionRows[2].components[1].setStyle('SUCCESS');
                                newActionRows[2].components[2].setStyle('DANGER');
                            } else if (opponentWinning) {
                                match.opponentScore += 1;
                                newActionRows[1].components[2].setStyle('SUCCESS');
                                newActionRows[1].components[1].setStyle('DANGER');
                                newActionRows[2].components[2].setStyle('SUCCESS');
                                newActionRows[2].components[1].setStyle('DANGER');
                            }

                            newActionRows[2].components[0].setLabel(`${match.challengerScore} - ${match.opponentScore}`);

                            data.inProgress[challengerId].challengerPick = null;
                            data.inProgress[opponentId].opponentPick = null;

                            match.gameMessage = await match.gameMessage.edit({ components: newActionRows });

                            if(match.challengerScore != 3 && match.opponentScore != 3) {
                                setTimeout(async () => {
                                    let playRow1 = new MessageActionRow()
                                    .addComponents([
                                    new MessageButton()
                                    .setCustomId(`rps-1-0-0-${challengerId}`)
                                    .setLabel('🗿')
                                    .setStyle('SECONDARY')
                                    .setDisabled(false),
                                    new MessageButton()
                                    .setCustomId(`rps-1-1-0-${challengerId}`)
                                    .setLabel('📜')
                                    .setStyle('SECONDARY')
                                    .setDisabled(false),
                                    new MessageButton()
                                    .setCustomId(`rps-1-2-0-${challengerId}`)
                                    .setLabel('✂')
                                    .setStyle('SECONDARY')
                                    .setDisabled(false)
                                    ])
                                
                                    let playRow2 = new MessageActionRow()
                                    .addComponents([
                                    new MessageButton()
                                    .setCustomId('rps-1-0-1')
                                    .setLabel('Score')
                                    .setStyle('PRIMARY')
                                    .setDisabled(true),
                                    new MessageButton()
                                    .setCustomId(`rps-1-1-1-${challengerId}`)
                                    .setLabel(match.challenger.username)
                                    .setStyle('PRIMARY')
                                    .setDisabled(true),
                                    new MessageButton()
                                    .setCustomId(`rps-1-2-1-${opponentId}`)
                                    .setLabel(match.opponent.username)
                                    .setStyle('PRIMARY')
                                    .setDisabled(true)
                                    ])
                                
                                    let playRow3 = new MessageActionRow()
                                    .addComponents([
                                    new MessageButton()
                                    .setCustomId('rps-1-0-2')
                                    .setLabel(`${match.challengerScore} - ${match.opponentScore}`)
                                    .setStyle('PRIMARY')
                                    .setDisabled(true),
                                    new MessageButton()
                                    .setCustomId('rps-1-1-2')
                                    .setLabel('???')
                                    .setStyle('SECONDARY')
                                    .setDisabled(true),
                                    new MessageButton()
                                    .setCustomId('rps-1-2-2')
                                    .setLabel('???')
                                    .setStyle('SECONDARY')
                                    .setDisabled(true)
                                    ])

                                    match.gameMessage = await match.gameMessage.edit({
                                        content: 'Both players to pick an option in 20 seconds',
                                        components: [playRow1, playRow2, playRow3]
                                    });

                                    setTimeout(async () => {
                                        if(Date.now() - match.lastMove > 20000) {
                                            if(!match.challengerPick && !match.opponentPick) {
                                                match.gameMessage = await match.gameMessage.edit({ content: `Game drawn, both players failed to select an option within 20 seconds.\nScore: ${match.challengerScore} - ${match.opponentScore}` });
                                            } else if(!match.challengerPick && match.opponentPick) {
                                                match.gameMessage = await match.gameMessage.edit({ content: `${match.opponent.username} wins! ${match.challenger.username} left the game.` });
                                            } else if(match.challengerPick && !match.opponentPick) {
                                                match.gameMessage = await match.gameMessage.edit({ content: `${match.challenger.username} wins! ${match.opponent.username} left the game.` });
                                            }
                                        }
                                    }, 20000)
                                
                                }, 3000);
                            } else {
                                let winner = match.challengerScore == 3 ? match.challenger : match.opponent;

                                delete data.inProgress[challengerId];
                                delete data.inProgress[opponentId];

                                setTimeout(async () => {
                                    match.gameMessage = await match.gameMessage.edit({ content: `${winner.username} wins! Score: ${match.challengerScore} - ${match.opponentScore}`});
                                }, 3000);

                            }
                            
                        } else {
                            let newActionRows = m.components;
                            newActionRows[2].components[btnXcoord].setStyle('PRIMARY');

                            interaction.update({
                                content: 'Both players to pick an option in 20 seconds',
                                components: newActionRows
                            })
                        }
                    }
                }
                break;
        }
    }
}

let data = {
    inProgress: {},
    waiting: {}
}

async function startMatch(match) {
    let playRow1 = new MessageActionRow()
    .addComponents([
        new MessageButton()
        .setCustomId(`rps-1-0-0-${match.challenger.id}`)
        .setLabel('🗿')
        .setStyle('SECONDARY')
        .setDisabled(false),
        new MessageButton()
        .setCustomId(`rps-1-1-0-${match.challenger.id}`)
        .setLabel('📜')
        .setStyle('SECONDARY')
        .setDisabled(false),
        new MessageButton()
        .setCustomId(`rps-1-2-0-${match.challenger.id}`)
        .setLabel('✂')
        .setStyle('SECONDARY')
        .setDisabled(false)
    ])

    let playRow2 = new MessageActionRow()
    .addComponents([
        new MessageButton()
        .setCustomId('rps-1-0-1')
        .setLabel('Score')
        .setStyle('PRIMARY')
        .setDisabled(true),
        new MessageButton()
        .setCustomId(`rps-1-1-1-${match.challenger.id}`)
        .setLabel(match.challenger.username)
        .setStyle('PRIMARY')
        .setDisabled(true),
        new MessageButton()
        .setCustomId(`rps-1-2-1-${match.opponent.id}`)
        .setLabel(match.opponent.username)
        .setStyle('PRIMARY')
        .setDisabled(true)
    ])

    let playRow3 = new MessageActionRow()
    .addComponents([
        new MessageButton()
        .setCustomId('rps-1-0-2')
        .setLabel('0 - 0')
        .setStyle('PRIMARY')
        .setDisabled(true),
        new MessageButton()
        .setCustomId('rps-1-1-2')
        .setLabel('???')
        .setStyle('SECONDARY')
        .setDisabled(true),
        new MessageButton()
        .setCustomId('rps-1-2-2')
        .setLabel('???')
        .setStyle('SECONDARY')
        .setDisabled(true)
    ])

    match.lastMove = Date.now();

    match.gameMessage = await match.gameMessage.edit({
        content: 'Both players to pick an option in 20 seconds',
        components: [playRow1, playRow2, playRow3]
    });

    setTimeout(async () => {
        if(Date.now() - match.lastMove > 20000) {
            if(!match.challengerPick && !match.opponentPick) {
                match.gameMessage = await match.gameMessage.edit({ content: `Game drawn, both players failed to select an option within 20 seconds.\nScore: ${match.challengerScore} - ${match.opponentScore}` });
            } else if(!match.challengerPick && match.opponentPick) {
                match.gameMessage = await match.gameMessage.edit({ content: `${match.opponent.username} wins! ${match.challenger.username} left the game.` });
            } else if(match.challengerPick && !match.opponentPick) {
                match.gameMessage = await match.gameMessage.edit({ content: `${match.challenger.username} wins! ${match.opponent.username} left the game.` });
            }
        }
    }, 20000)
}

class Match {
    constructor(challenger, opponent, interaction) {
        this.challenger = challenger;
        this.opponent = opponent;
        this.state = 0;              // 0: waiting, 1: in progress, 2: finished
        this.gameMessage = null;
        this.interaction = interaction;
        this.lastMove = null;
        this.challengerPick = null;
        this.opponentPick = null;
        this.challengerScore = 0;
        this.opponentScore = 0;
    }

    setGameMessage(message) {
        this.gameMessage = message;
    }

    nextTurn() {
        this.turn = this.turn == 0 ? 1 : 0;
    }
}

function checkWinning(c1, c2) {
    switch(c1) {
        case 'ROCK':
            return c2 === 'SCISSORS';
        case 'PAPER':
            return c2 === 'ROCK'
        case 'SCISSORS':
            return c2 === 'PAPER'
        default:
            return null;
    }
}

function rpsEmoji(choice) {
    return {'ROCK': '🗿', 'PAPER': '📜', 'SCISSORS': '✂'}[choice];
}
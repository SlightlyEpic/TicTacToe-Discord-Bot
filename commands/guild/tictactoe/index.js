const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
    name: "tictactoe",
    desc: "Starts a game of tic tac toe with another player",
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
            .setCustomId(`tictactoe-0-0-0-${challenger.id}`)
            .setLabel('Player 1')
            .setStyle('PRIMARY')
            .setDisabled(true),
            new MessageButton()
            .setCustomId('tictactoe-0-1-0-')
            .setLabel(challenger.username)
            .setStyle('PRIMARY')
            .setDisabled(true),
            new MessageButton()
            .setCustomId('tictactoe-0-2-0-')
            .setLabel('READY')
            .setStyle('SUCCESS')
            .setDisabled(false)
        ]);

        let waitingRow2 = new MessageActionRow()
        .addComponents([
            new MessageButton()
            .setCustomId(`tictactoe-0-0-1-${opponent.id}`)
            .setLabel('Player 2')
            .setStyle('PRIMARY')
            .setDisabled(true),
            new MessageButton()
            .setCustomId('tictactoe-0-1-1-')
            .setLabel(opponent.username)
            .setStyle('PRIMARY')
            .setDisabled(true),
            new MessageButton()
            .setCustomId('tictactoe-0-2-1-')
            .setLabel('WAITING')
            .setStyle('DANGER')
            .setDisabled(false)
        ]);

        let match = new Match(challenger, opponent, interaction)
        
        interaction.editReply({ content: `${opponent.toString()} has 60s to join the match`, components: [waitingRow1, waitingRow2] });
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
        await interaction.deferUpdate();

        switch(t) {
            case "0":
                {
                    let m = await interaction.fetchReply();
                    let challengerId = m.components[0].components[0].customId.split('-')[4];
                    let opponentId = m.components[1].components[0].customId.split('-')[4];
                    if(x == "2" && y == "1" && interaction.user.id == opponentId) {
                        let match = data.waiting[challengerId];
                    
                        let newActionRows = m.components;
                        newActionRows[1].components[2].setLabel('READY').setStyle('SUCCESS');
                        match.gameMessage.edit({ content: 'Starting match...', components: newActionRows });
                    
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
                    let m = await interaction.fetchReply();
                    let challengerId = m.components[0].components[1].customId.split('-')[4];
                    let opponentId = m.components[0].components[2].customId.split('-')[4];
                    let match = data.inProgress[challengerId];

                    if(!match) return;

                    let turnUserId = match.turn == 0 ? challengerId : opponentId;
                    let turnSymbol = match.turn == 0 ? '⚪️' : '✖️';
                    let turnStyle = match.turn == 0 ? 'SUCCESS' : 'DANGER'

                    if(interaction.user.id == turnUserId) {
                        let [c, t, x, y] = interaction.customId.split('-');
                        let newActionRows = m.components;
                        newActionRows[y].components[x].setLabel(turnSymbol).setStyle(turnStyle).setDisabled(true);
                        match.board[x][y-1] = match.turn;
                        // Check if game ended
                        //
                        let tu = match.turn;
                        let nullFound = false;
                        for(i = 0; i < 3; i++) {
                            for(j = 0; j < 3; j++) {
                                for(let dx of [-1, 0, 1]) {
                                    for(let dy of [-1, 0, 1]) {
                                        if(dx == 0 && dy == 0) continue;

                                        let curr = match.board[i][j];
                                        if(curr == null) {
                                            nullFound = true;
                                            continue;
                                        }

                                        let up = match.board[i+dx];
                                        if(up) up = up[j+dy]

                                        let down = match.board[i-dx];
                                        if(down) down = down[j-dy]

                                        if(curr == up && curr == down) {
                                            return match.endMatch(curr, newActionRows, challengerId, opponentId);
                                        }
                                    } 
                                }
                            }
                        }
                        if(!nullFound) match.drawMatch(newActionRows, challengerId, opponentId);
                        //
                        // if it didnt end
                        match.gameMessage.edit({ components: newActionRows });
                        match.nextTurn();
                    }
                }
                break;
        }
    },
}

async function startMatch (match) {
    let playRow1 = new MessageActionRow()
    .addComponents([
        new MessageButton()
        .setCustomId('tictactoe-1-0-0')
        .setLabel('WINNER')
        .setStyle('PRIMARY')
        .setDisabled(true),
        new MessageButton()
        .setCustomId(`tictactoe-1-1-0-${match.challenger.id}`)
        .setLabel(`${match.challenger.username} ⚪️`)
        .setStyle('SECONDARY')
        .setDisabled(true),
        new MessageButton()
        .setCustomId(`tictactoe-1-2-0-${match.opponent.id}`)
        .setLabel(`${match.opponent.username} ✖️`)
        .setStyle('SECONDARY')
        .setDisabled(true)
    ]);

    let playRow2 = new MessageActionRow()
    .addComponents([
        new MessageButton()
        .setCustomId('tictactoe-1-0-1')
        .setLabel('_')
        .setStyle('PRIMARY'),
        new MessageButton()
        .setCustomId('tictactoe-1-1-1')
        .setLabel('_')
        .setStyle('PRIMARY'),
        new MessageButton()
        .setCustomId('tictactoe-1-2-1')
        .setLabel('_')
        .setStyle('PRIMARY')
    ])

    let playRow3 = new MessageActionRow()
    .addComponents([
        new MessageButton()
        .setCustomId('tictactoe-1-0-2')
        .setLabel('_')
        .setStyle('PRIMARY'),
        new MessageButton()
        .setCustomId('tictactoe-1-1-2')
        .setLabel('_')
        .setStyle('PRIMARY'),
        new MessageButton()
        .setCustomId('tictactoe-1-2-2')
        .setLabel('_')
        .setStyle('PRIMARY')
    ])

    let playRow4 = new MessageActionRow()
    .addComponents([
        new MessageButton()
        .setCustomId('tictactoe-1-0-3')
        .setLabel('_')
        .setStyle('PRIMARY'),
        new MessageButton()
        .setCustomId('tictactoe-1-1-3')
        .setLabel('_')
        .setStyle('PRIMARY'),
        new MessageButton()
        .setCustomId('tictactoe-1-2-3')
        .setLabel('_')
        .setStyle('PRIMARY')
    ])

    match.gameMessage.edit({ components: [playRow1, playRow2, playRow3, playRow4] });
}

let data = {
    inProgress: {},             // {challenger1Id: Match1, opponent1Id: Match1, ...}
    waiting: {}                 // {challenger1Id: Match1, challenger2Id: Match2, ...}
}

class Match {
    constructor(challenger, opponent, interaction) {
        this.challenger = challenger;
        this.opponent = opponent;
        this.state = 0;              // 0: waiting, 1: in progress, 2: finished
        this.turn = 0;               // 0: challenger, 1: opponent
        this.board = [
            [null, null, null],
            [null, null, null],
            [null, null, null],
        ];
        this.gameMessage = null;
        this.interaction = interaction;
    }

    setGameMessage(message) {
        this.gameMessage = message;
    }

    nextTurn() {
        this.turn = this.turn == 0 ? 1 : 0;
    }

    endMatch(winner, actionRows, challengerId, opponentId) {
        // winner = 0: challenger, winner = 1: opponent
        let winnerId = [challengerId, opponentId][winner];
        actionRows[0].components[winner+1].setStyle(winner == 0 ? 'SUCCESS' : 'DANGER');
        for(let i of [0, 1, 2]) {
            for(let j of [1, 2, 3]) {
                actionRows[j].components[i].setDisabled(true);
            }
        }
        this.gameMessage.edit({ content: `<@${winnerId}> wins!`, components: actionRows });
        delete data.inProgress[challengerId];
        delete data.inProgress[opponentId];
        setTimeout(() => {
            this.gameMessage.delete();
        }, 10000);
    }

    drawMatch(actionRows, challengerId, opponentId) {
        // winner = 0: challenger, winner = 1: opponent
        actionRows[0].components[1].setStyle('SUCCESS');
        actionRows[0].components[2].setStyle('DANGER');
        for(let i of [0, 1, 2]) {
            for(let j of [1, 2, 3]) {
                actionRows[j].components[i].setDisabled(true);
            }
        }
        this.gameMessage.edit({ content: 'Game drawn!', components: actionRows });
        delete data.inProgress[challengerId];
        delete data.inProgress[opponentId];
        setTimeout(() => {
            this.gameMessage.delete();
        }, 10000);
    }
}

function getButton(message, x, y) {
    return message.components[y]?.components[x]
}
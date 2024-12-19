const suits = ['heart', 'diamond', 'club', 'spade'];
        const values = [
            { rank: 'A', score: 11 },
            { rank: '2', score: 2 },
            { rank: '3', score: 3 },
            { rank: '4', score: 4 },
            { rank: '5', score: 5 },
            { rank: '6', score: 6 },
            { rank: '7', score: 7 },
            { rank: '8', score: 8 },
            { rank: '9', score: 9 },
            { rank: '10', score: 10 },
            { rank: 'J', score: 10 },
            { rank: 'Q', score: 10 },
            { rank: 'K', score: 10 }
        ];

        let deck = [];
        let players = [];
        let gameLog = [];
        let replayData = [];
        let numGames = 1;
        let currentPlayerIndex = 0;
        let currentGameRound = 1;

        function createDeck() {
            deck = [];
            for (const suit of suits) {
                for (const value of values) {
                    deck.push({ suit, rank: value.rank, score: value.score });
                }
            }
            shuffleDeck();
        }

        function shuffleDeck() {
            for (let i = deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [deck[i], deck[j]] = [deck[j], deck[i]];
            }
        }

        function dealCards() {
            players.forEach(player => {
                player.hand = [];
                for (let i = 0; i < 5; i++) {
                    player.hand.push(deck.pop());
                }
            });
        }

        function calculateScore(hand) {
            const suitScores = {};
            hand.forEach(card => {
                let cardValue = card.score;
                if (card.rank === 'A') {
                    const currentSuitScore = suitScores[card.suit] || 0;
                    cardValue = currentSuitScore + 11 > 21 ? 1 : 11;
                }
                suitScores[card.suit] = (suitScores[card.suit] || 0) + cardValue;
            });
            return Math.max(...Object.values(suitScores));
        }

        function updateUI() {
            const playersDiv = document.getElementById('players');
            playersDiv.innerHTML = '';

            players.forEach((player, index) => {
                const playerDiv = document.createElement('div');
                playerDiv.classList.add('player');
                playerDiv.innerHTML = `<h3>${player.name} (Score: ${player.score}) Wins: ${player.wins || 0}</h3>`;

                const handDiv = document.createElement('div');
                handDiv.classList.add('hand');
                player.hand.forEach(card => {
                    const cardDiv = document.createElement('div');
                    cardDiv.style.background='lightgray';
                    cardDiv.classList.add('card');
                    if (currentPlayerIndex === index && player.name.toLowerCase() !== 'computer') {
                       // cardDiv.innerText = `${card.rank} ${card.suit}`;
                       cardDiv.innerHTML+=`<img src='assets/cards/${card.suit}-${card.rank}.png' height='100' width='70' >`;
                        cardDiv.addEventListener('click', () => {
                            if (currentPlayerIndex === index) {
                                swapCard(player, card);
                            }
                        });
                    } else {
                        cardDiv.classList.add('disabled');
                       // cardDiv.innerText = `${card.rank} ${card.suit}`;
                       cardDiv.innerHTML+=`<img src='assets/cards/${card.suit}-${card.rank}.png' height='100' width='70' >`;

                    }
                    handDiv.appendChild(cardDiv);
                });
                playerDiv.appendChild(handDiv);
                playersDiv.appendChild(playerDiv);
            });

            document.getElementById('currentTurn').innerText = `Current Turn: ${players[currentPlayerIndex].name}`;
        }

        function addLog(message) {
            gameLog.push(message);
            const logDiv = document.getElementById('gameLog');
            logDiv.innerHTML = gameLog.join('<br>');
            logDiv.scrollTop = logDiv.scrollHeight;
        }

        function swapCard(player, card) {
            const index = player.hand.indexOf(card);
            if (index > -1) {
                const newCard = deck.pop();
                player.hand.splice(index, 1, newCard);
                addLog(`${player.name}: swapped ${card.rank} ${card.suit} with ${newCard.rank} ${newCard.suit}`);
                player.score = calculateScore(player.hand);
                checkWinner(player);
                if (player.score !== 21) {
                    nextPlayer();
                }
                updateUI();
            }
        }

        function checkWinner(player) {
            if (player.score === 21) {
                player.wins = (player.wins || 0) + 1;
                alert(`${player.name} wins this round!`);
                saveReplayData();
                if (currentGameRound < numGames) {
                    currentGameRound++;
                    resetRound(player);
                } else {
                    displaySummary();
                }
            }
        }

        function displaySummary() {
            const summarySection = document.getElementById('summarySection');
            const playerSummary = document.getElementById('playerSummary');
            const overallWinner = document.getElementById('overallWinner');

            let maxWins = Math.max(...players.map(p => p.wins || 0));
            let winners = players.filter(p => (p.wins || 0) === maxWins);

            playerSummary.innerHTML = players
                .map(p => `<p>${p.name}: ${p.wins || 0} wins</p>`)
                .join('');

            if (winners.length === 1) {
                overallWinner.innerText = `Overall Winner: ${winners[0].name}`;
            } else {
                overallWinner.innerText = `No clear winner. Players with maximum wins: ${winners.map(w => w.name).join(', ')}`;
            }

            summarySection.style.display = 'block';
            document.getElementById('game').style.display = 'none';
        }

        function playRound() {
            if (players[currentPlayerIndex].name.toLowerCase() === 'computer') {
                const player = players[currentPlayerIndex];
                let minScoreCard = player.hand.reduce((minCard, card) => card.score < minCard.score ? card : minCard);
                swapCard(player, minScoreCard);
            }
        }

        function nextPlayer() {
            currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
            if (players[currentPlayerIndex].name.toLowerCase() === 'computer') {
                playRound();
            }
        }

        function resetRound(winner) {
            saveReplayData();
            createDeck();
            dealCards();
            players.forEach(player => {
                player.score = calculateScore(player.hand);
            });
            currentPlayerIndex = players.indexOf(winner);
            document.getElementById('gameRound').innerText = `Game Round ${currentGameRound}`;
            updateUI();
        }

        function saveReplayData() {
            replayData.push({
                round: currentGameRound,
                players: JSON.parse(JSON.stringify(players)),
                log: [...gameLog]
            });
            gameLog = [];
        }

        function showReplaySection() {
            const replaySection = document.getElementById('replaySection');
            const replayGames = document.getElementById('replayGames');
            replaySection.style.display = 'block';
            replayGames.innerHTML = '';

            replayData.forEach((data, index) => {
                const roundDiv = document.createElement('div');
                roundDiv.classList.add('replay-game');
                roundDiv.innerHTML = `<h3>Game Round ${data.round}</h3>`;
                const logDiv = document.createElement('div');
                logDiv.innerHTML = data.log.join('<br>');
                roundDiv.appendChild(logDiv);
                replayGames.appendChild(roundDiv);
            });
        }

        function toggleReplay() {
            const replaySection = document.getElementById('replaySection');
            const isReplayVisible = replaySection.style.display === 'block';
            if (!isReplayVisible) {
                showReplaySection();
            } else {
                replaySection.style.display = 'none';
            }
        }

        document.getElementById('numPlayers').addEventListener('change', () => {
            const numPlayers = document.getElementById('numPlayers').value;
            const playerNamesDiv = document.getElementById('playerNames');
            playerNamesDiv.innerHTML = '';
            for (let i = 1; i <= numPlayers; i++) {
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = `Player ${i} Name`;
                input.id = `player${i}`;
                playerNamesDiv.appendChild(input);
            }
        });

        document.getElementById('startGame').addEventListener('click', () => {
            const numPlayers = document.getElementById('numPlayers').value;
            numGames = document.getElementById('numGames').value;

            players = [];
            replayData = [];
            for (let i = 1; i <= numPlayers; i++) {
                const playerName = document.getElementById(`player${i}`).value || `Player ${i}`;
                players.push({
                    name: playerName,
                    hand: [],
                    score: 0,
                    wins: 0
                });
            }
            createDeck();
            dealCards();
            players.forEach(player => {
                player.score = calculateScore(player.hand);
            });
            currentPlayerIndex = 0;
            updateUI();
            document.getElementById('setup').style.display = 'none';
            document.getElementById('game').style.display = 'block';
            if (players[currentPlayerIndex].name.toLowerCase() === 'computer') {
                playRound();
            }
        });

        document.getElementById('playAgain').addEventListener('click', () => {
    // Reset game variables
    players = [];
    replayData = [];
    gameLog = [];
    currentPlayerIndex = 0;
    currentGameRound = 1;

    // Reset UI
    document.getElementById('setup').style.display = 'block';
    document.getElementById('game').style.display = 'none';
    document.getElementById('summarySection').style.display = 'none';
    document.getElementById('replaySection').style.display = 'none';
    // Clear setup inputs
    document.getElementById('numPlayers').value = '';
    document.getElementById('numGames').value = '';
    document.getElementById('playerNames').innerHTML = '';
});

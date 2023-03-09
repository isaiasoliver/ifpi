import net from 'net';

type Room = {
    player1?: net.Socket;
    player2?: net.Socket;
};

const rooms: Room[] = [];

const score = {
    'X': {
        points: 0,
    },
    'O': {
        points: 0,
    },
}


const initialBoard = [
    ['[-]', '[-]', '[-]'],
    ['[-]', '[-]', '[-]'],
    ['[-]', '[-]', '[-]']
];


function notifyAllPlayer(message: string, sockets: net.Socket[]) {
    sockets.forEach(socket => socket.write(`${message}\n`))
}

function checkStatusOfBoard(board: string[][]) {

    for (let line = 0; line < 3; line++) {
        if (board[line][0] !== '[-]' && board[line][0] === board[line][1] && board[line][1] === board[line][2]) {
            return board[line][0];
        }
    }
    for (let coluna = 0; coluna < 3; coluna++) {
        if (board[0][coluna] !== '[-]' && board[0][coluna] === board[1][coluna] && board[1][coluna] === board[2][coluna]) {
            return board[0][coluna];
        }
    }


    if (board[0][0] !== '[-]' && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
        return board[0][0];
    }
    if (board[0][2] !== '[-]' && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
        return board[0][2];
    }


    if (!board.flat().includes('[-]')) {
        return 'EMPATE';
    }

    return null;
}



function showStatusOfGame(player1: net.Socket, player2: net.Socket, currentPlayer: string, board: string[][]) {
    notifyAllPlayer(`Board:\n${board[0]}\n${board[1]}\n${board[2]}`, [player1, player2])
    notifyAllPlayer(`atual jogador - ${currentPlayer}`, [player1, player2])
    let win: string | null = checkStatusOfBoard(board);
    if (win) {
        if (win === '[X]') {
            score['X'].points++;
            notifyAllPlayer(`Vencerdor X`, [player1, player2])
        } else if (win === '[O]') {
            score['O'].points++;
            notifyAllPlayer(`Vencerdor O`, [player1, player2])
        }

        notifyAllPlayer(`Pontuação: ${JSON.stringify(score)}`, [player1, player2])

        player1.end();
        player2.end();
    }

}

function startGamer(player1: net.Socket, player2: net.Socket) {
    const board = [
        ['[-]', '[-]', '[-]'],
        ['[-]', '[-]', '[-]'],
        ['[-]', '[-]', '[-]']
    ];

    let currentPlayer = 'X';


    player1.on('data', (data) => {
        const mensagem = data.toString();

        const [line, coluna] = mensagem.split(':').map(Number);

        if (board[line][coluna] === '[-]') {
            board[line][coluna] = `[${currentPlayer}]`;

            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        }

        showStatusOfGame(player1, player2, currentPlayer, board);
    });


    player2.on('data', (data) => {

        const mensagem = data.toString();

        const [line, coluna] = mensagem.split(':').map(Number);

        if (board[line][coluna] === '[-]') {
            board[line][coluna] = `[${currentPlayer}]`;
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        }


        showStatusOfGame(player1, player2, currentPlayer, board);
    });
}


const server = net.createServer((socket) => {
    let joinedRoom = false;

    for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i];

        if (!room.player1) {
            room.player1 = socket;
            socket.write('Esperando por um oponente...\n');
            joinedRoom = true;
            break;
        } else if (!room.player2) {
            room.player2 = socket;
            joinedRoom = true;
            startGamer(room.player1, room.player2);
            break;
        }
    }

    if (!joinedRoom) {
        const room = { player1: socket };
        rooms.push(room);
        socket.write('Esperando por um oponente...\n');
    }

    const verifyIfHasPlayerInLastRoom = rooms[rooms.length - 1].player1 && rooms[rooms.length - 1].player2;

    if (verifyIfHasPlayerInLastRoom) {
        rooms.push({});

        const player1 = rooms[rooms.length - 2].player1
        const player2 = rooms[rooms.length - 2].player2

        if (player1 && player2) {
            const players = [player1, player2]

            notifyAllPlayer(`Oponente encontrado! \n`, players)

            notifyAllPlayer(`Board:\n${initialBoard[0]}\n${initialBoard[1]}\n${initialBoard[2]} \n`, players);



            notifyAllPlayer('Dica: insira um coluna e uma linha -> exemplo: 1:2 \n', players);

            player1.write('Você será o X! \n');

            player2.write('Você sera o O! \n');

            notifyAllPlayer('O X deve iniciar', players)


        }

    }

    socket.on('end', () => {
        rooms.forEach(room => {
            room.player1?.end()
            room.player2?.end()
        })
    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
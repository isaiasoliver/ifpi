import net from 'net';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() // instancio o prima -> é um orm

let room: net.Socket[] = [];
let fullRoom = false;


const server = net.createServer((socket: net.Socket) => {
    if (fullRoom) { //verifico se a sala tá cheia
        socket.write("Sala cheia, tente novamente mais tarde")
        socket.end();
        return;
    }

    room.push(socket); // add o player na sala

    if (room.length == 2) { // se tiver 2 jogadores, inicio a partida
        fullRoom = true;
        room.forEach(player => { //aviso os dois que ira iniciar a partida
            player.write("O jogo irá começar, boa sorte!")
        })

        startGamer(room[0], room[1]);

    } else if (room.length == 1) {
        room[0].write("Aguarde outro jogador") //informe que só há um player quando só tiver 1 usuario

    }


});


function notifyAllPlayer(message: string, sockets: net.Socket[]) { //envia mensagem para todos os room na sala
    sockets.forEach(socket => socket.write(`${message}\n`))
}

function checkStatusOfBoard(board: string[][]) { //verifica o status do jogo da velha

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

async function showStatusOfGame(player1: net.Socket, player2: net.Socket, currentPlayer: string, board: string[][]) { //fica verificando se houve vitoria ou quem é o proximo a jogar
    notifyAllPlayer(`Board:\n${board[0]}\n${board[1]}\n${board[2]}`, [player1, player2]) // exibo o board para todos os room
    notifyAllPlayer(`atual jogador - ${currentPlayer}`, [player1, player2])     // mostro o atual jogador a jogar 
    let win: string | null = checkStatusOfBoard(board); // verifico se houve vitoria
    if (win) {
        if (win === '[X]') { //vejo se quem venceu foi o X
            await setScore('X');
            notifyAllPlayer(`Vencerdor X`, [player1, player2])  // Aviso ambos os room o vencedo
        } else if (win === '[O]') { //vejo se quem venceu foi o O
            await setScore('O')
            notifyAllPlayer(`Vencerdor O`, [player1, player2]) // Aviso ambos os room o vencedo
        }
        const score = await getScore(); //pego os scores

        notifyAllPlayer(`Pontuação: ${JSON.stringify(score)}`, [player1, player2]) // mostra a pontuação

        player1.end(); // finaliza a partida
        player2.end();
        room = [] // esvazio a sala
        fullRoom = false; // abro a sala para novos players
    }

}

function startGamer(player1: net.Socket, player2: net.Socket) {
    const board = [
        ['[-]', '[-]', '[-]'],
        ['[-]', '[-]', '[-]'],
        ['[-]', '[-]', '[-]']
    ];

    let currentPlayer = 'X';

    notifyAllPlayer(`\n${board[0]}\n${board[1]}\n${board[2]}`, [player1, player2]); // mostro o board para todos
    notifyAllPlayer(`nEscolha uma coluna e uma linha -> exemplo: 0:2 `, [player1, player2]); // mostro como se joga

    player1.write("Você vai iniciar a partida\n Vocë será o 'X'"); //informo apenas o player 1
    player2.write("O X irá iniciar\n Vocë será o 'O'\n "); //informo apenas o player 2

    player1.on('data', (data) => { //pega todos os dados de entrada do jogador 1
        const mensagem = data.toString();

        const [line, coluna] = mensagem.split(':').map(Number); // pego a linha e a coluna

        if (board[line][coluna] === '[-]') { //verifico se é um espaço em branco
            board[line][coluna] = `[${currentPlayer}]`;// add x ou o na posição

            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';  //mudo de player
        }

        //passa os dois player, o atual player a jogar e o quadro
        showStatusOfGame(player1, player2, currentPlayer, board);
    });


    player2.on('data', (data) => { //pega todos os dados enviados do jogador 2 e repete a função 1

        const mensagem = data.toString();

        const [line, coluna] = mensagem.split(':').map(Number);

        if (board[line][coluna] === '[-]') {
            board[line][coluna] = `[${currentPlayer}]`;
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        }


        showStatusOfGame(player1, player2, currentPlayer, board);
    });
}


async function setScore(win: string) { //funcao para armazenar o score

    await prisma.history.create({
        data: {
            win: win
        }
    });
}

async function getScore() { //funcao para pegar o score
    return await prisma.history.findMany()
}


server.listen(3000, () => {
    console.log('Server running on port 3000');
});
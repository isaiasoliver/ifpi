import net from 'net'; //blibioteca que ele passou
import readline from 'readline'; //biblioteca nativa do node para ler e escrever no terminal

const PORT = 3000;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
}); 

const client = net.createConnection({ port: PORT }, () => { //crio um servidor
    console.log('connecting in server.');
    rl.on('line', (data) => { //pega o valor escrito e manda para o servidor
        client.write(`${data}`);
    });
});

client.on('data', (data) => {
    const message = data.toString().trim(); //recupera todas as mensagens enviadas do servidor
    console.log(message);
});

client.on('end', () => {
    console.log('Desconectado do servidor.'); 
});
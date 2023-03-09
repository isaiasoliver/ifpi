import net from 'net';
import readline from 'readline';

const PORT = 3000;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const client = net.createConnection({ port: PORT }, () => {
    console.log('connecting in server.');
    rl.on('line', (data) => {
        client.write(`${data}`);
    });
});

client.on('data', (data) => {
    const message = data.toString().trim();
    console.log(message);
});

client.on('end', () => {
    console.log('Desconectado do servidor.');
});

const io = require("socket.io-client")
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin,  output: process.stdout });

// write your code here
  let UserName = ''
  let socket 

  rl.question('What is your Name ? ', (userName) => {
    UserName = userName
    socket = io.connect('http://localhost:3000');
    socket.on("playGame", (msg) => { playGame(msg) } )
    socket.on('disconnect',() => { console.log ("Connection lost...") });
    socket.on('connect', () => { playGame('Successfully connected to server') });
});

let playGame = (msg) => {
  console.log(msg)
      rl.question('(R)ock, (P)aper or (S)cissors? ', (answer) => {
       guess = answer.toLowerCase() == 'p' ? 'paper' :  
                answer.toLowerCase() == 'r' ? 'rock' :
                answer.toLowerCase() == 's' ? 'scissors' :
                'invalid choice' 
         
        console.log( `You chose ${guess}`);
        if ( guess !== 'invalid choice'){
          socket.emit("playGame", ([UserName, guess]))
          console.log('Waiting for response')
        } else playGame('Play again')
      })
}

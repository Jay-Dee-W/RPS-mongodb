var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

const { MongoClient } = require("mongodb");
const uri = "mongodb+srv://jdwilson:pnPlNTU8ySzkCiCV@cluster0.o9urf.mongodb.net/?retryWrites=true&w=majority";;
const client = new MongoClient(uri);
const database = 'RPSGame';
const collection = 'results';
const gameResults = {
  'rock': { lose: 'paper' },
  'scissors': { lose: 'rock' },
  'paper': { lose: 'scissors' }
}

let leaderBoard = {}
let game = []

async function writeToDb() {
    client.db(database).collection(collection).insertOne({game})
}
async function updateLeaderBoard(updates){
  const query = { name: 'leaderboard'}
  const update = { $set: {value: updates  } };
    client.db(database).collection(collection).updateOne(query, update, function(err, _) {
      if (err) throw err;
    });
    await sendResults()
}
async function findLeaderBoard() {
  const query = { name: 'leaderboard'};
     client.db(database).collection(collection).findOne(query, async function(err, result) {
      if (err) throw err;
      game.forEach(player => {
        if (result.value.hasOwnProperty( player.Name) ) { 
          result.value[player.Name][player.result] +=1 
        } else {
          result.value[player.Name] =  {'win': 0, 'loss': 0, 'draw': 0} 
          result.value[player.Name][player.result] +=1 
        }
      });
      leaderBoard = result.value
     await updateLeaderBoard(result.value)
    });
}

async function sendResults() {
  let displayBoard = []
  for (let player in leaderBoard){
    displayBoard.push([player , leaderBoard[player]['win'] - leaderBoard[player]['loss'] ,  leaderBoard[player]['win'] + leaderBoard[player]['loss'] + leaderBoard[player]['draw'] ,leaderBoard[player]])
  }
  let sortedBoard =  displayBoard.sort( (a,b) => b[1]-a[1]).sort(function(a, b) {
    if (a[1] === b[1]) {
      return a[2] - b[2];
    }
  });
  board = []
  sortedBoard.forEach( player => {
   board.push( ` ${player[0]} : ${player[1]} points ${JSON.stringify(player[3])}\n` )
  })
  player1 = game[0]
  player2 = game[1]
  await io.to(player1.playerid).emit( 'playGame', ` ${player2.Name} chose ${player2.guess} - You ${ player1.result === 'win' ? ' Win :-)' : player1.result == 'loss' ? ' Lose :-(' : ' Draw :-|' }\n ------ Leaderboard ------ \n ${board.join(' ')} \n-------------------------\n ` ) 
  await io.to(player2.playerid).emit( 'playGame', ` ${player1.Name} chose ${player1.guess} - You ${player2.result  === 'win' ? ' Win :-)' : player1.result == 'loss' ? ' Lose :-(' : ' Draw :-|' }\n ------ Leaderboard ------ \n ${board} \n-------------------------\n` ) 
  game = []
}

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    let eventName = 'playGame';
    socket.on(eventName, async (msg) => {
        game.push({playerid: socket.id, Name: msg[0], guess: msg[1] ,result: undefined})
        if ( game.length == 2 ){
          player1 = game[0]
          player2 = game[1]
          player1.result = player1.guess === player2.guess ?  'draw' : gameResults[player1.guess]['lose'] == player2.guess ? "loss" : "win"
          player2.result = player1.guess === player2.guess ?  'draw' : gameResults[player2.guess]['lose'] == player1.guess ? "loss" : "win"
          await writeToDb()
          await findLeaderBoard()

        }
    });
});

http.listen(3000, async() => {
    console.log('listening on *:3000');
    await client.connect();
});


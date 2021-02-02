const { MongoClient } = require("mongodb");
const uri = "mongodb+srv://jdwilson:pnPlNTU8ySzkCiCV@cluster0.o9urf.mongodb.net/?retryWrites=true&w=majority";;
const client = new MongoClient(uri);
const database = 'RPSGame';
const collection = 'results';


async function test(){
  try {
    await client.connect();
    let leaderboard = client.db(database).collection(collection).find({'name': 'leaderboard'})
    leaderboard.forEach(element =>{
      console.log(element.JD)
    } )

  } finally {
    await client.close() 
  }
}

test().catch(err => console.log(err))
/*

async function updateLeaderBoard(updates) {
  //let updatedDocument
  try {
    await client.connect();

    const query = { "name": "leaderboard" };

    const update = {"$set": JD : $inc: {win:1} } };
    
    const options = { returnNewDocument: true };
   
    return client.db(database).collection(collection).findOneAndUpdate(query, update, options) 
    .then(updatedDocument => {
      if(updatedDocument) {
        console.log(`Successfully updated document: ${updatedDocument}.`)
      } else {
        console.log("No document matches the provided query.")
      }
      return updatedDocument.value
    })
    
  } finally {
    await client.close();
  }
}

// async function updateLeaderBoard() {
//   let updates = game
//    let output = (await updateDatabase(updates) )
//   console.log( output )
// }

updateLeaderBoard() 
*/


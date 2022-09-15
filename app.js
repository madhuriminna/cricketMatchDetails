const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();
app.use(express.json());
let db = null;
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DataBase Error:${e.massage}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const result = `select * from player_details;`;
  const result1 = await db.all(result);
  response.send(result1);
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const result = `
    select * from player_details
    where player_id=${playerId};`;
  const result1 = await db.get(result);
  response.send(result1);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const updatedData = request.body;
  const { playerName } = updatedData;
  const result = `
   update player_details set player_name='${playerName}'
   where player_id=${playerId};`;
  await db.run(result);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const result = `
    select * from match_details
    where match_id=${matchId};`;
  const result1 = await db.get(result);
  response.send(result1);
});

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const result = `
    select match_details.match_id,
    match_details.match,
    match_details.year from match_details inner join player_match_score
    where player_match_score.player_id=${playerId};`;
  const result1 = await db.all(result);
  response.send(result1);
});

app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const result = `
 select player_details.player_id,player_details.player_name
 from player_details inner join player_match_score
 where
 player_match_score.match_id=${matchId};`;
  const result1 = await db.all(result);
  response.send(result1);
});

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const result = `
    select player_details.player_id as playerId,player_name as playerName,sum(score) as totalScore,
    sum(fours) as totalFours,sum(sixes) as totalSixes from player_details inner join  player_match_score
    where
    player_match_score.player_id=${playerId};`;
  const result1 = await db.get(result);
  response.send(result1);
});

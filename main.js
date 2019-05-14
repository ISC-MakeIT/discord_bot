// import modules
require("dotenv").config();
const path = require("path");
const fastify = require("fastify")();
const DBConnection = require("./modules/DBConnection");
const DiscordHandler = require("./modules/DiscordHandler");

// init constant value
const TOKEN = process.env.TOKEN;
const OWNER = process.env.OWNER;
const COMMAND_DIRECTORY = path.join(__dirname, "commands");
const DB_DIRECTORY = path.join(__dirname, process.env.DBPATH);

// main logic
console.log("starting bot...");

const dbConnection = new DBConnection(DB_DIRECTORY);
const discordHandler = new DiscordHandler(OWNER, dbConnection);

Promise.resolve()
.then(() => discordHandler.registEventHandring())
.then(() => discordHandler.registCommands(COMMAND_DIRECTORY))
.then(() => discordHandler.login(TOKEN))
.then(() => discordHandler.registEmojiEvents());

console.log("bot is onlined");



// bot server heartbeat from webcron
fastify.get("/", async (req, res) => {
	res.type("application/json",).code(200);
	return { status:"live" };
});

fastify.listen(3000, (err, address) => {
	if (err) throw err
	fastify.log.info(`server listening on ${address}`)
  })

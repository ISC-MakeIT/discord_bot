// import modules
const path = require("path");
const discord = require("discord.js-commando");
const fastify = require("fastify");

// init constant value
const TOKEN = process.env.TOKEN;
const COMMAND_DIRECTORY = "commands";

// init instance
const CLIENT = new discord.Client({
	owner: "204306814139891712"
});	

// define functiond
const registHandring = (client) => {
	client
	.on('error', console.error)
	.on('warn', console.warn)
	.on('debug', console.log)
	.on('ready', () => {
		console.log(`Client ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
	})
	.on('disconnect', () => { console.warn('Disconnected!'); })
	.on('reconnecting', () => { console.warn('Reconnecting...'); })
};

const registCommands = (client, direcotry) => {
	client.registry
	.registerDefaultTypes()
	.registerGroups([
		["git", "GitHub commands"],
		["discord", "Discord Util Commands"],
		["util", "defualt util commands"]
	])
	.registerCommandsIn(path.join(__dirname, direcotry))
	.registerDefaultCommands({
		help: true,
		prefix: false,
		eval: false,
		ping: false,
		commandState: false
	});
};

// main logic

console.log("starting bot...");

registHandring(CLIENT);

registCommands(CLIENT, COMMAND_DIRECTORY);

CLIENT.login(TOKEN);

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

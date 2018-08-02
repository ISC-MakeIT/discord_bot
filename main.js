// import modules
const discord = require("discord.js-commando");
const path = require("path");

// init constant value
const TOKEN = process.env.TOKEN;
const COMMAND_DIRECTORY = "commands";

// init instance
const CLIENT = new discord.Client({
	owner: "204306814139891712"
});	

// define functiond

const registCommands = (client, direcotry) => {
	client.registry
	// Registers your custom command groups
	.registerGroups([
		["git", "GitHub commands"],
		["discord", "Discord Util Commands"]
	])
	// Registers all built-in groups, commands, and argument types
	.registerDefaults()
	// Registers all of your commands in the ./commands/ directory
	.registerCommandsIn(path.join(__dirname, direcotry));
};

// main logic

console.log("starting bot...");

registCommands(CLIENT, COMMAND_DIRECTORY);

CLIENT.login(TOKEN);

console.log("bot is onlined");

const discord = require("discord.js-commando");
const EmojiController = require("./EmojiController");

const reactionEvents = {
    MESSAGE_REACTION_ADD: 'messageReactionAdd',
    MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
};

class DiscordHandler {
	constructor (owner, dbConnection) {
		this.client = new discord.Client({
			owner: owner
		});
		this.dbConnection = dbConnection;
		this.emojiController = new EmojiController(this.client, this.dbConnection);
	}

	async registEventHandring () {
		this.client
		.on('error', console.error)
		.on('warn', console.warn)
		.on('debug', console.log)
		.on('ready', () => {
			console.log(`Client ready; logged in as ${this.client.user.username}#${this.client.user.discriminator} (${this.client.user.id})`);
		})
		.on('disconnect', () => { console.warn('Disconnected!'); })
		.on('reconnecting', () => { console.warn('Reconnecting...'); });
	};

	async registCommands (directory) {
		this.client.registry
		.registerDefaultTypes()
		.registerGroups([
			["git", "GitHub commands"],
			["discord", "Discord Util Commands"],
			["util", "defualt util commands"]
		])
		.registerCommandsIn(directory)
		.registerDefaultCommands({
			help: true,
			prefix: false,
			eval: false,
			ping: false,
			commandState: false
		});
	};
	
	async registEmojiEvents () {
		this.emojiController.init();
		this.client
		.on("raw", (rawEvent) => this.handleAddReaction(rawEvent))
		.on("emojiCreate", (emoji) => this.emojiController.create(emoji))
		.on("emojiUpdate", (oldEmoji, newEmoji) => this.emojiController.nameChange(oldEmoji, newEmoji))
		.on("messageReactionAdd", (reaction) => this.emojiController.addReaction(reaction))
		.on("message", (message) => this.emojiController.searchEmoji(message));
	}

	async login (TOKEN) {
		await this.client.login(TOKEN);
	};

	async handleAddReaction (rawEvent) {
		if (!reactionEvents.hasOwnProperty(rawEvent.t)) return;
		const { d: data } = rawEvent;
		const user = this.client.users.get(data.user_id);
		const channel = this.client.channels.get(data.channel_id) || await user.createDM();
		if (channel.messages.has(data.message_id)) return;
		const message = await channel.fetchMessage(data.message_id);
		const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
		let reaction = message.reactions.get(emojiKey);
		this.client.emit(reactionEvents[rawEvent.t], reaction, user);
	}
}

module.exports = DiscordHandler;

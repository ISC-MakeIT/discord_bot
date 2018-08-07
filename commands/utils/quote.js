const commando = require("discord.js-commando");
const commonTags = require("common-tags");
const oneLine = commonTags.oneLine;
const stripIndents = commonTags.stripIndents;

let message;

module.exports = class QuoteCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: "quote",
			aliases: ["quote"],
			group: "util",
			memberName: "quote",
			description: "quote old message.",
			details: oneLine`
				This is quote old message.
			`,
			examples: ["!quote [messageId]"],

			args: [
				{
					key: "messageId",
					label: "messageId",
					prompt: "type messageId",
					type: "string"
				}
			]
		});
	}

	async run(msg, args) {
		const guild = msg.guild;
		const textchannels = guild.channels.findAll("type", "text");
		for (const channel of textchannels) {
			let candidate = await channel.fetchMessage(args.messageId)
			.then(mess => {
				return mess;
			})
			.catch((error) => {
				if(error.code === 10008){
					console.error("not found message");
				}
			});
			if (candidate !== undefined) {
				message = candidate;
			}
		}
		console.log(message);
		return msg.reply(message.content);
	}
};

const commando = require("discord.js-commando");
const { RichEmbed } = require("discord.js");
const commonTags = require("common-tags");
const oneLine = commonTags.oneLine;
const stripIndents = commonTags.stripIndents;
const AbortController = require("../../modules/AbortController");

const EmbedQuote = require("../../class/EmbedQuote");

let message;

module.exports = class QuoteCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: "quote",
			aliases: ["quote", "reply"],
			group: "util",
			memberName: "quote",
			description: "quote old message.",
			details: oneLine`
				This is quote and reply old message.
			`,
			examples: [
				"!quote [messageId]",
				"!quote [message URL]",
				"!quote [messageId] [reply message]",
				"!quote [message URL] [reply message]"
			],
			args: [
				{
					key: "messageId",
					label: "messageId",
					prompt: "type messageId or message URL",
					type: "string"
				},
				{
					key: "reply",
					label: "reply",
					default: "NOTHING_REPLY",
					prompt: "type reply",
					type: "string"
				}
			]
		});
	}

	async run(msg, args) {
		let message;
		let messageId;
		let textchannels;
		let reply;
		let embedQuote;

		const guild = msg.guild;

		if (args.messageId.match(/^https?:\/\/discordapp.com\/channels\/(.*)$/)) {
			let regResult = args.messageId.match(/^https?:\/\/discordapp.com\/channels\/(.*)$/)[1].split("/");
			let channelId = regResult[1];
			messageId = regResult[2];
			await guild.channels.find("id", channelId)
			.fetchMessage(messageId)
			.then((data) => {
				message = data;
			})
			.catch(() => {
				return msg.reply("Error: not found message.");
			});
		} else {
			messageId = args.messageId;
			textchannels = guild.channels.filter((channel) => channel.type === "text" ? true : false);

			await Promise.race(textchannels.map((channel) => {
				return new Promise((resolve, reject) => {
					AbortController.setAbort("abort by sygnal", reject);
					channel.fetchMessage(messageId)
					.then((message) => {
						resolve(message);
					})
					.catch(() => {});
				})
			}))
			.then((data) => {
				AbortController.abort();
				message = data;
			});
		}
		if (args.reply === "NOTHING_REPLY") {
			embedQuote = new EmbedQuote(msg, message);
		} else {
			embedQuote = new EmbedQuote(msg, message, args.reply);
		}

		const embedMessage = new RichEmbed()
		.setAuthor(embedQuote.originalUser.name, embedQuote.originalUser.imgUrl)
		.setTitle(embedQuote.title)
		.setColor(embedQuote.color)
		.setDescription(embedQuote.body)
		.setFooter(embedQuote.footer)
		.setTimestamp(embedQuote.date)
		.addField("link", embedQuote.url);

		if (args.reply !== "NOTHING_REPLY") {
			embedMessage
			.addBlankField()
			.addField(`Reply from ${embedQuote.reply.user}`, embedQuote.reply.text)
		}

		console.log(embedMessage);
		
		return msg.say(embedMessage);
	}
};

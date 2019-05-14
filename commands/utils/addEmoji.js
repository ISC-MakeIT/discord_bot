const commando = require("discord.js-commando");
const { RichEmbed } = require("discord.js");
const commonTags = require("common-tags");
const oneLine = commonTags.oneLine;
const stripIndents = commonTags.stripIndents;

module.exports = class AddEmojiCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: "addemoji",
			group: "util",
			memberName: "addemoji",
			description: "add new Emoji.",
			details: oneLine`
				This is add new Emoji from picture / url.
			`,
			examples: [
				"!addEmoji star (with Attach picture)",
			],
			args: [
				{
					key: "label",
					label: "EmojiLabel",
					prompt: "type Emoji Label.",
					type: "string"
				}
			]
		});
	}

	async run(msg, args) {
		const message = msg.message;
		const attachments = message.attachments.array();
		if (args.label.length < 2 || args.label.length > 32) {
			return msg.reply("emoji name is short or long");
		} else if (!args.label.match(/^[A-Za-z0-9]*$/)) {
			return msg.reply("emoji name has not character")
		}
		if (attachments.length === 0) {
			return msg.reply("not attach picture");
		} else if (attachments.length !== 1) {
			return msg.reply("too many attach picture");
		} else {
			msg.guild.createEmoji(attachments[0].url, args.label)
			return msg.reply(`New Emoji Created: ${args.label}`);
		}

		return msg.say(attachments.name);
	}
};

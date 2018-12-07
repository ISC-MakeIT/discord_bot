const createURL = Symbol("createURL");

module.exports = class EmbedQuote {
	constructor(reqMsg, orgMsg, replyMsg) {
		this.title = "Original Post";
		this.body = orgMsg.content;
		this.url = this[createURL](orgMsg);
		this.color = [255, 255, 255];
		this.date = orgMsg.createdAt;
		this.originalUser = {
			name: orgMsg.author.username,
			imgUrl: orgMsg.author.displayAvatarURL
		};
		if (replyMsg === null) {
			this.footer = `request from ${reqMsg.author.username} ${reqMsg.author.id}`;
		} else {
			this.footer = `Date`;
			this.reply = {
				user: reqMsg.author.username,
				text: replyMsg
			};
		}
	}

	[createURL](msg) {
		return `http://discordapp.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id}`;
	};
}

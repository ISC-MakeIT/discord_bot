const initEmojiDB = Symbol("initEmojiDB");

const schedule = require("node-schedule");

const INITSQL = {
	"createGuilds": `
		CREATE TABLE IF NOT EXISTS guilds (
			guild_id TEXT PRIMARY KEY UNIQUE NOT NULL, 
			name TEXT NOT NULL
		);`,
	"createEmojis": `
		CREATE TABLE IF NOT EXISTS emojis (
			guild_id TEXT,
			emoji_id TEXT PRIMARY KEY UNIQUE NOT NULL, 
			name TEXT NOT NULL,
			last_use TEXT,
			FOREIGN KEY(guild_id) REFERENCES guilds(guild_id)
		);`
}

const SQLQUERY = {
	"guild": `
		REPLACE INTO guilds(guild_id, name) 
		VALUES (?, ?);`, 
	"setupEmoji": `
		REPLACE INTO emojis(guild_id, emoji_id, name, last_use) 
		VALUES (?, ?, ?, ( 
			SELECT CASE 
			WHEN last_use IS NOT NULL THEN last_use
			ELSE datetime("now") END last_use_time
			FROM emojis WHERE emoji_id = ?
			UNION ALL 
			SELECT datetime("now") FROM (
				SELECT count(*) AS COUNT 
				FROM (SELECT * FROM emojis LIMIT 1)
			) AS COUNT 
			WHERE COUNT = 0 
			OR NOT EXISTS(
				SELECT * FROM emojis WHERE emoji_id = ?
			)
		))`, 
	"updateTime": `
		UPDATE emojis SET last_use = DATETIME("now")
		WHERE emoji_id = ?;`, 
	"getLastUse": `
		SELECT last_use FROM emojis WHERE emoji_id = ?;`

}

class EmojiController {
	constructor (client, dbConnection) {
		this.client = client;
		this.dbConnection = dbConnection;
		this.jobs = {};
	};

	[initEmojiDB] () {
		Promise.resolve()
		this.dbConnection.run(INITSQL.createGuilds)
		.then(this.dbConnection.run(INITSQL.createEmojis))
		.then(async () => {
			for await (const guild of this.client.guilds.array()) {
				await this.dbConnection.run(SQLQUERY.guild, [guild.id, guild.name]);
				console.log(`init_guild: ${guild.name}:${guild.id} - ${new Date(Date.now())}`);
				for await (const emoji of guild.emojis.array()) {
					console.log(`init_emoji: ${emoji.name}:${emoji.id} - ${new Date(Date.now())}`);
					await this.dbConnection.run(SQLQUERY.setupEmoji, [emoji.guild.id, emoji.id, emoji.name, emoji.id, emoji.id])
					const lastUseTime = await this.dbConnection.get(SQLQUERY.getLastUse, [emoji.id]);
					this.setSchedule(emoji, new Date(`${lastUseTime.last_use}Z`));
				}
			}
		})
	}
	
	init () {
		this[initEmojiDB]();
	};
	
	create (emoji) {
		console.log(`create: ${emoji.name}:${emoji.id} - ${new Date(Date.now())}`);
		Promise.resolve()
		.then(() => this.dbConnection.run(SQLQUERY.setupEmoji, [emoji.guild.id, emoji.id, emoji.name, emoji.id, emoji.id]))
		.then(() => this.dbConnection.run(SQLQUERY.updateTime, [emoji.id]))
		.then(() => this.setSchedule(emoji, new Date()));
	}

	nameChange (oldEmoji, newEmoji) {
		console.log(`update emoji name: ${oldEmoji.name}:${oldEmoji.id} => ${newEmoji.name}:${newEmoji.id} - ${new Date(Date.now())}`);
		Promise.resolve()
		.then(() => this.dbConnection.run(SQLQUERY.setupEmoji, [oldEmoji.guild.id, oldEmoji.id, newEmoji.name, oldEmoji.id, oldEmoji.id]))
		.then(() => this.dbConnection.run(SQLQUERY.updateTime, [oldEmoji.id]))
		.then(() => this.setSchedule(oldEmoji, new Date()));
	};
	
	update (emoji) {
		console.log(`update: ${emoji.name}:${emoji.id} - ${new Date(Date.now())}`);
		Promise.resolve()
		.then(() => this.dbConnection.run(SQLQUERY.updateTime, [emoji.id]))
		.then(() => this.setSchedule(emoji, new Date()));
	};

	addReaction (messageReaction) {
		if (messageReaction.message.guild.emojis.has(messageReaction.emoji.id)) {
			this.update(messageReaction.emoji);
		}
	};

	searchEmoji (message) {
		let emojiArray = [];
		let candidateEmojiArray;
		if (new RegExp(/(<:.*?:\d+>)/g).test(message.content)) {
			candidateEmojiArray = message.content.match(/(<:.*?:\d+>)/g).map(emoji => {
				return emoji.replace("<:", "").replace(">", "").split(":");
			});
			for (const candidateEmoji of candidateEmojiArray) {
				const emojiName = candidateEmoji[0];
				const emojiId = candidateEmoji[1];
				if (message.guild.emojis.has(emojiId)) {
					console.log(`find emoji in message: ${emojiName}:${emojiId} - ${new Date(Date.now())}`);
					emojiArray.push(message.guild.emojis.get(emojiId));
				}
			}
			emojiArray.forEach(emoji => this.update(emoji));
	
		}
	};

	setSchedule (emoji, date) {
		if (this.jobs.hasOwnProperty(emoji.id)) {
			this.jobs[emoji.id].reschedule(this.getAddDay(30, date));
			console.log(`Update Schedule Task. EndDate:${this.jobs[emoji.id].nextInvocation()} - ${new Date()}`);
		} else {
			this.jobs[emoji.id] = schedule.scheduleJob(this.getAddDay(30, date), () => {
					emoji.guild.deleteEmoji(emoji, "removed by expired.");
					delete this.jobs[emoji.id];
					console.log(`Done ${emoji.id} event. - ${new Date()}`);
			});
			console.log(`Add Schedule Task. ID:${emoji.id} Name:${emoji.name} EndDate:${this.jobs[emoji.id].nextInvocation()} - ${new Date()}`);
		}
	}

	removeSchedule (emoji) {
		console.log(`Emoji is Removed. ID:${emoji.id} Name:${emoji.name} - ${new Date()}`);
		if (this.jobs.hasOwnProperty(emoji.id)) {
			this.jobs[emoji.id].cancel();
			delete this.jobs[emoji.id];
			console.log(`Remove Schedule Task. ID:${emoji.id} Name:${emoji.name} - ${new Date()}`)
		}
	}

	getAddDay (n, date) {
		const addMiliSecond = 1000 * 60 * 60 * 24 * n;
		return new Date(date.valueOf() + addMiliSecond);
	}
}

module.exports = EmojiController;

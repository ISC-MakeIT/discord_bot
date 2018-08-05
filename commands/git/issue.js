const commando = require("discord.js-commando");
const { RichEmbed } = require("discord.js");
const githubApi = require("github-api");
const commonTags = require("common-tags");
const oneLine = commonTags.oneLine;
const stripIndents = commonTags.stripIndents;

const EmbedIssue = require("../../class/EmbedIssue");

const github = new githubApi();

let issueInfo;

module.exports = class GitIssueCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: "issue",
			aliases: ["issue"],
			group: "git",
			memberName: "issue",
			description: "show github issue",
			details: oneLine`
				This is show at a github issues.
			`,
			examples: ["!issue [issueNumber]"],

			args: [
				{
					key: "repository",
					label: "user/repository",
					prompt: "type \"user\"/\"repository\"",
					type: "string"
				},
				{
					key: "number",
					label: "issue number",
					prompt: "type issue number.",
					type: "integer",
					infinite: false
				},
			]
		});
	}

	async run(msg, args) {
		const hubUser = args.repository.split("/")[0];
		const hubRepository  =args.repository.split("/")[1];
		const issue = github.getIssues(hubUser, hubRepository);
		issueInfo = await issue.getIssue(args.number)
		.then((info) => {
			return info.data;
		});

		let embedIssue = new EmbedIssue(issueInfo);

		console.log(embedIssue);
		
		const embedMessage = new RichEmbed()
		.setAuthor(embedIssue.author.name, embedIssue.author.imgUrl, embedIssue.author.url)
		.setTitle(embedIssue.title)
		.setURL(embedIssue.url)
		.addField("Description", embedIssue.body)
		.setFooter(embedIssue.state, embedIssue.stateIcon)
		.setColor(embedIssue.stateColor)
		.setTimestamp();

		if (embedIssue.hasbodyImg) {
			embedMessage.setImage(embedIssue.imgBody);
		}
		
		return msg.reply({embed:embedMessage})
	}
};

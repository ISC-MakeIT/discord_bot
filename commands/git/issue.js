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
			examples: [
				"!issue [(MakeIT)repository] [issueNumber]", 
				"!issue [user]/[repository] [issueNumber]", 
				"!issue [issue URL]", 
				"!issue [repostory URL] [issueNumber]"
			],

			args: [
				{
					key: "repository",
					label: "user/repository/URL",
					prompt: "type \"repository\" or \"user\"/\"repository\" or (repository | issue) URL",
					type: "string"
				},
				{
					key: "number",
					label: "issue number",
					default: "NOTHING_NUMBER",
					prompt: "type issue number.",
					type: "integer",
					infinite: false
				},
			]
		});
	}

	async run(msg, args) {
		let hubUser;
		let hubRepository;
		let issueNumber;
		
		if (args.repository.match(/^https?:\/\/github\.com\/(.*)/)) {
			let regResult = args.repository.match(/^https?:\/\/github\.com\/(.+)/)[1].split("/");
			hubUser = regResult[0];
			hubRepository = regResult[1];
			if (args.number === "NOTHING_NUMBER") {
				issueNumber = regResult[3];
			} else {
				issueNumber = args.number;
			}
		} else if (args.repository.match("/")) {
			hubUser = args.repository.split("/")[0];
			hubRepository = args.repository.split("/")[1];
			issueNumber = args.number;
		} else {
			hubUser = "ISC-MakeIT";
			hubRepository = args.repository;
			issueNumber = args.number;
		}
		const issue = github.getIssues(hubUser, hubRepository);
		await issue.getIssue(issueNumber)
		.then((data) => {
			issueInfo = data.data;
			let embedIssue = new EmbedIssue(issueInfo);
		
			const embedMessage = new RichEmbed()
			.setAuthor(embedIssue.author.name, embedIssue.author.imgUrl, embedIssue.author.url)
			.setTitle(embedIssue.title)
			.setColor(embedIssue.stateColor)
			.setURL(embedIssue.url)
			.setDescription(embedIssue.body)
			.setFooter(embedIssue.state, embedIssue.stateIcon)
			.setTimestamp(embedIssue.createDate);
	
			if (embedIssue.hasbodyImg) {
				embedMessage.setImage(embedIssue.imgBody);
			}
	
			console.log(embedMessage);
			
			return msg.reply({embed:embedMessage})
		})
		.catch((err) => {
			return msg.reply("Error: not found issue");
		});
	}
};

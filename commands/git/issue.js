const commando = require("discord.js-commando");
const { RichEmbed } = require("discord.js");
const githubApi = require("github-api");
const commonTags = require("common-tags");
const oneLine = commonTags.oneLine;
const stripIndents = commonTags.stripIndents;

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
					key: "number",
					label: "issue number",
					prompt: "type issue number.",
					type: "integer",
					infinite: false
				}
			]
		});
	}

	async run(msg, args) {
		const issue = github.getIssues("ISC-MakeIT", "f_college_sns");
		issueInfo = await issue.getIssue(args.number)
		.then((info) => {
			return info.data;
		});
		console.log(issueInfo);

		const embedMessage = new RichEmbed()
		.setTitle(issueInfo.title)
		.setURL(issueInfo.url)
		.setAuthor(issueInfo.user.login, issueInfo.user.avatar_url, issueInfo.user.url)
		.addBlankField()
		.setDescription(issueInfo.body)
		.setFooter(issueInfo.state);

		return msg.reply({embed:embedMessage})

		// return msg.reply(stripIndents`\`\`\`
		// ${issueInfo.title}: ${issueInfo.state}
		// ----------------------------------------
		// ${issueInfo.body}
		// \`\`\``);
	}
};

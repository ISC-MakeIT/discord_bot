const getStateIcon = Symbol("getStateIcon");
const hasBodyImage = Symbol("hasBodyImage");
const getBodyImageUrl = Symbol("getBodyImageUrl");

module.exports = class EmbedIssue {
	constructor(issueInfo) {
		this.title = issueInfo.title;
		this.body = issueInfo.body;
		this.url = issueInfo.html_url;
		this.state = issueInfo.state;
		this.stateIcon = this[getStateIcon](this.state);
		this.Author = {
			name: issueInfo.user.login,
			imgUrl: issueInfo.user.avatar_url,
			url: issueInfo.user.url
		};
		if (this[hasBodyImage](this.body)) {
			[this.imgBody, this.body] = this[getBodyImageUrl](this.body);
		}
	}

	[getStateIcon](state) {
		if (state === "open") {
			return "https://cdn.rawgit.com/wh1tecat-nya/BOT_Icon/e1a14d72/issue_opened.png";
		} else if (state === "closed") {
			return "https://cdn.rawgit.com/wh1tecat-nya/BOT_Icon/e1a14d72/issue_closed.png";
		}
	};
	[hasBodyImage](body) {
		const regMdImg = /!\[.*\]\(.*\)/;
		return regMdImg.test(body);
	};
	[getBodyImageUrl](body) {
		const regMdImg = /!\[.*\]\(.*\)/;
		const regImgUrl = /\(.*\)/;
		const imgUrl = body.match(regMdImg)[0].match(regImgUrl)[0].slice(1,-1);
		const newBody = body.replace(regMdImg, "");
		return [imgUrl, newBody];
	};
}

const replaceInvalidBody = Symbol("replaceInvalidBody");
const getStateIcon = Symbol("getStateIcon");
const hasBodyImage = Symbol("hasBodyImage");
const getBodyImageUrl = Symbol("getBodyImageUrl");
const setStatusColor = Symbol("setStatusColor");

module.exports = class EmbedIssue {
	constructor(issueInfo) {
		this.title = issueInfo.title;
		this.body = this[replaceInvalidBody](issueInfo.body);
		this.hasbodyImg = false;
		this.url = issueInfo.html_url;
		this.state = issueInfo.state;
		this.stateIcon = this[getStateIcon](this.state);
		this.stateColor = this[setStatusColor](this.state);
		this.createDate = issueInfo.created_at;
		this.author = {
			name: issueInfo.user.login,
			imgUrl: issueInfo.user.avatar_url,
			url: issueInfo.user.url
		};
		if (this[hasBodyImage](this.body)) {
			this.hasbodyImg = true;
			[this.imgBody, this.body] = this[getBodyImageUrl](this.body);
		}
	}

	[replaceInvalidBody](body) {
		if (body === "") {
			return "No description provided.";
		} else if (body.length >= 1024) {
			return `${body.slice(0, 1021)}...`;
		} else {
			return body;
		}
	};
	
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

	[setStatusColor](state) {
		if (state === "open") {
			return [178, 67, 52];
		} else {
			return [85, 171, 104];
		}
	};
}

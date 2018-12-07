const events = require("events");
const AbortController = new events.EventEmitter;

AbortController.setMaxListeners(100);

AbortController.setAbort = (msg, rejectMethod) => {
	AbortController.on("abort", () => {
		rejectMethod(msg);
	});
}

AbortController.abort = () => {
	AbortController.emit("abort");
	AbortController.removeAllListeners("abort");
}

module.exports = AbortController;

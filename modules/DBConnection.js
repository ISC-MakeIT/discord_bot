const sqlite = require("sqlite3").verbose();

class dbConnection {
	constructor (dbPath) {
		this.db = new sqlite.Database(dbPath);
	};

	run (query, params) {
		return new Promise((resolve, reject) => {
			this.db.run(query, params, (err) => {
				err === null ? resolve("success") : reject(err)
			});
		})
	};

	all (query, params) {
		return new Promise((resolve, reject) => {
			this.db.all(query, params, (err, row) => {
				if (err === null) {
					resolve(row);
				} else {
					reject(err);
				}
			});
		})
	};

	get (query, params) {
		return new Promise((resolve, reject) => {
			this.db.get(query, params, (err, row) => {
				if (err === null) {
					resolve(row);
				} else {
					reject(err);
				}
			});
		})
	};
}

module.exports = dbConnection;

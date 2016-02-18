var config = {}

config.tablestorage = {
	tableName: "cloudracertelemetry",
	accountName: "cloudracerstorage",
	accountKey: "p+RE6nrOJ6kOqxwNNJYOAgJLxq5Y4rmkOooeTKLni09GcQdXrZoq0JDxCJl9zWu4LmZIsskVNJ6qUsTzzmG/Ug=="
}

config.mssql = {
	server: 'cloudracer.database.windows.net',
	database: 'cloudracerdb',
	user: 'dbadmin@cloudracer',
	password: 'cl0udr@c3r',
	options: { encrypt: true }
}

module.exports = config;
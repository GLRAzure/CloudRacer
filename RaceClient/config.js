var config = {}

config.deviceId = 'VID_2341&PID_8036';
config.raceLength = 30000;
config.wheelCirc = 2199; // in mm
config.mmInMi = 1609344;
config.mToMi = 0.00062137;

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

config.eventhub = {
    hubNamespace: "cloudracer",
    hubName: "racetelemetry",
    keyName: "raceowner",
    key: "8w3z+bUOryua0Tc39yePrIALm0xxBy1d0BUCGZ42y0k="
}

module.exports = config;
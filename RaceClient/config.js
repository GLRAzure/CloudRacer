var config = {}

config.deviceId = 'VID_2341&PID_8036';
config.raceLength = 30000;
config.wheelCirc = 2000; // in mm
config.mmInMi = 1609344;

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
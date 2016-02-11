/*
 Name:		CloudRacer_arduino.ino
 Created:	1/31/2016 3:05:30 PM
 Author:	peter
*/

// the setup function runs once when you press reset or power the board
void setup() {
	pinMode(0, INPUT);
	Serial.begin(1000000);
}

// the loop function runs over and over again until power down or reset
void loop() {
	uint32_t rotations = 1;
	int signal = 1;
	uint16_t bpm = 1;
	uint16_t ibi = 1;
	bool pulse = true;
	bool qs = true;

	Serial.print("{ \"time\": ");
	Serial.print(millis(), DEC);
	Serial.print(", \"rotations\": ");
	Serial.print(rotations, DEC);
	Serial.print(", \"signal\": ");
	Serial.print(signal, DEC);
	Serial.print(", \"ibi\": ");
	Serial.print(ibi, DEC);
	Serial.print(", \"bpm\": ");
	Serial.print(bpm, DEC);
	Serial.print(", \"pulse\": ");
	Serial.print(pulse, DEC);
	Serial.print(", \"qs\": ");
	Serial.print(qs, DEC);
	Serial.println("}");
	
	delay(20);
}



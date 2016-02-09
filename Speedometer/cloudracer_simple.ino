const int reedSwitchPin = 7;     // the number of the reedSwitch pin
const int ledPin = 17;      // the number of the LED pin

uint32_t RPMcount = 0;
bool writeRPMtoSerial = false;
int ledState = LOW;

void setup() {
	// initialize the LED pin as an output:
	pinMode(ledPin, OUTPUT);
	// initialize the reed switch pin as an input:
	pinMode(reedSwitchPin, INPUT);

	// start serial port and set speed to 115200
	Serial.begin(115200);

	//create and interrupt that detects each time the wheel rotates
	attachInterrupt(digitalPinToInterrupt(reedSwitchPin), updateRPMtrigger, RISING);
	digitalWrite(ledPin, LOW);
}

void updateRPMtrigger() {
	RPMcount++;
	writeRPMtoSerial = true;
}

void loop() {
	if (writeRPMtoSerial == true) {
		//Serial.println(RPMcount, DEC);
		ledState = !ledState;
		digitalWrite(ledPin, ledState);
		writeRPMtoSerial = false;
		Serial.println(RPMcount, DEC);
	}
}

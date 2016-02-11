/*
 Name:		CloudRacer_arduino.ino
 Created:	1/31/2016 3:05:30 PM
 Author:	peter
*/
const int REED_PIN = 7;
const int RPM_INTERVAL = 50; //ms
const int RPM_SAMPLES = 100;

int prevReed;
int latchTime = 2; // ms
int reportInterval = 10; //ms
uint32_t nextReadTime = millis();
uint32_t nextReportTime = millis();
uint32_t nextSampleTime = millis();
volatile uint32_t rotations = 0;
volatile uint32_t curRPM = 0;
uint32_t readings[RPM_SAMPLES];
int curReadingIndex = 0;

  
// the setup function runs once when you press reset or power the board
void setup() {
	pinMode(REED_PIN, INPUT_PULLUP);
	Serial.begin(1000000);
}

// the loop function runs over and over again until power down or reset
void loop() {
  int reed = digitalRead(REED_PIN);
  if ((reed != prevReed) && (millis() >= nextReadTime)) {
    prevReed = reed;
    nextReadTime = millis() + latchTime;
    if (!reed) rotations++;
  }


  if (millis() >= nextSampleTime)
  {
    uint32_t outgoingReading = readings[curReadingIndex];
    readings[curReadingIndex] = rotations;
    curRPM = (rotations - outgoingReading) * 6000 / RPM_INTERVAL / RPM_SAMPLES;
    nextSampleTime += RPM_INTERVAL;

    curReadingIndex++;
    if (curReadingIndex > RPM_SAMPLES) curReadingIndex = 0;
  }
  
  if (millis() >= nextReportTime) {
  	Serial.print("{ \"time\": ");
  	Serial.print(millis(), DEC);
  	Serial.print(", \"rotations\": ");
  	Serial.print(rotations, DEC);
   Serial.print(", \"rpm\": ");
    Serial.print(curRPM, DEC);
  	Serial.println("}");
    nextReportTime += reportInterval;
  }
}



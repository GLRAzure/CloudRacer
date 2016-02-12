/*
 Name:		CloudRacer_arduino.ino
 Created:	1/31/2016 3:05:30 PM
 Author:	peter
*/
const int REED_PIN = 7;
const int LED_PIN = 17;
const int RPM_INTERVAL = 100; //ms
const int RPM_SAMPLES = 10;
const uint32_t MM_PER_ROTATION = 2199;
const uint32_t NUM_MAGNETS = 2;
const uint32_t MM_TO_MILE = 1609344;

int prevReed;
int latchTime = 20; // ms
int reportInterval = 50; //ms
uint32_t nextReadTime = millis();
uint32_t nextReportTime = 0;
uint32_t nextSampleTime = millis();
uint32_t lastPulseTime = millis();
uint32_t timeBetweenPulses = 99999999;
volatile uint32_t rotations = 0;
volatile uint32_t curRPM = 0;
uint32_t readings[RPM_SAMPLES];
int curReadingIndex = 0;

  
// the setup function runs once when you press reset or power the board
void setup() {
	pinMode(REED_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
	Serial.begin(250000);
}

// the loop function runs over and over again until power down or reset
void loop() {
  int reed = digitalRead(REED_PIN);
  digitalWrite(LED_PIN, reed);
  if ((reed != prevReed) && (millis() >= nextReadTime)) {
    prevReed = reed;
    nextReadTime = millis() + latchTime;
    if (!reed) 
    {
      rotations++;
    }
    else
    {
      timeBetweenPulses = millis() - lastPulseTime;
      lastPulseTime = millis();      
    }
   }
   


  if (millis() >= nextSampleTime)
  {
    uint32_t outgoingReading = readings[curReadingIndex];
    readings[curReadingIndex] = rotations;
    curRPM = (rotations - outgoingReading) * 6000 / RPM_INTERVAL / RPM_SAMPLES;
    
    nextSampleTime += RPM_INTERVAL;

    curReadingIndex++;
    if (curReadingIndex >= RPM_SAMPLES) curReadingIndex = 0;
  }
  
  if ((millis() >= nextReportTime)) {  //  && (Serial.availableForWrite() == 0
    nextReportTime = millis() + reportInterval;
//    char buffer[100];
//    memset(buffer, 0, (sizeof(buffer)/sizeof(buffer[0])));
//    sprintf(buffer, "{ \"time\": %d, \"rotations\": %lu, \"rpm\": %d }\n" , millis(), rotations, curRPM);
//    Serial.println(buffer);
  	Serial.print("{ \"time\": ");
  	Serial.print(millis(), DEC);
  	Serial.print(", \"rotations\": ");
  	Serial.print(rotations / NUM_MAGNETS, DEC);
   Serial.print(", \"distance\": ");
    Serial.print(((rotations * MM_PER_ROTATION) / NUM_MAGNETS) / 1000 , DEC);  //meters
    Serial.print(", \"rpm\": ");
    // Serial.print(curRPM, DEC);
    Serial.print(10000/ (timeBetweenPulses), DEC); // 3 wheel rotations per pedal rotation, 2 magnets
    
  	Serial.println("}");
  }
}



start node app.js
echo "Loading browser in 10 seconds..."
sleep 10
REM start "browser" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" -kiosk -fullscreen "http://localhost:8888"
start "browser" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"  "http://localhost:8888"

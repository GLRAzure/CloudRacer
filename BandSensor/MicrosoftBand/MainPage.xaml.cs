using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;
using Microsoft.Band;
using System.Threading.Tasks;
using Windows.ApplicationModel.Core;
using Windows.UI.Core;

// The Blank Page item template is documented at http://go.microsoft.com/fwlink/?LinkId=402352&clcid=0x409

namespace MicrosoftBand
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class MainPage : Page
    {
        IBandClient _bandClient;

        public MainPage()
        {
            this.InitializeComponent();
            WireUpSensors();
        }

        async void WireUpSensors()
        {
            var pairedBands = await BandClientManager.Instance.GetBandsAsync();
            if (pairedBands.Length < 1)
            {
                // display some error message
                return;
            }

            _bandClient = await BandClientManager.Instance.ConnectAsync(pairedBands[0]);

            _bandClient.SensorManager.Accelerometer.ReadingChanged += Accelerometer_ReadingChanged;
            await _bandClient.SensorManager.Accelerometer.StartReadingsAsync();

            _bandClient.SensorManager.Distance.ReadingChanged += Distance_ReadingChanged;
            await _bandClient.SensorManager.Distance.StartReadingsAsync();

            _bandClient.SensorManager.Gyroscope.ReadingChanged += Gyroscope_ReadingChanged;
            await _bandClient.SensorManager.Gyroscope.StartReadingsAsync();

            _bandClient.SensorManager.HeartRate.ReadingChanged += HeartRate_ReadingChanged;
            if (_bandClient.SensorManager.HeartRate.GetCurrentUserConsent() != UserConsent.Granted)
            {
                await _bandClient.SensorManager.HeartRate.RequestUserConsentAsync();
            }
            await _bandClient.SensorManager.HeartRate.StartReadingsAsync();

            _bandClient.SensorManager.Pedometer.ReadingChanged += Pedometer_ReadingChanged;
            await _bandClient.SensorManager.Pedometer.StartReadingsAsync();

            _bandClient.SensorManager.SkinTemperature.ReadingChanged += SkinTemperature_ReadingChanged;
            await _bandClient.SensorManager.SkinTemperature.StartReadingsAsync();

            //_bandClient.SensorManager.Ultraviolet.ReadingChanged += UltravioletOnReadingChanged;
            //await _bandClient.SensorManager.Ultraviolet.StartReadingsAsync();

            _bandClient.SensorManager.Contact.ReadingChanged += Contact_ReadingChanged;
            await _bandClient.SensorManager.Contact.StartReadingsAsync();
        }

        async void StopSensors()
        {
            await _bandClient.SensorManager.Accelerometer.StopReadingsAsync();
            await _bandClient.SensorManager.Calories.StopReadingsAsync();
            await _bandClient.SensorManager.Contact.StopReadingsAsync();
            await _bandClient.SensorManager.Distance.StopReadingsAsync();
            await _bandClient.SensorManager.Gyroscope.StopReadingsAsync();
            await _bandClient.SensorManager.HeartRate.StopReadingsAsync();
            await _bandClient.SensorManager.Pedometer.StopReadingsAsync();
            await _bandClient.SensorManager.SkinTemperature.StopReadingsAsync();
            await _bandClient.SensorManager.UV.StopReadingsAsync();
        }

        private void Contact_ReadingChanged(object sender, Microsoft.Band.Sensors.BandSensorReadingEventArgs<Microsoft.Band.Sensors.IBandContactReading> e)
        {
            var read = e.SensorReading;
            var text = string.Format("exp = {0}", read.State);
        }

        //private async void UltravioletOnReadingChanged(object sender, BandSensorReadingEventArgs<IBandUltravioletLightReading> e)
        //{
        //    var read = e.SensorReading;
        //    var text = string.Format("exp = {0}", read.ExposureLevel);
        //}

        private void SkinTemperature_ReadingChanged(object sender, Microsoft.Band.Sensors.BandSensorReadingEventArgs<Microsoft.Band.Sensors.IBandSkinTemperatureReading> e)
        {
            var read = e.SensorReading;
            var text = string.Format("temp = {0}", read.Temperature);
        }

        private void Pedometer_ReadingChanged(object sender, Microsoft.Band.Sensors.BandSensorReadingEventArgs<Microsoft.Band.Sensors.IBandPedometerReading> e)
        {
            var read = e.SensorReading;
            var text = string.Format("steps = {0}", read.TotalSteps);
        }

        async private void HeartRate_ReadingChanged(object sender, Microsoft.Band.Sensors.BandSensorReadingEventArgs<Microsoft.Band.Sensors.IBandHeartRateReading> e)
        {
            var read = e.SensorReading;
            var text = string.Format("heart = {0}\nquality = {1}", read.HeartRate, read.Quality);
            await CoreApplication.MainView.CoreWindow.Dispatcher.RunAsync(CoreDispatcherPriority.Normal, () =>
            {
                this.textBlock.Text = read.HeartRate.ToString();
            });
        }

        private void Gyroscope_ReadingChanged(object sender, Microsoft.Band.Sensors.BandSensorReadingEventArgs<Microsoft.Band.Sensors.IBandGyroscopeReading> e)
        {
            var read = e.SensorReading;
            var text = string.Format("X = {0}\nY = {1}\nZ = {2}\naX = {3}\naY = {4}\naZ = {5}", read.AccelerationX, read.AccelerationY, read.AccelerationZ, read.AngularVelocityX, read.AngularVelocityY, read.AngularVelocityZ);
        }

        private void Distance_ReadingChanged(object sender, Microsoft.Band.Sensors.BandSensorReadingEventArgs<Microsoft.Band.Sensors.IBandDistanceReading> e)
        {
            var read = e.SensorReading;
            var text = string.Format("pace = {0}\nspeed = {1}\nmotion = {2}\ndist = {3}", read.Pace, read.Speed, read.CurrentMotion, read.TotalDistance);
        }

        private void Accelerometer_ReadingChanged(object sender, Microsoft.Band.Sensors.BandSensorReadingEventArgs<Microsoft.Band.Sensors.IBandAccelerometerReading> e)
        {
            var read = e.SensorReading;
            var text = string.Format("X = {0}\nY = {1}\nZ = {2}", read.AccelerationX, read.AccelerationY, read.AccelerationZ);
        }

        private void button_Click(object sender, RoutedEventArgs e)
        {
            StopSensors();
        }
    }
}

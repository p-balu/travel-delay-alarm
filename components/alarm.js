import React, { useEffect, useState } from "react";
import { View, Text, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { Audio } from "expo-av";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const Alarm = ({ arrivalTime, alarmTime, duration, handleSetAlarm }) => {
  console.log("duration:", parseInt(duration));
  const [notificationScheduled, setNotificationScheduled] = useState(false);
  useEffect(() => {
    async function requestPermissions() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Permission Not granted");
      }
    }
    requestPermissions();
  }, []);

  useEffect(() => {
    handleSetTriggerAlarm();
    handleSetAlarm(false);
  });

  const handleSetTriggerAlarm = async () => {
    if (!notificationScheduled) {
      // const time = new Date(arrivalTime);
      // const hours = time.getHours();
      // const minutes = time.getMinutes();
      const time = new Date();
      const setTime = time.getMinutes();

      const finalTime = setTime + parseInt(duration) - parseInt(alarmTime);

      console.log(finalTime);

      const alarmTriggerTime = new Date();
      // alarmTriggerTime.setHours(hours);
      alarmTriggerTime.setMinutes(finalTime);
      console.log(alarmTriggerTime.getHours(), alarmTriggerTime.getMinutes());

      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Alarm",
            body: "Time to wake up!",
            sound: "default",
          },
          trigger: {
            date: alarmTriggerTime,
            repeats: false,
          },
        });
        setNotificationScheduled(true);
      } catch (error) {
        alert(error);
      }
    }
  };

  return (
    <View>
      <Text></Text>
    </View>
  );
};

export default Alarm;

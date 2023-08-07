import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  PermissionsAndroid,
  Platform,
} from "react-native";

import RNPickerSelect from "react-native-picker-select";
// import Geolocation from "@react-native-community/geolocation";
import * as Location from "expo-location";
import axios from "axios";
import Alarm from "./alarm";

const Main = () => {
  const [startAddress, setStartAddress] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [distanceMatrix, setDistanceMatrix] = useState(null);
  const [duration, setDuration] = useState(null);

  const [arrivalTime, setArrivalTime] = useState("");
  const [trigger, setTrigger] = useState(false);
  const [destinationAddress, setDestinationAddress] = useState("");
  const [alarmTime, setAlarmTime] = useState("");
  const [alarm, setAlarm] = useState(false);

  const [predictions, setPredictions] = useState([]);

  const key = process.env.API_KEY;
  console.log(key);
  //   const handleStartAddressChange = (text) => {
  //     setStartAddress(text);
  //     // Geolocation.getCurrentPosition(
  //     //   (position) => {
  //     //     const { latitude, longitude } = position.coords;
  //     //     setStartAddress({ latitude, longitude });
  //     //   },
  //     //   (error) => {
  //     //     console.log("Error retrieving current location:", error);
  //     //   },
  //     //   { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
  //     // );
  //   };

  const handleStartAddressChange = (text) => {
    setStartAddress(text);
  };

  useEffect(() => {
    console.log("entered");
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access location was denied");
      return;
    }
    // Permission granted, proceed to get the current location
    getCurrentLocation();
  };

  const handleSetAlarm = (value) => {
    setTrigger(value);
    setAlarm(value);
  };

  const getCurrentLocation = async () => {
    try {
      console.log("try");
      const { coords } = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = coords;
      console.log(coords);
      const response =
        await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${key}
      `);

      console.log("address", response.data.results);
      const results = response.data.results[0].formatted_address;
      setStartAddress(results);
    } catch (error) {
      console.log("Error getting current location:", error);
    }
  };

  const handleDestinationAddressChange = async (text) => {
    setDestinationAddress(text);
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${key}&input=${text}`
      );
      setPredictions(response.data.predictions);
    } catch (error) {
      console.log("Error retrieving autocomplete predictions:", error);
    }
  };

  const handleAlarmTime = async (text) => {
    setAlarmTime(text);
  };

  const handleAlarmSetup = async () => {
    if (!startAddress || !destinationAddress || !alarmTime) {
      Alert.alert("Error", "Please enter all required fields");
      return;
    }

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${startAddress}&destinations=${destinationAddress}&units=imperial&key=${key}`
      );

      const distanceMatrix = response.data;

      if (
        distanceMatrix &&
        distanceMatrix.rows.length > 0 &&
        distanceMatrix.rows[0].elements.length > 0
      ) {
        const distance = distanceMatrix.rows[0].elements[0].distance.text;
        const duration = distanceMatrix.rows[0].elements[0].duration.text;
        const arrivalTime = new Date(Date.now() + alarmTime * 60000); // Calculate the arrival time

        setDistanceMatrix(distanceMatrix);
        setArrivalTime(arrivalTime);
        setDuration(duration);
        setTrigger(true);
        // Show the distance, duration, and arrival time in the console
        console.log("Distance:", distance);
        console.log("Duration:", duration);
        console.log("Arrival Time:", arrivalTime);

        // Set the alarm or perform any other desired action with the calculated values
        // You can pass the arrivalTime to your Alarm component or any other logic you have for setting an alarm
      }
    } catch (error) {
      console.log("Error retrieving distance matrix:", error);
    }
  };

  useEffect(() => {
    if (trigger === true) {
      setAlarm(true);
    }
  }, [trigger]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Current Location</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Enter Location"
        value={startAddress}
        onChangeText={handleStartAddressChange}
      ></TextInput>

      <Text style={styles.text}>Destination</Text>
      {/* <TextInput
        style={styles.textInput}
        placeholder="Enter destination address"
        value={destinationAddress}
        onChangeText={handleDestinationAddressChange}
      /> */}
      <TextInput
        style={styles.textInput}
        placeholder="Destination address"
        value={destinationAddress}
        onChangeText={handleDestinationAddressChange}
      />

      <FlatList
        style={styles.flatlist}
        data={predictions}
        renderItem={({ item }) => (
          <Text
            style={styles.arrayText}
            onPress={() => {
              setSelectedAddress(item.description);
              setDestinationAddress(item.description);
              setPredictions([]);
            }}
          >
            {item.description}
          </Text>
        )}
        keyExtractor={(item) => item.place_id}
      />
      <Text style={styles.text}>Set Alarm Before</Text>
      {/* <TextInput
        style={styles.textInput}
        placeholder="Enter Alarm Before"
        value={alarmTime}
        onChangeText={handleAlarmTime}
      /> */}

      <RNPickerSelect
        style={pickerSelectStyles}
        onValueChange={handleAlarmTime}
        items={[
          { label: "1 min", value: "1" },
          { label: "5 min", value: "5" },
          { label: "10 min", value: "10" },
          { label: "15 min", value: "15" },
          { label: "20 min", value: "20" },
          { label: "25 min", value: "25" },
          { label: "30 min", value: "30" },
          { label: "45 min", value: "45" },
          { label: "1 hr", value: "60" },
        ]}
        value={alarmTime}
      />

      <TouchableOpacity onPress={handleAlarmSetup} style={styles.button}>
        <Text style={styles.buttonText}>Set</Text>
      </TouchableOpacity>

      {alarm === true && (
        <Alarm
          arrivalTime={arrivalTime}
          alarmTime={alarmTime}
          duration={duration}
          handleSetAlarm={handleSetAlarm}
        />
      )}
    </View>
  );
};

export default Main;

const styles = StyleSheet.create({
  container: {
    display: "block",
    top: 40,
    bottom: 0,
    left: 50,
  },

  text: {
    fontWeight: "bold",
    marginTop: 10,
  },
  textInput: {
    maxWidth: 300,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
  button: {
    maxWidth: 300,
    marginTop: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#007AFF",
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  flatList: {
    maxWidth: 300,
  },
  arrayText: {
    maxWidth: 300,
    margin: 1,
    borderWidth: 0.2,
    borderColor: "blue",
    padding: 5,
  },
});
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    maxWidth: 300,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  inputAndroid: {
    maxWidth: 300,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
});

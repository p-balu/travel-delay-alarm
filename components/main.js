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
import Geolocation from "@react-native-community/geolocation";
import axios from "axios";

const Main = () => {
  const [startAddress, setStartAddress] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [alarmTime, setAlarmTime] = useState("");
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          Geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setStartAddress({ latitude, longitude });
            },
            (error) => {
              console.log("Error getting current location:", error);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
        } else {
          console.log("Location permission denied");
        }
      } catch (error) {
        console.log("Error requesting location permission:", error);
      }
    };

    requestLocationPermission();
  }, []);

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

  const handleDestinationAddressChange = async (text) => {
    setDestinationAddress(text);
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=AIzaSyANhGPsjh9-JOsLWKDzpYaDTWE-BeempDA&input=${text}`
      );
      setPredictions(response.data.predictions);
    } catch (error) {
      console.log("Error retrieving autocomplete predictions:", error);
    }
  };

  const handleAlarmTime = (text) => {
    setAlarmTime(text);
  };

  const handleAlarmSetup = async () => {};

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Current Location</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Enter Location"
        value={startAddress}
        // onChangeText={handleStartAddressChange}
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
      <TextInput
        style={styles.textInput}
        placeholder="Enter Alarm Before"
        value={alarmTime}
        onChangeText={handleAlarmTime}
      />

      <TouchableOpacity onPress={handleAlarmSetup} style={styles.button}>
        <Text style={styles.buttonText}>Set</Text>
      </TouchableOpacity>
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

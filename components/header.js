import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, Button } from "react-native";

const Header = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Travel Alarm</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#33ffdd",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 40,
  },
});

export default Header;

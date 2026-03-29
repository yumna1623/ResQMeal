import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useLocalSearchParams } from "expo-router";

export default function MapScreen() {
  const params = useLocalSearchParams();

  const latitude = parseFloat(params.latitude as string);
  const longitude = parseFloat(params.longitude as string);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{params.title}</Text>
      <Text style={styles.subtitle}>{params.location}</Text>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title={params.title as string}
          description={params.location as string}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  map: { flex: 1 },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    padding: 10,
  },
  subtitle: {
    color: "#aaa",
    paddingHorizontal: 10,
    paddingBottom: 5,
  },
});
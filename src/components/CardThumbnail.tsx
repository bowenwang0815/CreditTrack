import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TrackerCard } from "../types";

export function CardThumbnail({ card }: { card: TrackerCard }) {
  return (
    <View style={[styles.container, { backgroundColor: card.colorHex }]}>
      <Text style={styles.issuer}>{card.issuer.toUpperCase()}</Text>
      <Text style={styles.digits}>{card.last4 ? `•••• ${card.last4}` : "CARD"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 74,
    height: 48,
    borderRadius: 16,
    padding: 10,
    justifyContent: "space-between"
  },
  issuer: {
    color: "#FFFFFFCC",
    fontSize: 9,
    fontWeight: "700"
  },
  digits: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700"
  }
});

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { EarningRule } from "../types";
import { getCategoryLabel } from "../utils/cardHelpers";

export function CategoryChip({ rule }: { rule: EarningRule }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.text}>
        {rule.multiplier}x {getCategoryLabel(rule.category)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: "#EEF2F7",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8
  },
  text: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600"
  }
});

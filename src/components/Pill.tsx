import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function Pill({
  label,
  tone = "neutral"
}: {
  label: string;
  tone?: "neutral" | "warning" | "success" | "primary";
}) {
  return (
    <View
      style={[
        styles.base,
        tone === "warning" && styles.warning,
        tone === "success" && styles.success,
        tone === "primary" && styles.primary
      ]}
    >
      <Text
        style={[
          styles.text,
          tone === "warning" && styles.warningText,
          tone === "success" && styles.successText,
          tone === "primary" && styles.primaryText
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#EEF2F7"
  },
  warning: {
    backgroundColor: "#FDEBD5"
  },
  success: {
    backgroundColor: "#DFF7EA"
  },
  primary: {
    backgroundColor: "#E3ECFF"
  },
  text: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "700"
  },
  warningText: {
    color: "#C06B12"
  },
  successText: {
    color: "#1C9C5E"
  },
  primaryText: {
    color: "#2B63F6"
  }
});

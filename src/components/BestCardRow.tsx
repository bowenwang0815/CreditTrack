import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme";
import { SpendingCategory, TrackerCard } from "../types";
import { getCategoryLabel } from "../utils/cardHelpers";
import { Pill } from "./Pill";

export function BestCardRow({
  category,
  recommendation
}: {
  category: SpendingCategory;
  recommendation: { card: TrackerCard | null; multiplier: number };
}) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.category}>{getCategoryLabel(category)}</Text>
          <Text style={styles.detail}>
            {recommendation.card
              ? `${recommendation.card.name} • ${recommendation.multiplier}x`
              : "No active recommendation"}
          </Text>
        </View>
        {recommendation.card ? <Pill label={`${recommendation.multiplier}x`} tone="primary" /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.lg
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  category: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary
  },
  detail: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textSecondary
  }
});

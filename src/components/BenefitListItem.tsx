import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme";
import { Benefit } from "../types";
import { formatCurrency } from "../utils/date";
import { Pill } from "./Pill";

export function BenefitListItem({
  benefit,
  cardName,
  onMarkUsed
}: {
  benefit: Benefit;
  cardName: string;
  onMarkUsed: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.textBlock}>
          <Text style={styles.name}>{benefit.name}</Text>
          <Text style={styles.meta}>{cardName}</Text>
          <Text style={styles.meta}>
            {benefit.type} • {benefit.expirationRule}
          </Text>
        </View>
        <Pill label={benefit.isUsed ? "Used" : "Unused"} tone={benefit.isUsed ? "success" : "warning"} />
      </View>

      <Text style={styles.value}>
        {formatCurrency(benefit.amountUsedThisPeriod)} of {formatCurrency(benefit.amountTotalThisPeriod)}
      </Text>

      {!benefit.isUsed ? (
        <Pressable onPress={onMarkUsed} style={styles.actionButton}>
          <Text style={styles.actionText}>Mark used</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.lg
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10
  },
  textBlock: {
    flex: 1
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary
  },
  meta: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary
  },
  value: {
    marginTop: 14,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "600"
  },
  actionButton: {
    alignSelf: "flex-start",
    marginTop: 14,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700"
  }
});

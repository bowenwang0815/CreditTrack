import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme";
import { Benefit, TrackerCard } from "../types";
import { formatCurrency } from "../utils/date";
import { CardThumbnail } from "./CardThumbnail";

export function BenefitListItem({
  benefit,
  card,
  onPress,
  onMarkUsed,
  onReset
}: {
  benefit: Benefit;
  card: TrackerCard;
  onPress: () => void;
  onMarkUsed: () => void;
  onReset: () => void;
}) {
  const remainingAmount = Math.max(benefit.amountTotalThisPeriod - benefit.amountUsedThisPeriod, 0);
  const progress =
    benefit.amountTotalThisPeriod > 0
      ? Math.min(benefit.amountUsedThisPeriod / benefit.amountTotalThisPeriod, 1)
      : 0;

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <CardThumbnail card={card} compact />

        <View style={styles.textBlock}>
          <View style={styles.titleRow}>
            <Text numberOfLines={1} style={styles.name}>
              {benefit.name}
            </Text>
            <Feather color="#98A2B3" name="star" size={18} />
          </View>
          <Text style={styles.meta}>{card.name}</Text>
          <Text style={styles.valueLine}>
            {formatCurrency(benefit.amountUsedThisPeriod)} of {formatCurrency(benefit.amountTotalThisPeriod)}
          </Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.max(progress * 100, benefit.amountUsedThisPeriod > 0 ? 12 : 0)}%` }]} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.expirationText}>{benefit.type} • {benefit.expirationRule}</Text>
        <Text style={[styles.statusText, benefit.isUsed ? styles.statusUsed : styles.statusOpen]}>
          {benefit.isUsed ? "Used" : remainingAmount > 0 ? `${formatCurrency(remainingAmount)} left` : "Not used"}
        </Text>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            if (benefit.isUsed) {
              onReset();
              return;
            }
            onMarkUsed();
          }}
          style={[styles.actionButton, benefit.isUsed && styles.actionButtonSecondary]}
        >
          <Text style={[styles.actionText, benefit.isUsed && styles.actionTextSecondary]}>
            {benefit.isUsed ? "Reset" : "Mark used"}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "#F0D7A6",
    shadowColor: "#CCB37A",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  textBlock: {
    flex: 1
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8
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
  valueLine: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "600"
  },
  progressTrack: {
    marginTop: 14,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#EEF2F7",
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.primary
  },
  footer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10
  },
  expirationText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary
  },
  statusText: {
    fontSize: 14,
    fontWeight: "700"
  },
  statusOpen: {
    color: colors.primary
  },
  statusUsed: {
    color: colors.success
  },
  actionRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "flex-start"
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  actionButtonSecondary: {
    backgroundColor: "#EAF7F0"
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700"
  },
  actionTextSecondary: {
    color: colors.success
  }
});

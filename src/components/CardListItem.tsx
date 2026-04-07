import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme";
import { TrackerCard } from "../types";
import { annualFeeCountdown, formatCurrency } from "../utils/date";
import { getDisplayName, getKeyRules, getRedeemedValue, getUnusedBenefitsCount } from "../utils/cardHelpers";
import { CardThumbnail } from "./CardThumbnail";
import { CategoryChip } from "./CategoryChip";
import { Pill } from "./Pill";

export function CardListItem({
  card,
  onPress
}: {
  card: TrackerCard;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.topRow}>
        <CardThumbnail card={card} />
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <View style={styles.titleGroup}>
              <Text style={styles.name}>{getDisplayName(card)}</Text>
              <Text style={styles.issuer}>{card.issuer}</Text>
            </View>
            <Pill
              label={card.annualFee === 0 ? "No fee" : `${formatCurrency(card.annualFee)} AF`}
              tone={card.annualFee === 0 ? "success" : "warning"}
            />
          </View>
          {card.last4 ? <Text style={styles.meta}>Ending in {card.last4}</Text> : null}
          <Text style={styles.redeemed}>
            {formatCurrency(getRedeemedValue(card))} redeemed this cycle
          </Text>
          <Text style={styles.meta}>
            {annualFeeCountdown(card.annualFeeDueDate)} • {getUnusedBenefitsCount(card)} unused
          </Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chips}>
          {getKeyRules(card).map((rule) => (
            <CategoryChip key={rule.id} rule={rule} />
          ))}
        </View>
      </ScrollView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 26,
    padding: spacing.lg,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  topRow: {
    flexDirection: "row",
    gap: 14
  },
  info: {
    flex: 1
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8
  },
  titleGroup: {
    flex: 1
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary
  },
  issuer: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary
  },
  meta: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textSecondary
  },
  redeemed: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary
  },
  chips: {
    flexDirection: "row",
    marginTop: spacing.md
  }
});

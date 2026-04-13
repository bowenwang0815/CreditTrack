import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { colors, spacing } from "../theme";
import { TrackerCard } from "../types";
import {
  annualFeeProgress,
  formatAnnualFeeDueDate,
  formatCurrency,
  getAnnualFeeStatus
} from "../utils/date";
import {
  getDisplayName,
  getKeyRules,
  getRedeemedValue
} from "../utils/cardHelpers";
import { CardThumbnail } from "./CardThumbnail";

function iconForCategory(category: string): keyof typeof MaterialIcons.glyphMap {
  switch (category) {
    case "dining":
      return "restaurant";
    case "grocery":
      return "local-grocery-store";
    case "gas":
      return "local-gas-station";
    case "travel":
      return "flight";
    case "flights":
      return "flight";
    case "hotels":
      return "hotel";
    case "transit":
      return "directions-transit";
    case "drugstores":
      return "local-pharmacy";
    case "online_shopping":
      return "shopping-bag";
    case "streaming":
      return "play-circle-outline";
    case "mobile_wallet":
      return "account-balance-wallet";
    default:
      return "star";
  }
}

export function CardListItem({
  card,
  onPress
}: {
  card: TrackerCard;
  onPress: () => void;
}) {
  const { width } = useWindowDimensions();
  const isCompact = width < 440;
  const hasAnnualFee = card.annualFee > 0;
  const feeStatus = hasAnnualFee ? getAnnualFeeStatus(card.annualFeeDueDate) : null;
  const progress = hasAnnualFee ? annualFeeProgress(card.annualFeeDueDate) : 0;
  const topRules = getKeyRules(card).slice(0, isCompact ? 4 : 5);

  return (
    <Pressable onPress={onPress} style={[styles.card, isCompact && styles.cardCompact]}>
      <View style={[styles.row, isCompact && styles.rowCompact]}>
        <CardThumbnail card={card} compact={isCompact} />

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text numberOfLines={1} style={[styles.name, isCompact && styles.nameCompact]}>
              {getDisplayName(card)}
            </Text>
            <View style={[styles.feePill, isCompact && styles.feePillCompact]}>
              <Text style={[styles.feePillText, isCompact && styles.feePillTextCompact]}>
                {formatCurrency(card.annualFee)}
              </Text>
            </View>
          </View>

          {hasAnnualFee ? (
            <>
              <View style={[styles.dueRow, isCompact && styles.dueRowCompact]}>
                <Text style={[styles.supportingLabel, isCompact && styles.supportingLabelCompact]}>
                  Next annual fee
                </Text>
                <Text
                  style={[
                    styles.daysText,
                    isCompact && styles.daysTextCompact,
                    feeStatus?.tone === "urgent" && styles.daysTextUrgent,
                    feeStatus?.tone === "upcoming" && styles.daysTextUpcoming
                  ]}
                >
                  {feeStatus?.label}
                </Text>
              </View>

              <View style={[styles.progressTrack, isCompact && styles.progressTrackCompact]}>
                <View
                  style={[
                    styles.progressFill,
                    feeStatus?.tone === "urgent" && styles.progressFillUrgent,
                    feeStatus?.tone === "upcoming" && styles.progressFillUpcoming,
                    { width: `${Math.max(progress * 100, 4)}%` }
                  ]}
                />
              </View>

              <Text style={[styles.feeDateText, isCompact && styles.feeDateTextCompact]}>
                {formatAnnualFeeDueDate(card.annualFeeDueDate)}
              </Text>
            </>
          ) : (
            <View style={[styles.noFeeBanner, isCompact && styles.noFeeBannerCompact]}>
              <Text style={[styles.noFeeText, isCompact && styles.noFeeTextCompact]}>
                No annual fee
              </Text>
            </View>
          )}

          <View style={[styles.bottomRow, isCompact && styles.bottomRowCompact]}>
            <View style={styles.redeemedBlock}>
              <Text style={[styles.supportingLabel, isCompact && styles.supportingLabelCompact]}>
                Benefits redeemed
              </Text>
              <Text style={[styles.redeemedValue, isCompact && styles.redeemedValueCompact]}>
                {formatCurrency(getRedeemedValue(card))}
              </Text>
            </View>

            <View style={[styles.multiplierRow, isCompact && styles.multiplierRowCompact]}>
              {topRules.map((rule) => (
                <View key={rule.id} style={styles.multiplierItem}>
                  <MaterialIcons
                    color={colors.icon}
                    name={iconForCategory(rule.category)}
                    size={isCompact ? 20 : 24}
                  />
                  <Text numberOfLines={1} style={[styles.multiplierText, isCompact && styles.multiplierTextCompact]}>
                    {rule.multiplier}x
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DFE6F1",
    shadowColor: "#7B8BA8",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5
  },
  cardCompact: {
    padding: 14
  },
  row: {
    flexDirection: "row",
    gap: 12
  },
  rowCompact: {
    gap: 10
  },
  content: {
    flex: 1,
    justifyContent: "space-between"
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10
  },
  name: {
    flex: 1,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "700",
    color: colors.textPrimary
  },
  nameCompact: {
    fontSize: 15,
    lineHeight: 18
  },
  feePill: {
    backgroundColor: "#E8F0FF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  feePillCompact: {
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  feePillText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700"
  },
  feePillTextCompact: {
    fontSize: 12
  },
  dueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    gap: 8
  },
  dueRowCompact: {
    alignItems: "center"
  },
  supportingLabel: {
    fontSize: 13,
    color: "#7082A0"
  },
  supportingLabelCompact: {
    fontSize: 11,
    lineHeight: 13,
    flexShrink: 1
  },
  daysText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary
  },
  daysTextUrgent: {
    color: "#D92D20"
  },
  daysTextUpcoming: {
    color: colors.warning
  },
  daysTextCompact: {
    fontSize: 10,
    lineHeight: 12
  },
  progressTrack: {
    marginTop: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#E8EDF6",
    overflow: "hidden"
  },
  progressTrackCompact: {
    marginTop: 8,
    height: 8
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.primary
  },
  progressFillUrgent: {
    backgroundColor: "#D92D20"
  },
  progressFillUpcoming: {
    backgroundColor: colors.warning
  },
  feeDateText: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textSecondary
  },
  feeDateTextCompact: {
    marginTop: 5,
    fontSize: 10
  },
  noFeeBanner: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#EAF7F0",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  noFeeBannerCompact: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 5
  },
  noFeeText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.success
  },
  noFeeTextCompact: {
    fontSize: 10
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 8,
    marginTop: 14
  },
  bottomRowCompact: {
    marginTop: 12,
    gap: 6
  },
  redeemedBlock: {
    minWidth: 96,
    paddingRight: 4
  },
  redeemedValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary
  },
  redeemedValueCompact: {
    fontSize: 13,
    marginTop: 3
  },
  multiplierRow: {
    flexShrink: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    gap: 10
  },
  multiplierRowCompact: {
    gap: 6
  },
  multiplierItem: {
    alignItems: "center",
    minWidth: 26
  },
  multiplierText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "#7082A0"
  },
  multiplierTextCompact: {
    fontSize: 11,
    marginTop: 3
  }
});

import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme";
import { TrackerCard } from "../types";
import {
  annualFeeCountdown,
  formatAnnualFeeDueDate,
  formatCurrency,
  getNextAnnualFeeDate
} from "../utils/date";

export function DashboardView({ cards }: { cards: TrackerCard[] }) {
  const activeCards = useMemo(() => cards.filter((card) => card.isActive), [cards]);

  const totalAnnualFees = useMemo(
    () => activeCards.reduce((sum, card) => sum + card.annualFee, 0),
    [activeCards]
  );

  const totalClaimedBenefits = useMemo(
    () =>
      activeCards.reduce(
        (sum, card) =>
          sum +
          card.benefits.reduce((benefitSum, benefit) => benefitSum + benefit.amountUsedThisPeriod, 0),
        0
      ),
    [activeCards]
  );

  const totalUnusedBenefits = useMemo(
    () =>
      activeCards.reduce(
        (sum, card) => sum + card.benefits.filter((benefit) => !benefit.isUsed).length,
        0
      ),
    [activeCards]
  );

  const nextAnnualFeeCard = useMemo(() => {
    return [...activeCards]
      .filter((card) => card.annualFee > 0)
      .sort(
        (left, right) =>
          getNextAnnualFeeDate(left.annualFeeDueDate).getTime() -
          getNextAnnualFeeDate(right.annualFeeDueDate).getTime()
      )[0];
  }, [activeCards]);

  const recentlyClaimedBenefits = useMemo(() => {
    return activeCards
      .flatMap((card) =>
        card.benefits
          .filter((benefit) => benefit.amountUsedThisPeriod > 0)
          .map((benefit) => ({
            cardName: card.name,
            benefitName: benefit.name,
            amount: benefit.amountUsedThisPeriod
          }))
      )
      .sort((left, right) => right.amount - left.amount)
      .slice(0, 4);
  }, [activeCards]);

  return (
    <>
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Home</Text>
        <Text style={styles.heroTitle}>Your wallet at a glance</Text>
        <Text style={styles.heroSubtitle}>
          See your card count, annual fee exposure, and how much value you&apos;ve already redeemed.
        </Text>
      </View>

      <View style={styles.metricGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{activeCards.length}</Text>
          <Text style={styles.metricLabel}>Active cards</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{formatCurrency(totalAnnualFees)}</Text>
          <Text style={styles.metricLabel}>Total annual fees</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{formatCurrency(totalClaimedBenefits)}</Text>
          <Text style={styles.metricLabel}>Benefits claimed</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{totalUnusedBenefits}</Text>
          <Text style={styles.metricLabel}>Unused benefits</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Next annual fee</Text>
        {nextAnnualFeeCard ? (
          <>
            <Text style={styles.sectionPrimary}>{nextAnnualFeeCard.name}</Text>
            <Text style={styles.sectionMeta}>
              {formatCurrency(nextAnnualFeeCard.annualFee)} • {formatAnnualFeeDueDate(nextAnnualFeeCard.annualFeeDueDate)}
            </Text>
            <Text style={styles.sectionAccent}>
              {annualFeeCountdown(nextAnnualFeeCard.annualFeeDueDate)}
            </Text>
          </>
        ) : (
          <Text style={styles.sectionMeta}>No active cards yet.</Text>
        )}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Claimed benefits</Text>
        {recentlyClaimedBenefits.length > 0 ? (
          recentlyClaimedBenefits.map((item) => (
            <View key={`${item.cardName}-${item.benefitName}`} style={styles.benefitRow}>
              <View style={styles.benefitTextBlock}>
                <Text style={styles.benefitName}>{item.benefitName}</Text>
                <Text style={styles.benefitMeta}>{item.cardName}</Text>
              </View>
              <Text style={styles.benefitAmount}>{formatCurrency(item.amount)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.sectionMeta}>
            No benefits claimed yet. Mark a credit as used from the card detail screen.
          </Text>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 26,
    padding: spacing.xl
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: colors.primary
  },
  heroTitle: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary
  },
  heroSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  metricCard: {
    width: "47%",
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.lg
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary
  },
  metricLabel: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.lg
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary
  },
  sectionPrimary: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary
  },
  sectionMeta: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary
  },
  sectionAccent: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary
  },
  benefitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  benefitTextBlock: {
    flex: 1,
    paddingRight: 12
  },
  benefitName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary
  },
  benefitMeta: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary
  },
  benefitAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary
  }
});

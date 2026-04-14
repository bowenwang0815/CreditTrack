import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { colors } from "../theme";
import { SpendingCategory, TrackerCard } from "../types";
import {
  annualFeeCountdown,
  daysUntil,
  formatAnnualFeeDueDate,
  formatCurrency,
  getNextAnnualFeeDate
} from "../utils/date";
import { getBestCardForCategory } from "../utils/bestCard";
import { getDisplayName, getRedeemedValue } from "../utils/cardHelpers";
import { CardThumbnail } from "./CardThumbnail";

type InsightCard = {
  id: string;
  title: string;
  body: string;
  footer: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  bubbleColor: string;
  panelColor: string;
  accentColor: string;
};

function getUnusedBenefitsCount(card: TrackerCard) {
  return card.benefits.filter((benefit) => !benefit.isUsed).length;
}

function getRemainingValue(card: TrackerCard) {
  return card.benefits.reduce(
    (sum, benefit) => sum + Math.max(benefit.amountTotalThisPeriod - benefit.amountUsedThisPeriod, 0),
    0
  );
}

function categoryLabel(category: SpendingCategory) {
  const labels: Record<SpendingCategory, string> = {
    dining: "Dining",
    grocery: "Grocery",
    gas: "Gas",
    travel: "Travel",
    flights: "Flights",
    hotels: "Hotels",
    transit: "Transit",
    drugstores: "Drugstores",
    online_shopping: "Online",
    streaming: "Streaming",
    mobile_wallet: "Mobile Wallet",
    everything_else: "Everyday"
  };

  return labels[category];
}

function iconForCategory(category: SpendingCategory): keyof typeof MaterialIcons.glyphMap {
  const icons: Record<SpendingCategory, keyof typeof MaterialIcons.glyphMap> = {
    dining: "restaurant",
    grocery: "shopping-basket",
    gas: "local-gas-station",
    travel: "flight-takeoff",
    flights: "flight",
    hotels: "hotel",
    transit: "train",
    drugstores: "local-pharmacy",
    online_shopping: "shopping-bag",
    streaming: "smart-display",
    mobile_wallet: "smartphone",
    everything_else: "star"
  };

  return icons[category];
}

export function DashboardView({ cards }: { cards: TrackerCard[] }) {
  const { width } = useWindowDimensions();
  const isCompact = width < 430;
  const activeCards = useMemo(() => cards.filter((card) => card.isActive), [cards]);

  const totalAnnualFees = useMemo(
    () => activeCards.reduce((sum, card) => sum + card.annualFee, 0),
    [activeCards]
  );

  const totalClaimedBenefits = useMemo(
    () => activeCards.reduce((sum, card) => sum + getRedeemedValue(card), 0),
    [activeCards]
  );

  const totalUnusedValue = useMemo(
    () => activeCards.reduce((sum, card) => sum + getRemainingValue(card), 0),
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

  const nextAnnualFeeDays = useMemo(
    () => (nextAnnualFeeCard ? daysUntil(nextAnnualFeeCard.annualFeeDueDate) : null),
    [nextAnnualFeeCard]
  );

  const largestUnusedBenefit = useMemo(() => {
    return activeCards
      .flatMap((card) =>
        card.benefits.map((benefit) => ({
          card,
          benefit,
          remaining: Math.max(benefit.amountTotalThisPeriod - benefit.amountUsedThisPeriod, 0)
        }))
      )
      .filter((entry) => entry.remaining > 0)
      .sort((left, right) => right.remaining - left.remaining)[0];
  }, [activeCards]);

  const nextFeeRedeemed = useMemo(
    () => (nextAnnualFeeCard ? getRedeemedValue(nextAnnualFeeCard) : 0),
    [nextAnnualFeeCard]
  );

  const nextFeeOpenBenefit = useMemo(
    () =>
      nextAnnualFeeCard
        ? nextAnnualFeeCard.benefits
            .map((benefit) => ({
              benefit,
              remaining: Math.max(benefit.amountTotalThisPeriod - benefit.amountUsedThisPeriod, 0)
            }))
            .filter((entry) => entry.remaining > 0)
            .sort((left, right) => right.remaining - left.remaining)[0] ?? null
        : null,
    [nextAnnualFeeCard]
  );

  const bestDining = useMemo(() => getBestCardForCategory(activeCards, "dining"), [activeCards]);
  const bestTravel = useMemo(() => getBestCardForCategory(activeCards, "travel"), [activeCards]);
  const bestGrocery = useMemo(() => getBestCardForCategory(activeCards, "grocery"), [activeCards]);

  const valueLeaders = useMemo(() => {
    return [...activeCards]
      .map((card) => ({
        card,
        redeemed: getRedeemedValue(card),
        remaining: getRemainingValue(card),
        openBenefits: getUnusedBenefitsCount(card)
      }))
      .sort((left, right) => {
        const leftScore = left.redeemed + left.remaining;
        const rightScore = right.redeemed + right.remaining;
        return rightScore - leftScore;
      })
      .slice(0, 3);
  }, [activeCards]);

  const bestRightNow = useMemo(() => {
    return [
      { label: "Dining", category: "dining" as const, recommendation: bestDining },
      { label: "Travel", category: "travel" as const, recommendation: bestTravel },
      { label: "Grocery", category: "grocery" as const, recommendation: bestGrocery }
    ].filter((item) => item.recommendation.card);
  }, [bestDining, bestGrocery, bestTravel]);

  const insightCards = useMemo<InsightCard[]>(() => {
    const cards: InsightCard[] = [];

    if (largestUnusedBenefit) {
      cards.push({
        id: "unused-benefit",
        title: "Use this before it slips",
        body: `${largestUnusedBenefit.card.name} still has ${formatCurrency(
          largestUnusedBenefit.remaining
        )} left in ${largestUnusedBenefit.benefit.name}.`,
        footer: `${largestUnusedBenefit.benefit.type} credit still open`,
        icon: "bolt",
        bubbleColor: "#DCE8FF",
        panelColor: "#EEF4FF",
        accentColor: colors.primary
      });
    }

    if (bestDining.card) {
      cards.push({
        id: "dining-default",
        title: "Tonight's default",
        body: `Use ${getDisplayName(bestDining.card)} for ${bestDining.multiplier}x on dining.`,
        footer: "Best live dining card in your wallet",
        icon: "restaurant",
        bubbleColor: "#DBF8EA",
        panelColor: "#EFFBF5",
        accentColor: colors.success
      });
    }

    if (bestTravel.card) {
      cards.push({
        id: "travel-default",
        title: "Trip booking move",
        body: `${getDisplayName(bestTravel.card)} is your strongest everyday travel pick at ${bestTravel.multiplier}x.`,
        footer: "Use this for flights, hotels, and transit where it fits",
        icon: "flight-takeoff",
        bubbleColor: "#E9E5FF",
        panelColor: "#F5F2FF",
        accentColor: "#6B4EF6"
      });
    }

    if (bestGrocery.card && !cards.find((entry) => entry.id === "travel-default")) {
      cards.push({
        id: "grocery-default",
        title: "Grocery default",
        body: `${getDisplayName(bestGrocery.card)} is earning ${bestGrocery.multiplier}x at the grocery store.`,
        footer: "Use this for your regular market runs",
        icon: "shopping-basket",
        bubbleColor: "#FFF0D9",
        panelColor: "#FFF8EC",
        accentColor: colors.warning
      });
    }

    return cards.slice(0, 4);
  }, [bestDining, bestGrocery, bestTravel, largestUnusedBenefit]);

  if (activeCards.length === 0) {
    return (
      <View style={styles.emptyHero}>
        <Text style={styles.emptyEyebrow}>Home</Text>
        <Text style={styles.emptyTitle}>Build your wallet command center.</Text>
        <Text style={styles.emptySubtitle}>
          Add a few cards and Home will start surfacing annual fee pressure, unused credits,
          and which card deserves your next swipe.
        </Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.heroCard}>
        <View style={styles.heroOrbLarge} />
        <View style={styles.heroOrbSmall} />

        <Text style={styles.heroEyebrow}>Wallet at a glance</Text>
        <View style={[styles.heroTopRow, isCompact && styles.heroTopRowCompact]}>
          <View style={styles.heroTextBlock}>
            <Text style={styles.heroKicker}>Value still on the table</Text>
            <Text style={styles.heroAmount}>{formatCurrency(totalUnusedValue)}</Text>
            <Text style={styles.heroBody}>
              {totalClaimedBenefits > 0
                ? `You've already captured ${formatCurrency(
                    totalClaimedBenefits
                  )} in credits and perks across ${activeCards.length} active cards.`
                : `You have ${activeCards.length} active cards ready to start generating real value.`}
            </Text>
          </View>

          <View style={styles.heroStatStack}>
            <View style={styles.heroStatPill}>
              <Text style={styles.heroStatLabel}>Claimed</Text>
              <Text style={styles.heroStatValue}>{formatCurrency(totalClaimedBenefits)}</Text>
            </View>
            <View style={styles.heroStatPill}>
              <Text style={styles.heroStatLabel}>Cards live</Text>
              <Text style={styles.heroStatValue}>{activeCards.length}</Text>
            </View>
          </View>
        </View>

        <View style={styles.heroAlert}>
          <MaterialIcons color="#8EF3C8" name="auto-awesome" size={18} />
          <Text style={styles.heroAlertText}>
            {largestUnusedBenefit
              ? `Biggest open move: ${formatCurrency(largestUnusedBenefit.remaining)} is still sitting in ${largestUnusedBenefit.benefit.name}.`
              : bestDining.card
                ? `${getDisplayName(bestDining.card)} is still your cleanest default for dining right now.`
                : "Your wallet is loaded. Add a few more benefits to make Home even smarter."}
          </Text>
        </View>
      </View>

      <View style={styles.metricStack}>
        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: "#E7F0FF" }]}>
              <MaterialIcons color={colors.primary} name="credit-card" size={20} />
            </View>
            <Text style={styles.metricValue}>{activeCards.length}</Text>
            <Text style={styles.metricLabel}>Active cards</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: "#FFEAE3" }]}>
              <MaterialIcons color={colors.warning} name="payments" size={20} />
            </View>
            <Text style={styles.metricValue}>{formatCurrency(totalAnnualFees)}</Text>
            <Text style={styles.metricLabel}>Annual fees</Text>
          </View>
        </View>

        <View style={[styles.splitValueCard, isCompact && styles.splitValueCardCompact]}>
          <View style={styles.splitValueSide}>
            <Text style={styles.splitValueLabel}>Benefits claimed</Text>
            <Text style={[styles.splitValueNumber, styles.splitValueNumberSuccess]}>
              {formatCurrency(totalClaimedBenefits)}
            </Text>
          </View>

          <View style={[styles.splitDivider, isCompact && styles.splitDividerCompact]} />

          <View style={[styles.splitValueSide, styles.splitValueSideRight]}>
            <Text style={styles.splitValueLabel}>Unused value</Text>
            <Text style={[styles.splitValueNumber, styles.splitValueNumberPrimary]}>
              {formatCurrency(totalUnusedValue)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Actionable insights</Text>
        <Text style={styles.sectionCaption}>Small moves with real payoff.</Text>
      </View>

      <ScrollView
        horizontal
        contentContainerStyle={styles.insightRail}
        showsHorizontalScrollIndicator={false}
      >
        {insightCards.map((insight) => (
          <View key={insight.id} style={[styles.insightCard, { backgroundColor: insight.panelColor }]}>
            <View style={[styles.insightIconBubble, { backgroundColor: insight.bubbleColor }]}>
              <MaterialIcons color={insight.accentColor} name={insight.icon} size={20} />
            </View>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightBody}>{insight.body}</Text>
            <Text style={[styles.insightFooter, { color: insight.accentColor }]}>{insight.footer}</Text>
          </View>
        ))}
      </ScrollView>

      {nextAnnualFeeCard ? (
        <View style={styles.renewalCard}>
          <View style={[styles.renewalHeaderRow, isCompact && styles.renewalHeaderRowCompact]}>
            <View style={styles.renewalHeaderText}>
              <Text style={styles.renewalEyebrow}>Renewal lookout</Text>
              <Text style={styles.renewalTitle}>
                {nextAnnualFeeDays !== null && nextAnnualFeeDays <= 45
                  ? "This one is coming up soon"
                  : "Nothing urgent, but this is the next one up"}
              </Text>
            </View>

            <View
              style={[
                styles.renewalBadge,
                nextAnnualFeeDays !== null && nextAnnualFeeDays <= 45
                  ? styles.renewalBadgeUrgent
                  : styles.renewalBadgeCalm
              ]}
            >
              <Text
                style={[
                  styles.renewalBadgeText,
                  nextAnnualFeeDays !== null && nextAnnualFeeDays <= 45
                    ? styles.renewalBadgeTextUrgent
                    : styles.renewalBadgeTextCalm
                ]}
              >
                {annualFeeCountdown(nextAnnualFeeCard.annualFeeDueDate)}
              </Text>
            </View>
          </View>

          <View style={styles.renewalBodyRow}>
            <CardThumbnail card={nextAnnualFeeCard} compact />
            <View style={styles.renewalBodyText}>
              <Text style={styles.renewalCardName}>{nextAnnualFeeCard.name}</Text>
              <Text style={styles.renewalMeta}>
                {formatCurrency(nextAnnualFeeCard.annualFee)} • {formatAnnualFeeDueDate(nextAnnualFeeCard.annualFeeDueDate)}
              </Text>
              <Text style={styles.renewalNote}>
                {nextFeeOpenBenefit
                  ? `${formatCurrency(nextFeeOpenBenefit.remaining)} still left in ${nextFeeOpenBenefit.benefit.name}.`
                  : `${formatCurrency(nextFeeRedeemed)} already captured this cycle.`}
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      <View style={styles.bottomGrid}>
        <View style={styles.storyCard}>
          <Text style={styles.storyTitle}>Value unlocked</Text>
          <Text style={styles.storySubtitle}>
            Your strongest cards by redeemed value and still-open credits.
          </Text>

          <View style={styles.leaderList}>
            {valueLeaders.map((entry) => (
              <View key={entry.card.id} style={styles.leaderRow}>
                <View style={styles.leaderLeft}>
                  <CardThumbnail card={entry.card} compact />
                  <View style={styles.leaderText}>
                    <Text numberOfLines={1} style={styles.leaderName}>
                      {getDisplayName(entry.card)}
                    </Text>
                    <Text style={styles.leaderMeta}>
                      {formatCurrency(entry.redeemed)} claimed • {entry.openBenefits} open perks
                    </Text>
                  </View>
                </View>
                <View style={styles.leaderBadge}>
                  <Text style={styles.leaderBadgeValue}>{formatCurrency(entry.remaining)}</Text>
                  <Text style={styles.leaderBadgeLabel}>left</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.playbookCard}>
          <Text style={styles.storyTitle}>Best right now</Text>
          <Text style={styles.storySubtitle}>
            Fast defaults for your highest-frequency categories.
          </Text>

          <View style={styles.playbookList}>
            {bestRightNow.map((entry) =>
              entry.recommendation.card ? (
                <View key={entry.category} style={styles.playbookRow}>
                  <View style={styles.playbookCategory}>
                    <View style={styles.playbookIconWrap}>
                      <MaterialIcons
                        color={colors.primary}
                        name={iconForCategory(entry.category)}
                        size={20}
                      />
                    </View>
                    <View>
                      <Text style={styles.playbookLabel}>{categoryLabel(entry.category)}</Text>
                      <Text style={styles.playbookCardName}>{getDisplayName(entry.recommendation.card)}</Text>
                    </View>
                  </View>

                  <View style={styles.multiplierBadge}>
                    <Text style={styles.multiplierValue}>{entry.recommendation.multiplier}x</Text>
                  </View>
                </View>
              ) : null
            )}
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 32,
    backgroundColor: "#0D1736",
    padding: 24,
    shadowColor: "#081126",
    shadowOpacity: 0.26,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8
  },
  heroOrbLarge: {
    position: "absolute",
    right: -64,
    top: -84,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(79, 126, 255, 0.26)"
  },
  heroOrbSmall: {
    position: "absolute",
    right: 36,
    bottom: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.08)"
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#93AEFF"
  },
  heroTopRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16
  },
  heroTopRowCompact: {
    flexDirection: "column"
  },
  heroTextBlock: {
    flex: 1,
    gap: 10
  },
  heroKicker: {
    fontSize: 16,
    fontWeight: "700",
    color: "#DDE7FF"
  },
  heroAmount: {
    fontSize: 42,
    fontWeight: "800",
    color: "#FFFFFF"
  },
  heroBody: {
    maxWidth: 340,
    fontSize: 14,
    lineHeight: 21,
    color: "#DDE7FF"
  },
  heroStatStack: {
    gap: 10,
    minWidth: 132
  },
  heroStatPill: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)"
  },
  heroStatLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#AFC0F4"
  },
  heroStatValue: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF"
  },
  heroAlert: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 14,
    paddingVertical: 13
  },
  heroAlertText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: "#E6EEFF"
  },
  metricStack: {
    gap: 14
  },
  metricRow: {
    flexDirection: "row",
    gap: 14
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    shadowColor: "#B8C7E2",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4
  },
  metricIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  metricValue: {
    marginTop: 18,
    fontSize: 28,
    fontWeight: "800",
    color: colors.textPrimary
  },
  metricLabel: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary
  },
  splitValueCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 20,
    shadowColor: "#B8C7E2",
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4
  },
  splitValueCardCompact: {
    flexDirection: "column",
    alignItems: "flex-start"
  },
  splitValueSide: {
    flex: 1
  },
  splitValueSideRight: {
    alignItems: "flex-end"
  },
  splitValueLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary
  },
  splitValueNumber: {
    marginTop: 8,
    fontSize: 34,
    fontWeight: "800"
  },
  splitValueNumberSuccess: {
    color: colors.success
  },
  splitValueNumberPrimary: {
    color: colors.primary
  },
  splitDivider: {
    width: 1,
    height: 44,
    marginHorizontal: 18,
    backgroundColor: "#E7ECF5"
  },
  splitDividerCompact: {
    width: "100%",
    height: 1,
    marginHorizontal: 0,
    marginVertical: 16
  },
  sectionHeader: {
    marginTop: 2
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textPrimary
  },
  sectionCaption: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary
  },
  insightRail: {
    gap: 14,
    paddingRight: 10
  },
  insightCard: {
    width: 276,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(18, 28, 45, 0.04)"
  },
  insightIconBubble: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  insightTitle: {
    marginTop: 18,
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary
  },
  insightBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary
  },
  insightFooter: {
    marginTop: 18,
    fontSize: 13,
    fontWeight: "700"
  },
  renewalCard: {
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    padding: 20,
    shadowColor: "#B8C7E2",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3
  },
  renewalHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12
  },
  renewalHeaderRowCompact: {
    flexDirection: "column"
  },
  renewalHeaderText: {
    flex: 1
  },
  renewalEyebrow: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: colors.textSecondary
  },
  renewalTitle: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary
  },
  renewalBadge: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  renewalBadgeUrgent: {
    backgroundColor: "#FFF0E6"
  },
  renewalBadgeCalm: {
    backgroundColor: "#EEF4FF"
  },
  renewalBadgeText: {
    fontSize: 13,
    fontWeight: "800"
  },
  renewalBadgeTextUrgent: {
    color: colors.warning
  },
  renewalBadgeTextCalm: {
    color: colors.primary
  },
  renewalBodyRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  renewalBodyText: {
    flex: 1
  },
  renewalCardName: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary
  },
  renewalMeta: {
    marginTop: 5,
    fontSize: 13,
    color: colors.textSecondary
  },
  renewalNote: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: colors.primary
  },
  bottomGrid: {
    gap: 14
  },
  storyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 20,
    shadowColor: "#B8C7E2",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3
  },
  playbookCard: {
    backgroundColor: "#F1F5FF",
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: "#DEE8FF"
  },
  storyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary
  },
  storySubtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary
  },
  leaderList: {
    marginTop: 18,
    gap: 14
  },
  leaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  leaderLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  leaderText: {
    flex: 1
  },
  leaderName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary
  },
  leaderMeta: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textSecondary
  },
  leaderBadge: {
    minWidth: 70,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F6F8FC",
    alignItems: "flex-end"
  },
  leaderBadgeValue: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary
  },
  leaderBadgeLabel: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textSecondary
  },
  playbookList: {
    marginTop: 18,
    gap: 12
  },
  playbookRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 14
  },
  playbookCategory: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1
  },
  playbookIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center"
  },
  playbookLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: colors.textSecondary
  },
  playbookCardName: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary
  },
  multiplierBadge: {
    borderRadius: 999,
    backgroundColor: "#E3ECFF",
    paddingHorizontal: 14,
    paddingVertical: 9
  },
  multiplierValue: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary
  },
  emptyHero: {
    borderRadius: 32,
    padding: 24,
    backgroundColor: "#0D1736"
  },
  emptyEyebrow: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#93AEFF"
  },
  emptyTitle: {
    marginTop: 14,
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF"
  },
  emptySubtitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: "#DDE7FF"
  }
});

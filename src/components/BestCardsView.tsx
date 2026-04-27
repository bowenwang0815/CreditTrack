import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { colors, spacing } from "../theme";
import { SpendingCategory, TrackerCard } from "../types";
import { getBestCardForCategory } from "../utils/bestCard";
import {
  getCategoryLabel,
  getDisplayName,
  getRuleForCategory,
  getUnusedBenefitsCount
} from "../utils/cardHelpers";
import { annualFeeCountdown, formatCurrency, getNextAnnualFeeDate } from "../utils/date";
import { CardThumbnail } from "./CardThumbnail";

const featuredCategories: SpendingCategory[] = ["dining", "grocery", "travel"];
const allCategories: SpendingCategory[] = [
  "dining",
  "grocery",
  "gas",
  "travel",
  "flights",
  "hotels",
  "drugstores",
  "transit",
  "everything_else"
];

type AssistantReply = {
  title: string;
  body: string;
  footnote: string;
};

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

function matchCategory(query: string): SpendingCategory | null {
  const normalized = query.toLowerCase();
  const keywordMap: Array<[SpendingCategory, string[]]> = [
    ["hotels", ["hotel", "hotels", "stay", "marriott", "hyatt", "hilton"]],
    ["flights", ["flight", "flights", "airline", "plane", "airport"]],
    ["dining", ["dining", "dinner", "lunch", "restaurant", "food", "eat"]],
    ["grocery", ["grocery", "groceries", "supermarket", "market", "costco"]],
    ["gas", ["gas", "fuel", "shell", "chevron"]],
    ["drugstores", ["drugstore", "drug", "pharmacy", "cvs", "walgreens"]],
    ["transit", ["transit", "uber", "lyft", "train", "subway", "metro"]],
    ["travel", ["travel", "trip", "vacation", "booking"]],
    ["everything_else", ["everyday", "everything else", "catch all", "misc"]]
  ];

  for (const [category, keywords] of keywordMap) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return category;
    }
  }

  return null;
}

function getLargestUnusedBenefit(cards: TrackerCard[]) {
  return cards
    .flatMap((card) =>
      card.benefits.map((benefit) => ({
        card,
        benefit,
        remaining: Math.max(benefit.amountTotalThisPeriod - benefit.amountUsedThisPeriod, 0)
      }))
    )
    .filter((entry) => entry.remaining > 0)
    .sort((left, right) => right.remaining - left.remaining)[0];
}

function buildAssistantReply(query: string, cards: TrackerCard[]): AssistantReply {
  const activeCards = cards.filter((card) => card.isActive);
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return {
      title: "Ask about a category or perk",
      body: "Try asking which card to use for dinner, groceries, hotels, gas, or which credit you should use next.",
      footnote: "Local answers powered by your saved cards"
    };
  }

  const matchedCategory = matchCategory(normalized);
  if (matchedCategory) {
    const recommendation = getBestCardForCategory(activeCards, matchedCategory);
    if (recommendation.card) {
      const relatedBenefit = recommendation.card.benefits.find(
        (benefit) =>
          !benefit.isUsed &&
          (benefit.category === matchedCategory ||
            (matchedCategory === "travel" &&
              (benefit.category === "travel" ||
                benefit.category === "flights" ||
                benefit.category === "hotels")))
      );

      return {
        title: `Use ${getDisplayName(recommendation.card)}`,
        body: `${getDisplayName(recommendation.card)} is your best ${getCategoryLabel(
          matchedCategory
        ).toLowerCase()} card right now at ${recommendation.multiplier}x.`,
        footnote: relatedBenefit
          ? `Bonus angle: ${relatedBenefit.name} is still unused on this card`
          : "Chosen by highest multiplier, with ties leaning toward more unused perks"
      };
    }
  }

  if (
    normalized.includes("credit") ||
    normalized.includes("benefit") ||
    normalized.includes("unused") ||
    normalized.includes("perk")
  ) {
    const largestUnusedBenefit = getLargestUnusedBenefit(activeCards);
    if (largestUnusedBenefit) {
      return {
        title: `Use ${largestUnusedBenefit.benefit.name}`,
        body: `${largestUnusedBenefit.card.name} still has ${formatCurrency(
          largestUnusedBenefit.remaining
        )} left in ${largestUnusedBenefit.benefit.name}.`,
        footnote: `${largestUnusedBenefit.benefit.type} benefit still open`
      };
    }
  }

  if (
    normalized.includes("renew") ||
    normalized.includes("annual fee") ||
    normalized.includes("fee")
  ) {
    const nextFeeCard = [...activeCards]
      .filter((card) => card.annualFee > 0)
      .sort(
        (left, right) =>
          getNextAnnualFeeDate(left.annualFeeDueDate).getTime() -
          getNextAnnualFeeDate(right.annualFeeDueDate).getTime()
      )[0];

    if (nextFeeCard) {
      return {
        title: `${nextFeeCard.name} is next`,
        body: `${nextFeeCard.name} has the next annual fee at ${formatCurrency(
          nextFeeCard.annualFee
        )} and is ${annualFeeCountdown(nextFeeCard.annualFeeDueDate).toLowerCase()}.`,
        footnote: "Pulled from your saved annual fee dates"
      };
    }
  }

  const dining = getBestCardForCategory(activeCards, "dining");
  if (dining.card) {
    return {
      title: "Try a category question",
      body: `I can already answer things like “which card should I use for dinner?” and would currently pick ${getDisplayName(
        dining.card
      )} for dining.`,
      footnote: "This beta helper is local-first, not a cloud model yet"
    };
  }

  return {
    title: "Add a few cards first",
    body: "Once your wallet has active cards, I can recommend the best one for each category and surface unused perks.",
    footnote: "Local answers powered by your saved cards"
  };
}

export function BestCardsView({ cards }: { cards: TrackerCard[] }) {
  const activeCards = useMemo(() => cards.filter((card) => card.isActive), [cards]);
  const [query, setQuery] = useState("");
  const [reply, setReply] = useState<AssistantReply | null>(null);

  const featuredRecommendations = useMemo(
    () =>
      featuredCategories.map((category) => ({
        category,
        recommendation: getBestCardForCategory(activeCards, category)
      })),
    [activeCards]
  );

  const allRecommendations = useMemo(
    () =>
      allCategories.map((category) => ({
        category,
        recommendation: getBestCardForCategory(activeCards, category)
      })),
    [activeCards]
  );

  const totalMappedCategories = allRecommendations.filter(
    (item) => item.recommendation.card
  ).length;

  const suggestionChips = [
    "Which card for dinner tonight?",
    "What credit should I use next?",
    "Best card for hotels?",
    "Which annual fee hits next?"
  ];

  function askQuestion(nextQuery?: string) {
    const question = nextQuery ?? query;
    setQuery(question);
    setReply(buildAssistantReply(question, activeCards));
  }

  if (activeCards.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>Best card recommendations start here.</Text>
        <Text style={styles.emptyBody}>
          Add a few cards and this tab will turn into your swipe decision engine for dining,
          travel, groceries, gas, and more.
        </Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.heroCard}>
        <View style={styles.heroGlowLarge} />
        <View style={styles.heroGlowSmall} />
        <Text style={styles.heroEyebrow}>Best card engine</Text>
        <Text style={styles.heroTitle}>Know the right card before you tap.</Text>
        <Text style={styles.heroBody}>
          We’re ranking your saved cards by spend category and nudging ties toward cards with
          more unused perks.
        </Text>

        <View style={styles.heroStatRow}>
          <View style={styles.heroStatPill}>
            <Text style={styles.heroStatLabel}>Cards active</Text>
            <Text style={styles.heroStatValue}>{activeCards.length}</Text>
          </View>
          <View style={styles.heroStatPill}>
            <Text style={styles.heroStatLabel}>Categories covered</Text>
            <Text style={styles.heroStatValue}>{totalMappedCategories}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your quick defaults</Text>
        <Text style={styles.sectionCaption}>The categories you’ll reach for the most.</Text>
      </View>

      <View style={styles.featuredGrid}>
        {featuredRecommendations.map(({ category, recommendation }) => {
          const rule = recommendation.card
            ? getRuleForCategory(recommendation.card, category)
            : undefined;

          return (
            <View key={category} style={styles.featuredCard}>
              <View style={styles.featuredIconBubble}>
                <MaterialIcons color={colors.primary} name={iconForCategory(category)} size={22} />
              </View>

              <Text style={styles.featuredLabel}>{getCategoryLabel(category)}</Text>
              {recommendation.card ? (
                <>
                  <View style={styles.featuredCardRow}>
                    <CardThumbnail card={recommendation.card} compact />
                    <View style={styles.featuredTextBlock}>
                      <Text numberOfLines={1} style={styles.featuredName}>
                        {getDisplayName(recommendation.card)}
                      </Text>
                      <Text style={styles.featuredMeta}>
                        {recommendation.multiplier}x • {getUnusedBenefitsCount(recommendation.card)} open perks
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.featuredNote}>
                    {rule?.notes ?? "Highest current multiplier in your wallet"}
                  </Text>
                </>
              ) : (
                <Text style={styles.featuredEmpty}>No active card covers this category yet.</Text>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>All recommendation lanes</Text>
        <Text style={styles.sectionCaption}>A cleaner full view across every major spend type.</Text>
      </View>

      <View style={styles.listCard}>
        {allRecommendations.map(({ category, recommendation }, index) => (
          <View
            key={category}
            style={[styles.listRow, index === allRecommendations.length - 1 && styles.listRowLast]}
          >
            <View style={styles.listLeft}>
              <View style={styles.listIconBubble}>
                <MaterialIcons color={colors.primary} name={iconForCategory(category)} size={18} />
              </View>
              <View style={styles.listTextBlock}>
                <Text style={styles.listTitle}>{getCategoryLabel(category)}</Text>
                <Text style={styles.listSubtitle}>
                  {recommendation.card
                    ? `${getDisplayName(recommendation.card)} • ${recommendation.multiplier}x`
                    : "No active recommendation yet"}
                </Text>
              </View>
            </View>

            {recommendation.card ? (
              <View style={styles.multiplierBadge}>
                <Text style={styles.multiplierText}>{recommendation.multiplier}x</Text>
              </View>
            ) : null}
          </View>
        ))}
      </View>

      <View style={styles.askCard}>
        <View style={styles.askHeader}>
          <View>
            <Text style={styles.askTitle}>Ask CardPilot beta</Text>
            <Text style={styles.askSubtitle}>
              Instant local answers from your saved cards. No API key needed.
            </Text>
          </View>
          <View style={styles.askBetaPill}>
            <Text style={styles.askBetaText}>Free</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          contentContainerStyle={styles.suggestionRow}
          showsHorizontalScrollIndicator={false}
        >
          {suggestionChips.map((suggestion) => (
            <Pressable
              key={suggestion}
              onPress={() => askQuestion(suggestion)}
              style={styles.suggestionChip}
            >
              <Text style={styles.suggestionChipText}>{suggestion}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.askComposer}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Ask about dining, hotels, unused benefits, or fees"
            placeholderTextColor="#97A1B5"
            style={styles.askInput}
          />
          <Pressable onPress={() => askQuestion()} style={styles.askButton}>
            <Text style={styles.askButtonText}>Ask</Text>
          </Pressable>
        </View>

        <View style={styles.replyCard}>
          <Text style={styles.replyTitle}>{reply?.title ?? "Try a question above"}</Text>
          <Text style={styles.replyBody}>
            {reply?.body ??
              "This beta helper already understands category questions, unused credit questions, and fee timing from your local card data."}
          </Text>
          <Text style={styles.replyFootnote}>
            {reply?.footnote ?? "Cloud LLM optional later. Local answers today."}
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 30,
    backgroundColor: "#0D1736",
    padding: 24,
    shadowColor: "#081126",
    shadowOpacity: 0.24,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8
  },
  heroGlowLarge: {
    position: "absolute",
    right: -60,
    top: -70,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "rgba(79, 126, 255, 0.25)"
  },
  heroGlowSmall: {
    position: "absolute",
    left: -28,
    bottom: -38,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255, 255, 255, 0.06)"
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#93AEFF"
  },
  heroTitle: {
    marginTop: 14,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "800",
    color: "#FFFFFF"
  },
  heroBody: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: "#DDE7FF",
    maxWidth: 360
  },
  heroStatRow: {
    marginTop: 18,
    flexDirection: "row",
    gap: 12
  },
  heroStatPill: {
    flex: 1,
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
  featuredGrid: {
    gap: 14
  },
  featuredCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 20,
    shadowColor: "#B8C7E2",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4
  },
  featuredIconBubble: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF4FF"
  },
  featuredLabel: {
    marginTop: 16,
    fontSize: 17,
    fontWeight: "800",
    color: colors.textPrimary
  },
  featuredCardRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  featuredTextBlock: {
    flex: 1
  },
  featuredName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary
  },
  featuredMeta: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary
  },
  featuredNote: {
    marginTop: 14,
    fontSize: 13,
    lineHeight: 19,
    color: colors.primary
  },
  featuredEmpty: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary
  },
  listCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    paddingHorizontal: 20,
    shadowColor: "#B8C7E2",
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 3
  },
  listRow: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  listRowLast: {
    borderBottomWidth: 0
  },
  listLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1
  },
  listIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center"
  },
  listTextBlock: {
    flex: 1
  },
  listTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary
  },
  listSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary
  },
  multiplierBadge: {
    borderRadius: 999,
    backgroundColor: "#E3ECFF",
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  multiplierText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary
  },
  askCard: {
    backgroundColor: "#F1F5FF",
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: "#DEE8FF"
  },
  askHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12
  },
  askTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary
  },
  askSubtitle: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    maxWidth: 260
  },
  askBetaPill: {
    borderRadius: 999,
    backgroundColor: "#DBF8EA",
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  askBetaText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.success
  },
  suggestionRow: {
    gap: 10,
    marginTop: 18,
    paddingRight: 6
  },
  suggestionChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E4FF"
  },
  suggestionChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary
  },
  askComposer: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10
  },
  askInput: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D9E4FF",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary
  },
  askButton: {
    borderRadius: 18,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  askButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF"
  },
  replyCard: {
    marginTop: 16,
    borderRadius: 22,
    padding: 18,
    backgroundColor: "#FFFFFF"
  },
  replyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textPrimary
  },
  replyBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary
  },
  replyFootnote: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textPrimary
  },
  emptyBody: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary
  }
});

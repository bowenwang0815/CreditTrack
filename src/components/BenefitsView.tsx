import React, { useMemo, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme";
import { TrackerCard } from "../types";
import { BenefitListItem } from "./BenefitListItem";
import { BenefitUsageModal } from "./BenefitUsageModal";
import { CardThumbnail } from "./CardThumbnail";

type BenefitEntry = {
  benefitId: string;
  card: TrackerCard;
  benefit: TrackerCard["benefits"][number];
};

export function BenefitsView({
  cards,
  onMarkBenefitUsed,
  onResetBenefit,
  onUpdateBenefitUsage
}: {
  cards: TrackerCard[];
  onMarkBenefitUsed: (cardId: string, benefitId: string) => void;
  onResetBenefit: (cardId: string, benefitId: string) => void;
  onUpdateBenefitUsage: (cardId: string, benefitId: string, amountUsed: number) => void;
}) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedBenefitKey, setSelectedBenefitKey] = useState<string | null>(null);

  const cardsWithBenefits = useMemo(
    () => cards.filter((card) => card.benefits.length > 0),
    [cards]
  );

  const benefitEntries = useMemo(() => {
    const entries = cardsWithBenefits.flatMap((card) =>
      card.benefits.map((benefit) => ({
        benefitId: benefit.id,
        card,
        benefit
      }))
    );

    return entries
      .filter((entry) => (selectedCardId ? entry.card.id === selectedCardId : true))
      .sort((left, right) => {
        if (left.benefit.isUsed !== right.benefit.isUsed) {
          return left.benefit.isUsed ? 1 : -1;
        }

        if (left.card.name !== right.card.name) {
          return left.card.name.localeCompare(right.card.name);
        }

        return left.benefit.name.localeCompare(right.benefit.name);
      });
  }, [cardsWithBenefits, selectedCardId]);

  const selectedBenefitEntry = useMemo(
    () =>
      benefitEntries.find(
        (entry) => `${entry.card.id}:${entry.benefitId}` === selectedBenefitKey
      ) ?? null,
    [benefitEntries, selectedBenefitKey]
  );

  return (
    <>
      <View style={styles.headerCard}>
        <View>
          <Text style={styles.headerTitle}>Benefits</Text>
          <Text style={styles.headerSubtitle}>
            Track every credit and perk by card so nothing gets wasted.
          </Text>
        </View>

        <Pressable onPress={() => setSelectedCardId(null)} style={styles.resetButton}>
          <Feather color={colors.textPrimary} name="rotate-ccw" size={16} />
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        contentContainerStyle={styles.filterRow}
        showsHorizontalScrollIndicator={false}
      >
        {cardsWithBenefits.map((card) => {
          const isSelected = selectedCardId === card.id;
          return (
            <Pressable
              key={card.id}
              onPress={() => setSelectedCardId(isSelected ? null : card.id)}
              style={[styles.filterChip, isSelected && styles.filterChipSelected]}
            >
              <CardThumbnail card={card} compact />
              <Text
                numberOfLines={1}
                style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}
              >
                {card.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {benefitEntries.length > 0 ? (
        benefitEntries.map((entry: BenefitEntry) => (
          <BenefitListItem
            key={entry.benefitId}
            benefit={entry.benefit}
            card={entry.card}
            onPress={() => setSelectedBenefitKey(`${entry.card.id}:${entry.benefitId}`)}
            onMarkUsed={() => onMarkBenefitUsed(entry.card.id, entry.benefitId)}
            onReset={() => onResetBenefit(entry.card.id, entry.benefitId)}
          />
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No benefits here yet</Text>
          <Text style={styles.emptySubtitle}>
            Add a card with credits or clear the current card filter.
          </Text>
        </View>
      )}

      {selectedBenefitEntry ? (
        <BenefitUsageModal
          benefit={selectedBenefitEntry.benefit}
          card={selectedBenefitEntry.card}
          onClose={() => setSelectedBenefitKey(null)}
          onSave={(amountUsed) =>
            onUpdateBenefitUsage(
              selectedBenefitEntry.card.id,
              selectedBenefitEntry.benefitId,
              amountUsed
            )
          }
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.textPrimary
  },
  headerSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    maxWidth: 240
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#F4F6FB"
  },
  resetText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary
  },
  filterRow: {
    gap: 10,
    paddingRight: 8
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 180,
    maxWidth: 240,
    padding: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#FFFFFF"
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  filterChipText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary
  },
  filterChipTextSelected: {
    color: "#FFFFFF"
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: spacing.xl
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary
  }
});

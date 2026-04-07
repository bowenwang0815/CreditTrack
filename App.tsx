import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { AddCardModal } from "./src/components/AddCardModal";
import { BenefitListItem } from "./src/components/BenefitListItem";
import { CardDetailModal } from "./src/components/CardDetailModal";
import { CardListItem } from "./src/components/CardListItem";
import { BestCardRow } from "./src/components/BestCardRow";
import { useCardStore } from "./src/hooks/useCardStore";
import { SpendingCategory, TabKey } from "./src/types";
import { colors, spacing } from "./src/theme";
import { getBestCardForCategory } from "./src/utils/bestCard";

const recommendationCategories: SpendingCategory[] = [
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

export default function App() {
  const {
    cards,
    ready,
    addCardFromTemplate,
    markBenefitUsed,
    resetBenefit,
    archiveCard
  } = useCardStore();

  const [activeTab, setActiveTab] = useState<TabKey>("cards");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const unusedBenefits = useMemo(
    () =>
      cards
        .flatMap((card) =>
          card.benefits
            .filter((benefit) => !benefit.isUsed)
            .map((benefit) => ({ benefit, card }))
        )
        .sort((left, right) => left.card.name.localeCompare(right.card.name)),
    [cards]
  );

  const recommendations = useMemo(
    () =>
      recommendationCategories.map((category) => ({
        category,
        recommendation: getBestCardForCategory(cards, category)
      })),
    [cards]
  );

  const activeCards = useMemo(
    () =>
      [...cards].sort((left, right) => {
        if (left.isActive === right.isActive) {
          return left.name.localeCompare(right.name);
        }
        return left.isActive ? -1 : 1;
      }),
    [cards]
  );

  const selectedCard = useMemo(
    () => cards.find((card) => card.id === selectedCardId) ?? null,
    [cards, selectedCardId]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="dark" />
      <StatusBar barStyle="dark-content" />

      <View style={styles.appShell}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>CardPilot</Text>
            <Text style={styles.subtitle}>
              Track fees, credits, and the best card for every swipe.
            </Text>
          </View>

          {activeTab === "cards" ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsAddModalOpen(true)}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.tabBar}>
          {[
            ["cards", "Cards"],
            ["best", "Best Card"],
            ["benefits", "Benefits"],
            ["settings", "Settings"]
          ].map(([key, label]) => {
            const isActive = activeTab === key;
            return (
              <Pressable
                key={key}
                onPress={() => setActiveTab(key as TabKey)}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
              >
                <Text
                  style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {!ready ? (
          <View style={styles.loadingState}>
            <Text style={styles.loadingTitle}>Loading your wallet...</Text>
            <Text style={styles.loadingSubtitle}>
              Pulling in local cards and benefits.
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === "cards" ? (
              <>
                {activeCards.map((card) => (
                  <CardListItem
                    key={card.id}
                    card={card}
                    onPress={() => setSelectedCardId(card.id)}
                  />
                ))}
                {activeCards.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>No cards yet</Text>
                    <Text style={styles.emptySubtitle}>
                      Add a starter template to begin tracking benefits and annual fees.
                    </Text>
                  </View>
                ) : null}
              </>
            ) : null}

            {activeTab === "best" ? (
              <>
                {recommendations.map(({ category, recommendation }) => (
                  <BestCardRow
                    key={category}
                    category={category}
                    recommendation={recommendation}
                  />
                ))}
              </>
            ) : null}

            {activeTab === "benefits" ? (
              <>
                {unusedBenefits.map(({ benefit, card }) => (
                  <BenefitListItem
                    key={benefit.id}
                    benefit={benefit}
                    cardName={card.name}
                    onMarkUsed={() => markBenefitUsed(card.id, benefit.id)}
                  />
                ))}
                {unusedBenefits.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>All benefits used</Text>
                    <Text style={styles.emptySubtitle}>
                      Nice work. When a new cycle starts, reset a benefit from the card detail view.
                    </Text>
                  </View>
                ) : null}
              </>
            ) : null}

            {activeTab === "settings" ? (
              <View style={styles.settingsCard}>
                <Text style={styles.sectionTitle}>Local-first setup</Text>
                <Text style={styles.settingsText}>
                  Your cards and benefits are stored only on this device with AsyncStorage.
                </Text>
                <Text style={styles.sectionTitle}>What&apos;s next</Text>
                <Text style={styles.settingsText}>
                  Local reminders and smarter value tracking are the next best upgrades for this personal-use version.
                </Text>
              </View>
            ) : null}
          </ScrollView>
        )}
      </View>

      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={isAddModalOpen}
        onRequestClose={() => setIsAddModalOpen(false)}
      >
        <AddCardModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={(payload) => {
            addCardFromTemplate(payload);
            setIsAddModalOpen(false);
          }}
        />
      </Modal>

      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={selectedCard !== null}
        onRequestClose={() => setSelectedCardId(null)}
      >
        {selectedCard ? (
          <CardDetailModal
            card={selectedCard}
            onClose={() => setSelectedCardId(null)}
            onArchive={() => {
              archiveCard(selectedCard.id);
              setSelectedCardId(null);
            }}
            onMarkBenefitUsed={(benefitId) => markBenefitUsed(selectedCard.id, benefitId)}
            onResetBenefit={(benefitId) => resetBenefit(selectedCard.id, benefitId)}
          />
        ) : null}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  appShell: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.textPrimary
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    maxWidth: 260
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14
  },
  tabBar: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: "#E9EDF5",
    borderRadius: 18,
    padding: 4
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14
  },
  tabButtonActive: {
    backgroundColor: "#FFFFFF"
  },
  tabButtonText: {
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600"
  },
  tabButtonTextActive: {
    color: colors.textPrimary
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md
  },
  loadingState: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: spacing.xl
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary
  },
  loadingSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary
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
  },
  settingsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: spacing.xl,
    gap: 10
  },
  sectionTitle: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary
  },
  settingsText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary
  }
});

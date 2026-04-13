import React, { useMemo, useState } from "react";
import { Feather } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { AddCardModal } from "./src/components/AddCardModal";
import { BenefitsView } from "./src/components/BenefitsView";
import { CardDetailModal } from "./src/components/CardDetailModal";
import { CardListItem } from "./src/components/CardListItem";
import { BestCardRow } from "./src/components/BestCardRow";
import { DashboardView } from "./src/components/DashboardView";
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
  const { width } = useWindowDimensions();
  const isCompact = width < 440;
  const {
    cards,
    ready,
    addCardFromTemplate,
    markBenefitUsed,
    resetBenefit,
    updateBenefitUsage,
    deleteCard,
    resetAllCards
  } = useCardStore();

  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
        {activeTab === "cards" ? (
          <View style={[styles.cardsHeader, isCompact && styles.cardsHeaderCompact]}>
            <Text style={[styles.cardsTitle, isCompact && styles.cardsTitleCompact]}>My Cards</Text>
            <View style={styles.cardsHeaderActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => console.log("[CardsHeader] menu pressed")}
                style={[styles.iconButtonGhost, isCompact && styles.iconButtonGhostCompact]}
              >
                <Feather color={colors.icon} name="menu" size={isCompact ? 24 : 28} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => setIsAddModalOpen(true)}
                style={[styles.floatingAddButton, isCompact && styles.floatingAddButtonCompact]}
              >
                <Feather color={colors.textSecondary} name="plus" size={isCompact ? 24 : 28} />
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>CardPilot</Text>
              <Text style={styles.subtitle}>
                Track fees, credits, and the best card for every swipe.
              </Text>
            </View>
          </View>
        )}

        {!ready ? (
          <View style={styles.loadingState}>
            <Text style={styles.loadingTitle}>Loading your wallet...</Text>
            <Text style={styles.loadingSubtitle}>
              Pulling in local cards and benefits.
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[styles.scrollContent, isCompact && styles.scrollContentCompact]}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === "dashboard" ? <DashboardView cards={cards} /> : null}

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
              <BenefitsView
                cards={activeCards}
                onUpdateBenefitUsage={updateBenefitUsage}
              />
            ) : null}

            {activeTab === "settings" ? (
              <View style={styles.settingsCard}>
                <Text style={styles.sectionTitle}>Local-first setup</Text>
                <Text style={styles.settingsText}>
                  New users start with an empty wallet. Cards you add are stored only on this
                  device or browser with AsyncStorage, so they stay after refreshes and reopenings.
                </Text>
                <Text style={styles.sectionTitle}>Reset local data</Text>
                <Text style={styles.settingsText}>
                  Need a clean slate? This clears every saved card and benefit from this device.
                </Text>
                <Pressable
                  onPress={() => {
                    resetAllCards().catch(() => undefined);
                    setSelectedCardId(null);
                    setIsAddModalOpen(false);
                    setActiveTab("cards");
                  }}
                  style={styles.resetButton}
                >
                  <Text style={styles.resetButtonText}>Clear all local cards</Text>
                </Pressable>
                <Text style={styles.sectionTitle}>What&apos;s next</Text>
                <Text style={styles.settingsText}>
                  Local reminders and smarter value tracking are the next best upgrades for this personal-use version.
                </Text>
                <Text style={styles.madeBy}>Made by Bowen with a heart</Text>
              </View>
            ) : null}
          </ScrollView>
        )}

        <View style={styles.bottomTabBar}>
          {[
            ["dashboard", "Home"],
            ["cards", "Cards"],
            ["best", "Best"],
            ["benefits", "Benefits"],
            ["settings", "Settings"]
          ].map(([key, label]) => {
            const isActive = activeTab === key;
            const iconName =
              key === "dashboard"
                ? "home"
                : key === "cards"
                  ? "credit-card"
                  : key === "best"
                    ? "award"
                    : key === "benefits"
                      ? "gift"
                      : "more-horizontal";
            return (
              <Pressable
                key={key}
                onPress={() => {
                  console.log("[BottomNav] pressed:", key);
                  setActiveTab(key as TabKey);
                }}
                style={styles.bottomTabButton}
              >
                <View style={styles.bottomTabPill}>
                  <Feather
                    color={isActive ? colors.primary : colors.icon}
                    name={iconName as keyof typeof Feather.glyphMap}
                    size={23}
                  />
                  <Text
                    style={[
                      styles.bottomTabText,
                      isActive && styles.bottomTabTextActive
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
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
            onDelete={() => {
              deleteCard(selectedCard.id);
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md
  },
  cardsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 22
  },
  cardsHeaderCompact: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18
  },
  cardsTitle: {
    fontSize: 38,
    fontWeight: "800",
    color: colors.textPrimary
  },
  cardsTitleCompact: {
    fontSize: 28
  },
  cardsHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  iconButtonGhost: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center"
  },
  iconButtonGhostCompact: {
    width: 40,
    height: 40
  },
  floatingAddButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F4F6FB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8090AE",
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7
  },
  floatingAddButtonCompact: {
    width: 56,
    height: 56,
    borderRadius: 28
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
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 128,
    gap: spacing.md
  },
  scrollContentCompact: {
    paddingHorizontal: 12,
    gap: 12
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
  },
  resetButton: {
    alignSelf: "flex-start",
    marginTop: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#FEE4E2"
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#D92D20"
  },
  madeBy: {
    marginTop: spacing.md,
    fontSize: 13,
    color: colors.textSecondary
  },
  bottomTabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E4E8F1",
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 22,
    shadowColor: "#7B8BA8",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6
  },
  bottomTabButton: {
    flex: 1
  },
  bottomTabPill: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 52
  },
  bottomTabText: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
    color: colors.icon
  },
  bottomTabTextActive: {
    color: colors.primary
  }
});

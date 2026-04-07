import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme";
import { TrackerCard } from "../types";
import { getDisplayName, getSortedRules, getUnusedBenefitsCount } from "../utils/cardHelpers";
import { annualFeeCountdown, formatCurrency, formatDate } from "../utils/date";
import { CardThumbnail } from "./CardThumbnail";
import { CategoryChip } from "./CategoryChip";
import { Pill } from "./Pill";

export function CardDetailModal({
  card,
  onClose,
  onDelete,
  onMarkBenefitUsed,
  onResetBenefit
}: {
  card: TrackerCard;
  onClose: () => void;
  onDelete: () => void;
  onMarkBenefitUsed: (benefitId: string) => void;
  onResetBenefit: (benefitId: string) => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFinalDeleteConfirm, setShowFinalDeleteConfirm] = useState(false);

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={onClose}>
          <Text style={styles.topButton}>Close</Text>
        </Pressable>
        <Text style={styles.topTitle}>{card.name}</Text>
        <Pressable onPress={() => setShowDeleteConfirm(true)}>
          <Text style={styles.deleteButton}>Delete</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <CardThumbnail card={card} />
          <View style={styles.heroText}>
            <Text style={styles.heroName}>{getDisplayName(card)}</Text>
            <Text style={styles.heroMeta}>{card.issuer}</Text>
            {card.last4 ? <Text style={styles.heroMeta}>•••• {card.last4}</Text> : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Annual fee</Text>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.amount}>{formatCurrency(card.annualFee)}</Text>
              <Text style={styles.sectionMeta}>{formatDate(card.annualFeeDueDate)}</Text>
            </View>
            <Pill label={annualFeeCountdown(card.annualFeeDueDate)} tone="warning" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earning categories</Text>
          <View style={styles.wrap}>
            {getSortedRules(card).map((rule) => (
              <CategoryChip key={rule.id} rule={rule} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benefits</Text>
          <Text style={styles.sectionMeta}>{getUnusedBenefitsCount(card)} still unused</Text>
          <View style={styles.benefitList}>
            {card.benefits.map((benefit) => (
              <View key={benefit.id} style={styles.benefitCard}>
                <View style={styles.rowBetween}>
                  <View style={styles.benefitText}>
                    <Text style={styles.benefitName}>{benefit.name}</Text>
                    <Text style={styles.sectionMeta}>
                      {benefit.type} • {benefit.expirationRule}
                    </Text>
                  </View>
                  <Pill label={benefit.isUsed ? "Used" : "Unused"} tone={benefit.isUsed ? "success" : "warning"} />
                </View>
                <Text style={styles.sectionMeta}>
                  {formatCurrency(benefit.amountUsedThisPeriod)} of {formatCurrency(benefit.amountTotalThisPeriod)}
                </Text>
                <Pressable
                  onPress={() =>
                    benefit.isUsed ? onResetBenefit(benefit.id) : onMarkBenefitUsed(benefit.id)
                  }
                  style={styles.actionButton}
                >
                  <Text style={styles.actionText}>{benefit.isUsed ? "Reset" : "Mark used"}</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        {card.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{card.notes}</Text>
          </View>
        ) : null}
      </ScrollView>

      {showDeleteConfirm ? (
        <View style={styles.overlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Delete this card?</Text>
            <Text style={styles.confirmBody}>
              Remove {card.name} from CardPilot? This will remove it from your card list.
            </Text>
            <View style={styles.confirmActions}>
              <Pressable
                onPress={() => setShowDeleteConfirm(false)}
                style={styles.confirmCancelButton}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowDeleteConfirm(false);
                  setShowFinalDeleteConfirm(true);
                }}
                style={styles.confirmDeleteButton}
              >
                <Text style={styles.confirmDeleteText}>Continue</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}

      {showFinalDeleteConfirm ? (
        <View style={styles.overlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Final confirmation</Text>
            <Text style={styles.confirmBody}>
              Are you sure you want to permanently delete {card.name}?
            </Text>
            <View style={styles.confirmActions}>
              <Pressable
                onPress={() => setShowFinalDeleteConfirm(false)}
                style={styles.confirmCancelButton}
              >
                <Text style={styles.confirmCancelText}>No</Text>
              </Pressable>
              <Pressable
                onPress={onDelete}
                style={styles.confirmDeleteButton}
              >
                <Text style={styles.confirmDeleteText}>Delete card</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md
  },
  topButton: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary
  },
  deleteButton: {
    fontSize: 15,
    fontWeight: "700",
    color: "#D92D20"
  },
  topTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md
  },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.lg,
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center"
  },
  heroText: {
    flex: 1
  },
  heroName: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary
  },
  heroMeta: {
    marginTop: 5,
    fontSize: 14,
    color: colors.textSecondary
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.lg
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary
  },
  sectionMeta: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textSecondary
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  amount: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 14
  },
  benefitList: {
    marginTop: 12,
    gap: 12
  },
  benefitCard: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: spacing.md
  },
  benefitText: {
    flex: 1
  },
  benefitName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary
  },
  actionButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 12
  },
  actionText: {
    color: "#FFFFFF",
    fontWeight: "700"
  },
  notes: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 19, 40, 0.28)",
    justifyContent: "center",
    padding: spacing.lg
  },
  confirmCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary
  },
  confirmBody: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary
  },
  confirmActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: spacing.lg
  },
  confirmCancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#EEF2F7"
  },
  confirmCancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary
  },
  confirmDeleteButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#FEE4E2"
  },
  confirmDeleteText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#D92D20"
  }
});

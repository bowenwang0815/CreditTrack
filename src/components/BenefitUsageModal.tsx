import React, { useMemo, useState } from "react";
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { colors, spacing } from "../theme";
import { Benefit, TrackerCard } from "../types";
import { formatCurrency } from "../utils/date";
import {
  getBenefitPeriodLabel,
  getSortedUsageHistory
} from "../utils/benefits";
import { CardThumbnail } from "./CardThumbnail";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function BenefitUsageModal({
  benefit,
  card,
  onClose,
  onSave
}: {
  benefit: Benefit;
  card: TrackerCard;
  onClose: () => void;
  onSave: (amountUsed: number) => void;
}) {
  const [draftAmount, setDraftAmount] = useState(benefit.amountUsedThisPeriod);
  const [sliderWidth, setSliderWidth] = useState(1);
  const history = useMemo(() => getSortedUsageHistory(benefit), [benefit]);
  const remaining = Math.max(benefit.amountTotalThisPeriod - draftAmount, 0);
  const progress =
    benefit.amountTotalThisPeriod > 0
      ? draftAmount / benefit.amountTotalThisPeriod
      : 0;

  function updateFromGesture(event: GestureResponderEvent) {
    const locationX = event.nativeEvent.locationX ?? 0;
    const nextRatio = clamp(locationX / sliderWidth, 0, 1);
    setDraftAmount(Math.round(nextRatio * benefit.amountTotalThisPeriod));
  }

  function handleSliderLayout(event: LayoutChangeEvent) {
    setSliderWidth(Math.max(event.nativeEvent.layout.width, 1));
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      transparent
      visible
    >
      <View style={styles.overlay}>
        <Pressable style={styles.overlayBackdrop} onPress={onClose} />
        <View style={styles.sheetCard}>
          <View style={styles.topBar}>
            <Text style={styles.title}>Benefit usage</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.closeText}>Done</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.heroRow}>
              <CardThumbnail card={card} />
              <View style={styles.heroText}>
                <Text style={styles.benefitName}>{benefit.name}</Text>
                <Text style={styles.meta}>{card.name}</Text>
                <Text style={styles.meta}>
                  {benefit.currentPeriodLabel ?? getBenefitPeriodLabel(benefit.type)}
                </Text>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>This period</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(draftAmount)} of {formatCurrency(benefit.amountTotalThisPeriod)}
              </Text>
              <Text style={styles.summarySecondary}>
                {remaining > 0 ? `${formatCurrency(remaining)} left` : "Fully used"}
              </Text>
            </View>

            <View style={styles.sliderBlock}>
              <Text style={styles.sectionLabel}>Adjust usage</Text>
              <View
                onLayout={handleSliderLayout}
                onMoveShouldSetResponder={() => true}
                onResponderGrant={updateFromGesture}
                onResponderMove={updateFromGesture}
                onStartShouldSetResponder={() => true}
                style={styles.sliderTrack}
              >
                <View
                  style={[
                    styles.sliderFill,
                    { width: `${Math.max(progress * 100, draftAmount > 0 ? 6 : 0)}%` }
                  ]}
                />
                <View style={[styles.sliderThumb, { left: `${Math.max(progress * 100, 0)}%` }]} />
              </View>

              <View style={styles.sliderButtons}>
                <Pressable
                  onPress={() =>
                    setDraftAmount((current) =>
                      clamp(current - 5, 0, benefit.amountTotalThisPeriod)
                    )
                  }
                  style={styles.adjustButton}
                >
                  <Text style={styles.adjustButtonText}>-5</Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    setDraftAmount((current) =>
                      clamp(current + 5, 0, benefit.amountTotalThisPeriod)
                    )
                  }
                  style={styles.adjustButton}
                >
                  <Text style={styles.adjustButtonText}>+5</Text>
                </Pressable>
                <Pressable
                  onPress={() => setDraftAmount(benefit.amountTotalThisPeriod)}
                  style={styles.adjustButton}
                >
                  <Text style={styles.adjustButtonText}>Max</Text>
                </Pressable>
                <Pressable onPress={() => setDraftAmount(0)} style={styles.adjustButton}>
                  <Text style={styles.adjustButtonText}>Clear</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.historyBlock}>
              <Text style={styles.sectionLabel}>Usage history</Text>
              {history.length > 0 ? (
                history.map((entry) => (
                  <View key={entry.id} style={styles.historyRow}>
                    <View>
                      <Text style={styles.historyLabel}>{entry.periodLabel}</Text>
                      <Text style={styles.historyMeta}>
                        {new Date(entry.updatedAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.historyAmount}>{formatCurrency(entry.amountUsed)}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>
                  No usage saved yet for this benefit.
                </Text>
              )}
            </View>

            <Pressable
              onPress={() => {
                onSave(draftAmount);
                onClose();
              }}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>Save usage</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 19, 40, 0.28)",
    justifyContent: "flex-end"
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject
  },
  sheetCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "88%",
    paddingTop: spacing.lg
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary
  },
  closeText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  heroText: {
    flex: 1
  },
  benefitName: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary
  },
  meta: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary
  },
  summaryCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: 20,
    backgroundColor: "#F4F7FC"
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary
  },
  summaryValue: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: "800",
    color: colors.textPrimary
  },
  summarySecondary: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary
  },
  sliderBlock: {
    marginTop: spacing.lg
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary
  },
  sliderTrack: {
    marginTop: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: "#E6EBF4",
    overflow: "visible",
    position: "relative"
  },
  sliderFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.primary
  },
  sliderThumb: {
    position: "absolute",
    top: -5,
    marginLeft: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: colors.primary,
    shadowColor: "#6E85B5",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  sliderButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14
  },
  adjustButton: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#EEF2F7"
  },
  adjustButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary
  },
  historyBlock: {
    marginTop: spacing.xl
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  historyLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary
  },
  historyMeta: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textSecondary
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary
  },
  saveButton: {
    marginTop: spacing.xl,
    borderRadius: 18,
    backgroundColor: colors.primary,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center"
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700"
  }
});

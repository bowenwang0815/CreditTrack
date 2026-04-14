import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { colors, spacing } from "../theme";
import { TrackerCard } from "../types";
import { getDisplayName, getSortedRules, getUnusedBenefitsCount } from "../utils/cardHelpers";
import {
  annualFeeCountdown,
  formatAnnualFeeDueDate,
  formatCurrency
} from "../utils/date";
import { CardThumbnail } from "./CardThumbnail";
import { CategoryChip } from "./CategoryChip";
import { Pill } from "./Pill";

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildDateIso(year: number, monthIndex: number, day: number) {
  return new Date(Date.UTC(year, monthIndex, day, 12, 0, 0)).toISOString();
}

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function getCardApprovalDate(card: TrackerCard) {
  const sourceDate =
    card.openDate?.trim() ||
    card.annualFeeDueDate?.trim() ||
    new Date().toISOString();
  const parsed = new Date(sourceDate);

  return {
    monthIndex: parsed.getUTCMonth(),
    day: parsed.getUTCDate(),
    year: parsed.getUTCFullYear()
  };
}

export function CardDetailModal({
  card,
  onClose,
  onDelete,
  onUpdateCard,
  onMarkBenefitUsed,
  onResetBenefit
}: {
  card: TrackerCard;
  onClose: () => void;
  onDelete: () => void;
  onUpdateCard: (
    updates: Partial<
      Pick<TrackerCard, "nickname" | "last4" | "creditLimit" | "openDate" | "annualFeeDueDate">
    >
  ) => void;
  onMarkBenefitUsed: (benefitId: string) => void;
  onResetBenefit: (benefitId: string) => void;
}) {
  const initialApprovalDate = useMemo(() => getCardApprovalDate(card), [card]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFinalDeleteConfirm, setShowFinalDeleteConfirm] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [nickname, setNickname] = useState(card.nickname ?? "");
  const [last4, setLast4] = useState(card.last4 ?? "");
  const [creditLimit, setCreditLimit] = useState(
    typeof card.creditLimit === "number" ? String(card.creditLimit) : ""
  );
  const [approvedMonthIndex, setApprovedMonthIndex] = useState(initialApprovalDate.monthIndex);
  const [approvedDay, setApprovedDay] = useState(initialApprovalDate.day);
  const [approvedYear, setApprovedYear] = useState(initialApprovalDate.year);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 21 }, (_, index) => currentYear - 15 + index);
  }, []);

  const dayOptions = useMemo(
    () =>
      Array.from(
        { length: getDaysInMonth(approvedYear, approvedMonthIndex) },
        (_, index) => index + 1
      ),
    [approvedMonthIndex, approvedYear]
  );

  useEffect(() => {
    setNickname(card.nickname ?? "");
    setLast4(card.last4 ?? "");
    setCreditLimit(typeof card.creditLimit === "number" ? String(card.creditLimit) : "");
    setApprovedMonthIndex(initialApprovalDate.monthIndex);
    setApprovedDay(initialApprovalDate.day);
    setApprovedYear(initialApprovalDate.year);
    setIsEditOpen(false);
    setShowDeleteConfirm(false);
    setShowFinalDeleteConfirm(false);
  }, [card, initialApprovalDate]);

  useEffect(() => {
    const maxDay = getDaysInMonth(approvedYear, approvedMonthIndex);
    if (approvedDay > maxDay) {
      setApprovedDay(maxDay);
    }
  }, [approvedDay, approvedMonthIndex, approvedYear]);

  function handleSaveEdit() {
    const approvedDateIso = buildDateIso(approvedYear, approvedMonthIndex, approvedDay);

    onUpdateCard({
      nickname: nickname.trim() ? nickname.trim() : undefined,
      last4: last4.trim() ? last4.trim().slice(0, 4) : undefined,
      creditLimit: creditLimit.trim()
        ? Number(creditLimit.replace(/[^0-9]/g, "")) || undefined
        : undefined,
      openDate: card.annualFee > 0 ? approvedDateIso : "",
      annualFeeDueDate: card.annualFee > 0 ? approvedDateIso : ""
    });

    setIsEditOpen(false);
  }

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={onClose}>
          <Text style={styles.topButton}>Close</Text>
        </Pressable>
        <Text style={styles.topTitle}>{card.name}</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <CardThumbnail card={card} />
          <View style={styles.heroText}>
            <Text style={styles.heroName}>{getDisplayName(card)}</Text>
            <Text style={styles.heroMeta}>{card.issuer}</Text>
            {card.last4 ? <Text style={styles.heroMeta}>•••• {card.last4}</Text> : null}
            {card.nickname?.trim() ? <Text style={styles.heroBadge}>Nickname: {card.nickname}</Text> : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Annual fee</Text>
          <View style={styles.rowBetween}>
            <View style={styles.sectionValueBlock}>
              <Text style={styles.amount}>{formatCurrency(card.annualFee)}</Text>
              <Text style={styles.sectionMeta}>
                {card.annualFee > 0
                  ? `Next fee: ${formatAnnualFeeDueDate(card.annualFeeDueDate)}`
                  : "No annual fee"}
              </Text>
              {typeof card.creditLimit === "number" ? (
                <Text style={styles.sectionMeta}>
                  Credit limit: {formatCurrency(card.creditLimit)}
                </Text>
              ) : null}
            </View>
            {card.annualFee > 0 ? (
              <Pill label={annualFeeCountdown(card.annualFeeDueDate)} tone="warning" />
            ) : (
              <Pill label="No fee" tone="success" />
            )}
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
                  <Pill
                    label={benefit.isUsed ? "Used" : "Unused"}
                    tone={benefit.isUsed ? "success" : "warning"}
                  />
                </View>
                <Text style={styles.sectionMeta}>
                  {formatCurrency(benefit.amountUsedThisPeriod)} of{" "}
                  {formatCurrency(benefit.amountTotalThisPeriod)}
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Card actions</Text>
          <Text style={styles.sectionMeta}>
            Update personal details or remove this card from your wallet.
          </Text>

          <View style={styles.bottomActionRow}>
            <Pressable onPress={() => setIsEditOpen(true)} style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit card</Text>
            </Pressable>

            <Pressable
              onPress={() => setShowDeleteConfirm(true)}
              style={styles.bottomDeleteButton}
            >
              <Text style={styles.bottomDeleteText}>Delete card</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {isEditOpen ? (
        <View style={styles.overlay}>
          <Pressable style={styles.overlayBackdrop} onPress={() => setIsEditOpen(false)} />
          <View style={styles.sheetCard}>
            <View style={styles.sheetTopBar}>
              <Text style={styles.sheetTitle}>Edit card</Text>
              <Pressable onPress={() => setIsEditOpen(false)}>
                <Text style={styles.sheetClose}>Done</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
              <View style={styles.sheetHero}>
                <CardThumbnail card={card} />
                <View style={styles.sheetHeroText}>
                  <Text style={styles.previewName}>{card.name}</Text>
                  <Text style={styles.previewMeta}>{card.issuer}</Text>
                </View>
              </View>

              <Text style={styles.fieldLabel}>Nickname (optional)</Text>
              <TextInput
                value={nickname}
                onChangeText={setNickname}
                placeholder="Everyday Gold"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />

              <Text style={styles.fieldLabel}>Last 4 digits</Text>
              <TextInput
                value={last4}
                onChangeText={setLast4}
                keyboardType="number-pad"
                maxLength={4}
                placeholder="1234"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />

              {card.annualFee > 0 ? (
                <>
                  <Text style={styles.fieldLabel}>Approved date</Text>
                  <View style={styles.dateSummaryCard}>
                    <Text style={styles.dateSummaryText}>
                      {monthLabels[approvedMonthIndex]} {approvedDay}, {approvedYear}
                    </Text>
                    <Text style={styles.dateSummaryHint}>
                      Annual fee renewal will follow this card approval date each year.
                    </Text>
                  </View>

                  <View style={styles.dateWheelRow}>
                    <View style={styles.dateWheelColumn}>
                      <Text style={styles.wheelLabel}>Month</Text>
                      <ScrollView showsVerticalScrollIndicator={false} style={styles.wheelList}>
                        {monthLabels.map((month, index) => {
                          const isSelected = approvedMonthIndex === index;
                          return (
                            <Pressable
                              key={month}
                              onPress={() => setApprovedMonthIndex(index)}
                              style={[styles.wheelItem, isSelected && styles.wheelItemSelected]}
                            >
                              <Text
                                style={[
                                  styles.wheelItemText,
                                  isSelected && styles.wheelItemTextSelected
                                ]}
                              >
                                {month}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </ScrollView>
                    </View>

                    <View style={styles.dateWheelColumn}>
                      <Text style={styles.wheelLabel}>Day</Text>
                      <ScrollView showsVerticalScrollIndicator={false} style={styles.wheelList}>
                        {dayOptions.map((day) => {
                          const isSelected = approvedDay === day;
                          return (
                            <Pressable
                              key={day}
                              onPress={() => setApprovedDay(day)}
                              style={[styles.wheelItem, isSelected && styles.wheelItemSelected]}
                            >
                              <Text
                                style={[
                                  styles.wheelItemText,
                                  isSelected && styles.wheelItemTextSelected
                                ]}
                              >
                                {day}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </ScrollView>
                    </View>

                    <View style={styles.dateWheelColumn}>
                      <Text style={styles.wheelLabel}>Year</Text>
                      <ScrollView showsVerticalScrollIndicator={false} style={styles.wheelList}>
                        {yearOptions.map((year) => {
                          const isSelected = approvedYear === year;
                          return (
                            <Pressable
                              key={year}
                              onPress={() => setApprovedYear(year)}
                              style={[styles.wheelItem, isSelected && styles.wheelItemSelected]}
                            >
                              <Text
                                style={[
                                  styles.wheelItemText,
                                  isSelected && styles.wheelItemTextSelected
                                ]}
                              >
                                {year}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </ScrollView>
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.noFeeNotice}>
                  <Text style={styles.noFeeNoticeTitle}>No annual fee</Text>
                  <Text style={styles.noFeeNoticeText}>
                    This card does not need an approved date for annual fee tracking.
                  </Text>
                </View>
              )}

              <Text style={styles.fieldLabel}>Credit limit (optional)</Text>
              <TextInput
                value={creditLimit}
                onChangeText={setCreditLimit}
                keyboardType="number-pad"
                placeholder="$10,000"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />

              <Pressable onPress={handleSaveEdit} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save changes</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      ) : null}

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
              <Pressable onPress={onDelete} style={styles.confirmDeleteButton}>
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
  topTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary
  },
  topBarSpacer: {
    width: 42
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
  heroBadge: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary
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
  sectionValueBlock: {
    flex: 1
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
  bottomActionRow: {
    marginTop: 18,
    flexDirection: "row",
    gap: 12
  },
  editButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E7F0FF"
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary
  },
  bottomDeleteButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE4E2"
  },
  bottomDeleteText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#D92D20"
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 19, 40, 0.28)",
    justifyContent: "center",
    padding: spacing.lg
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject
  },
  sheetCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    maxHeight: "88%",
    paddingTop: spacing.lg
  },
  sheetTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary
  },
  sheetClose: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary
  },
  sheetContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl
  },
  sheetHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  sheetHeroText: {
    flex: 1
  },
  previewName: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary
  },
  previewMeta: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary
  },
  fieldLabel: {
    marginTop: spacing.lg,
    fontSize: 15,
    fontWeight: "600",
    color: colors.textSecondary
  },
  input: {
    marginTop: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.textPrimary
  },
  dateSummaryCard: {
    marginTop: 8,
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#F4F7FC"
  },
  dateSummaryText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary
  },
  dateSummaryHint: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary
  },
  dateWheelRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14
  },
  dateWheelColumn: {
    flex: 1
  },
  wheelLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
    marginBottom: 8
  },
  wheelList: {
    maxHeight: 200,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.border
  },
  wheelItem: {
    paddingVertical: 12,
    paddingHorizontal: 12
  },
  wheelItemSelected: {
    backgroundColor: "#E7F0FF"
  },
  wheelItemText: {
    textAlign: "center",
    fontSize: 15,
    color: colors.textSecondary
  },
  wheelItemTextSelected: {
    color: colors.primary,
    fontWeight: "700"
  },
  noFeeNotice: {
    marginTop: spacing.lg,
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#EEF7F2"
  },
  noFeeNoticeTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.success
  },
  noFeeNoticeText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
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

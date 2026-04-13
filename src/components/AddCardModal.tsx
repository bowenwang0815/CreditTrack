import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { CardThumbnail, resolveCardImageSource } from "./CardThumbnail";
import { cardTemplates } from "../data/sampleCards";
import { colors, spacing } from "../theme";
import { AddCardPayload } from "../types";

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildDateIso(year: number, monthIndex: number, day: number) {
  return new Date(Date.UTC(year, monthIndex, day, 12, 0, 0)).toISOString();
}

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function AddCardModal({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (payload: AddCardPayload) => void;
}) {
  const issuers = useMemo(
    () => Array.from(new Set(cardTemplates.map((template) => template.issuer))).sort(),
    []
  );

  const [selectedIssuer, setSelectedIssuer] = useState(issuers[0] ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [isTemplateDetailsOpen, setIsTemplateDetailsOpen] = useState(false);
  const [last4, setLast4] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [approvedMonthIndex, setApprovedMonthIndex] = useState(new Date().getMonth());
  const [approvedDay, setApprovedDay] = useState(new Date().getDate());
  const [approvedYear, setApprovedYear] = useState(new Date().getFullYear());

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 21 }, (_, index) => currentYear - 15 + index);
  }, []);

  const dayOptions = useMemo(
    () => Array.from({ length: getDaysInMonth(approvedYear, approvedMonthIndex) }, (_, index) => index + 1),
    [approvedMonthIndex, approvedYear]
  );

  const visibleTemplates = useMemo(
    () => {
      const trimmedQuery = searchQuery.trim().toLowerCase();

      return cardTemplates.filter((template) => {
        if (!trimmedQuery && template.issuer !== selectedIssuer) {
          return false;
        }

        const searchableText = [
          template.name,
          template.issuer,
          template.notes,
          ...template.benefits.map((benefit) => benefit.name)
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(trimmedQuery);
      });
    },
    [searchQuery, selectedIssuer]
  );

  const selectedTemplate = useMemo(
    () => cardTemplates.find((template) => template.id === selectedTemplateId),
    [selectedTemplateId]
  );

  useEffect(() => {
    if (!selectedIssuer && issuers[0]) {
      setSelectedIssuer(issuers[0]);
    }
  }, [issuers, selectedIssuer]);

  useEffect(() => {
    if (visibleTemplates.length === 0) {
      setSelectedTemplateId("");
      return;
    }

    const selectedStillVisible = visibleTemplates.some(
      (template) => template.id === selectedTemplateId
    );

    if (!selectedStillVisible) {
      setSelectedTemplateId(visibleTemplates[0].id);
    }
  }, [selectedTemplateId, visibleTemplates]);

  useEffect(() => {
    const maxDay = getDaysInMonth(approvedYear, approvedMonthIndex);
    if (approvedDay > maxDay) {
      setApprovedDay(maxDay);
    }
  }, [approvedDay, approvedMonthIndex, approvedYear]);

  function handleSaveSelectedTemplate() {
    if (!selectedTemplateId) {
      return;
    }

    const approvedDateIso = buildDateIso(approvedYear, approvedMonthIndex, approvedDay);

    onSave({
      templateId: selectedTemplateId,
      last4,
      creditLimit: creditLimit.trim() ? Number(creditLimit.replace(/[^0-9]/g, "")) || undefined : undefined,
      openDate: approvedDateIso,
      annualFeeDueDate: approvedDateIso
    });
  }

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={onClose}>
          <Text style={styles.topButton}>Cancel</Text>
        </Pressable>
        <Text style={styles.topTitle}>Add Card</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search cards</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search any card"
            placeholderTextColor="#9CA3AF"
            style={[styles.input, styles.searchInput]}
          />

          <Text style={styles.subsectionTitle}>Filter by bank</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.issuerRow}
          >
            {issuers.map((issuer) => {
              const isSelected = issuer === selectedIssuer;
              return (
                <Pressable
                  key={issuer}
                  onPress={() => {
                    setSelectedIssuer(issuer);
                    setSearchQuery("");
                  }}
                  style={[
                    styles.issuerPill,
                    isSelected && styles.issuerPillSelected
                  ]}
                >
                  <Text
                    style={[
                      styles.issuerPillText,
                      isSelected && styles.issuerPillTextSelected
                    ]}
                  >
                    {issuer}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose a built-in card</Text>
          <View style={styles.templateList}>
            {visibleTemplates.map((template) => {
              const isSelected = template.id === selectedTemplateId;
              const hasImage = Boolean(resolveCardImageSource(template));
              return (
                <Pressable
                  key={template.id}
                  onPress={() => {
                    setSelectedTemplateId(template.id);
                    setIsTemplateDetailsOpen(true);
                  }}
                  style={[styles.templateButton, isSelected && styles.templateButtonSelected]}
                >
                  {hasImage ? <CardThumbnail card={template} compact /> : null}
                  <View style={styles.templateBody}>
                    <Text style={[styles.templateTitle, isSelected && styles.templateTitleSelected]}>
                      {template.name}
                    </Text>
                    <Text style={styles.templateMeta}>{template.issuer}</Text>
                  </View>
                </Pressable>
              );
            })}
            {visibleTemplates.length === 0 ? (
              <Text style={styles.previewMeta}>
                No cards found for this bank{searchQuery.trim() ? " and search" : ""} yet.
              </Text>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {isTemplateDetailsOpen && selectedTemplate ? (
        <View style={styles.overlay}>
          <View style={styles.sheetCard}>
            <View style={styles.sheetTopBar}>
              <Text style={styles.sheetTitle}>Card details</Text>
              <Pressable onPress={() => setIsTemplateDetailsOpen(false)}>
                <Text style={styles.sheetClose}>Done</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.sheetContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.sheetHero}>
                <CardThumbnail card={selectedTemplate} />
                <View style={styles.sheetHeroText}>
                  <Text style={styles.previewName}>{selectedTemplate.name}</Text>
                  <Text style={styles.previewMeta}>{selectedTemplate.issuer}</Text>
                  <Text style={styles.previewMeta}>
                    {selectedTemplate.earningRules
                      .slice(0, 3)
                      .map((rule) => `${rule.multiplier}x ${rule.category}`)
                      .join(" • ")}
                  </Text>
                </View>
              </View>

              {selectedTemplate.benefits.length > 0 ? (
                <View style={styles.previewBlock}>
                  <Text style={styles.previewBlockLabel}>Highlighted benefits</Text>
                  <Text style={styles.previewMeta}>
                    {selectedTemplate.benefits
                      .slice(0, 3)
                      .map((benefit) => benefit.name)
                      .join(" • ")}
                  </Text>
                </View>
              ) : null}

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

              <Text style={styles.fieldLabel}>Approved date</Text>
              <View style={styles.dateSummaryCard}>
                <Text style={styles.dateSummaryText}>
                  {monthLabels[approvedMonthIndex]} {approvedDay}, {approvedYear}
                </Text>
                <Text style={styles.dateSummaryHint}>
                  Annual fee due date will match this approved date each year.
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
                          <Text style={[styles.wheelItemText, isSelected && styles.wheelItemTextSelected]}>
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
                          <Text style={[styles.wheelItemText, isSelected && styles.wheelItemTextSelected]}>
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
                          <Text style={[styles.wheelItemText, isSelected && styles.wheelItemTextSelected]}>
                            {year}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>

              <Text style={styles.fieldLabel}>Credit limit (optional)</Text>
              <TextInput
                value={creditLimit}
                onChangeText={setCreditLimit}
                keyboardType="number-pad"
                placeholder="$10,000"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />

              <Pressable onPress={handleSaveSelectedTemplate} style={styles.addCardButton}>
                <Text style={styles.addCardButtonText}>Add card</Text>
              </Pressable>
            </ScrollView>
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
    color: colors.primary,
    fontWeight: "600"
  },
  topButtonDisabled: {
    color: "#A7B1C6"
  },
  topBarSpacer: {
    width: 44
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
  templateList: {
    marginTop: 12,
    gap: 10
  },
  subsectionTitle: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: "700",
    color: colors.textSecondary
  },
  issuerRow: {
    gap: 10,
    marginTop: 12,
    paddingRight: 8
  },
  issuerPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: "#FFFFFF"
  },
  issuerPillSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.blueSoft
  },
  issuerPillText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary
  },
  issuerPillTextSelected: {
    color: colors.primary
  },
  templateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md
  },
  templateButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.blueSoft
  },
  templateTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary
  },
  templateBody: {
    flex: 1
  },
  templateTitleSelected: {
    color: colors.primary
  },
  templateMeta: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary
  },
  fieldLabel: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    fontSize: 15,
    color: colors.textPrimary
  },
  dateSummaryCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF"
  },
  dateSummaryText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary
  },
  dateSummaryHint: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary
  },
  dateWheelRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12
  },
  dateWheelColumn: {
    flex: 1
  },
  wheelLabel: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary
  },
  wheelList: {
    maxHeight: 190,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: "#FFFFFF"
  },
  wheelItem: {
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  wheelItemSelected: {
    backgroundColor: colors.blueSoft
  },
  wheelItemText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary
  },
  wheelItemTextSelected: {
    color: colors.primary
  },
  searchInput: {
    marginTop: 14
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 19, 40, 0.28)",
    justifyContent: "flex-end"
  },
  sheetCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
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
    gap: spacing.md,
    marginBottom: spacing.md
  },
  sheetHeroText: {
    flex: 1
  },
  previewBlock: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.background
  },
  previewBlockLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4
  },
  addCardButton: {
    marginTop: spacing.lg,
    borderRadius: 18,
    backgroundColor: colors.primary,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center"
  },
  addCardButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700"
  },
  previewName: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary
  },
  previewMeta: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19
  }
});

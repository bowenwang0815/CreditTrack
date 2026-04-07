import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { CardThumbnail, resolveCardImageSource } from "./CardThumbnail";
import { cardTemplates } from "../data/sampleCards";
import { colors, spacing } from "../theme";
import { AddCardPayload } from "../types";

function normalizeDateInput(value: string) {
  const candidate = new Date(value);
  if (Number.isNaN(candidate.getTime())) {
    return new Date().toISOString();
  }
  return candidate.toISOString();
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
  const [last4, setLast4] = useState("");
  const [openDate, setOpenDate] = useState(new Date().toISOString().slice(0, 10));
  const [annualFeeDueDate, setAnnualFeeDueDate] = useState(new Date().toISOString().slice(0, 10));

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

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={onClose}>
          <Text style={styles.topButton}>Cancel</Text>
        </Pressable>
        <Text style={styles.topTitle}>Add Card</Text>
        <Pressable
          disabled={!selectedTemplateId}
          onPress={() => {
            if (!selectedTemplateId) {
              return;
            }

            onSave({
              templateId: selectedTemplateId,
              last4,
              openDate: normalizeDateInput(openDate),
              annualFeeDueDate: normalizeDateInput(annualFeeDueDate)
            });
          }}
        >
          <Text style={[styles.topButton, !selectedTemplateId && styles.topButtonDisabled]}>
            Save
          </Text>
        </Pressable>
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
                  onPress={() => setSelectedTemplateId(template.id)}
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Card details</Text>
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

          <Text style={styles.fieldLabel}>Open date</Text>
          <TextInput
            value={openDate}
            onChangeText={setOpenDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Annual fee due date</Text>
          <TextInput
            value={annualFeeDueDate}
            onChangeText={setAnnualFeeDueDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />
        </View>

        {selectedTemplate ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Template preview</Text>
            <Text style={styles.previewName}>{selectedTemplate.name}</Text>
            <Text style={styles.previewMeta}>
              {selectedTemplate.issuer}
            </Text>
            <Text style={styles.previewMeta}>
              {selectedTemplate.earningRules
                .slice(0, 3)
                .map((rule) => `${rule.multiplier}x ${rule.category}`)
                .join(" • ")}
            </Text>
            {selectedTemplate.benefits.length > 0 ? (
              <Text style={styles.previewMeta}>
                {selectedTemplate.benefits
                  .slice(0, 3)
                  .map((benefit) => benefit.name)
                  .join(" • ")}
              </Text>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
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
  searchInput: {
    marginTop: 14
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

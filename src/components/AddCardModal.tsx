import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { cardTemplates } from "../data/sampleCards";
import { colors, spacing } from "../theme";
import { AddCardPayload } from "../types";
import { formatDate } from "../utils/date";

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
  const [selectedTemplateId, setSelectedTemplateId] = useState(cardTemplates[0]?.id ?? "");
  const [last4, setLast4] = useState("");
  const [openDate, setOpenDate] = useState(new Date().toISOString().slice(0, 10));
  const [annualFeeDueDate, setAnnualFeeDueDate] = useState(new Date().toISOString().slice(0, 10));

  const selectedTemplate = useMemo(
    () => cardTemplates.find((template) => template.id === selectedTemplateId),
    [selectedTemplateId]
  );

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={onClose}>
          <Text style={styles.topButton}>Cancel</Text>
        </Pressable>
        <Text style={styles.topTitle}>Add Card</Text>
        <Pressable
          onPress={() =>
            onSave({
              templateId: selectedTemplateId,
              last4,
              openDate: normalizeDateInput(openDate),
              annualFeeDueDate: normalizeDateInput(annualFeeDueDate)
            })
          }
        >
          <Text style={styles.topButton}>Save</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose a built-in card</Text>
          <View style={styles.templateList}>
            {cardTemplates.map((template) => {
              const isSelected = template.id === selectedTemplateId;
              return (
                <Pressable
                  key={template.id}
                  onPress={() => setSelectedTemplateId(template.id)}
                  style={[styles.templateButton, isSelected && styles.templateButtonSelected]}
                >
                  <Text style={[styles.templateTitle, isSelected && styles.templateTitleSelected]}>
                    {template.name}
                  </Text>
                  <Text style={styles.templateMeta}>{template.issuer}</Text>
                </Pressable>
              );
            })}
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
              {selectedTemplate.issuer} • {formatDate(selectedTemplate.annualFeeDueDate)}
            </Text>
            <Text style={styles.previewMeta}>
              {selectedTemplate.earningRules
                .slice(0, 3)
                .map((rule) => `${rule.multiplier}x ${rule.category}`)
                .join(" • ")}
            </Text>
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
  templateButton: {
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

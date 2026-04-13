import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { cardTemplates } from "../data/sampleCards";
import { AddCardPayload, Benefit, TrackerCard } from "../types";
import { buildUpdatedBenefitUsage, normalizeBenefitState } from "../utils/benefits";

const STORAGE_KEY = "cardpilot.cards.v1";

function makeLocalId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeText(value?: string) {
  return (value ?? "").trim().toLowerCase();
}

function findTemplateForStoredCard(card: TrackerCard) {
  return cardTemplates.find((template) => {
    if (card.imageAssetKey && template.imageAssetKey) {
      return card.imageAssetKey === template.imageAssetKey;
    }

    return (
      normalizeText(template.issuer) === normalizeText(card.issuer) &&
      normalizeText(template.name) === normalizeText(card.name)
    );
  });
}

function mergeStoredCardWithTemplate(card: TrackerCard): TrackerCard {
  const template = findTemplateForStoredCard(card);
  if (!template) {
    return card;
  }

  const existingBenefitsByName = new Map(
    card.benefits.map((benefit) => [normalizeText(benefit.name), benefit])
  );

  return {
    ...template,
    id: card.id,
    nickname: card.nickname,
    last4: card.last4,
    creditLimit: card.creditLimit,
    openDate: card.openDate,
    annualFeeDueDate: card.annualFeeDueDate,
    imageUrl: card.imageUrl ?? template.imageUrl,
    isActive: card.isActive,
    earningRules: template.earningRules.map((rule) => ({
      ...rule,
      id: makeLocalId("rule")
    })),
    benefits: template.benefits.map((benefit) => {
      const existing = existingBenefitsByName.get(normalizeText(benefit.name));

      return normalizeBenefitState({
        ...benefit,
        id: existing?.id ?? makeLocalId("benefit"),
        usageHistory: existing?.usageHistory,
        currentPeriodKey: existing?.currentPeriodKey,
        currentPeriodLabel: existing?.currentPeriodLabel,
        lastUsedDate: existing?.lastUsedDate,
        amountUsedThisPeriod: existing?.amountUsedThisPeriod ?? 0,
        isUsed: existing?.isUsed ?? false
      });
    })
  };
}

export function useCardStore() {
  const [cards, setCards] = useState<TrackerCard[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!mounted) {
          return;
        }

        if (stored) {
          const parsed = JSON.parse(stored) as TrackerCard[];
          setCards(parsed.map(mergeStoredCardWithTemplate));
        } else {
          setCards([]);
        }
      } catch {
        if (mounted) {
          setCards([]);
        }
      } finally {
        if (mounted) {
          setReady(true);
        }
      }
    }

    hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cards)).catch(() => undefined);
  }, [cards, ready]);

  function addCardFromTemplate(payload: AddCardPayload) {
    const template = cardTemplates.find((card) => card.id === payload.templateId);
    if (!template) {
      return;
    }

    const nextCard: TrackerCard = {
      ...template,
      id: makeLocalId("card"),
      last4: payload.last4?.trim() ? payload.last4.trim().slice(0, 4) : template.last4,
      creditLimit: typeof payload.creditLimit === "number" ? payload.creditLimit : template.creditLimit,
      openDate: payload.openDate,
      annualFeeDueDate: payload.annualFeeDueDate,
      earningRules: template.earningRules.map((rule) => ({
        ...rule,
        id: makeLocalId("rule")
      })),
      benefits: template.benefits.map((benefit) => ({
        ...normalizeBenefitState({
          ...benefit,
          id: makeLocalId("benefit"),
          amountUsedThisPeriod: 0,
          isUsed: false,
          lastUsedDate: undefined,
          usageHistory: []
        })
      }))
    };

    setCards((current) => [nextCard, ...current]);
  }

  function updateBenefit(cardId: string, benefitId: string, updater: (benefit: Benefit) => Benefit) {
    setCards((current) =>
      current.map((card) =>
        card.id !== cardId
          ? card
          : {
              ...card,
              benefits: card.benefits.map((benefit) =>
                benefit.id === benefitId ? updater(benefit) : benefit
              )
            }
      )
    );
  }

  function markBenefitUsed(cardId: string, benefitId: string) {
    updateBenefit(cardId, benefitId, (benefit) =>
      buildUpdatedBenefitUsage(benefit, benefit.amountTotalThisPeriod)
    );
  }

  function resetBenefit(cardId: string, benefitId: string) {
    updateBenefit(cardId, benefitId, (benefit) => buildUpdatedBenefitUsage(benefit, 0));
  }

  function updateBenefitUsage(cardId: string, benefitId: string, amountUsed: number) {
    updateBenefit(cardId, benefitId, (benefit) => buildUpdatedBenefitUsage(benefit, amountUsed));
  }

  function deleteCard(cardId: string) {
    setCards((current) => current.filter((card) => card.id !== cardId));
  }

  async function resetAllCards() {
    setCards([]);
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => undefined);
  }

  return {
    cards,
    ready,
    addCardFromTemplate,
    markBenefitUsed,
    resetBenefit,
    updateBenefitUsage,
    deleteCard,
    resetAllCards
  };
}

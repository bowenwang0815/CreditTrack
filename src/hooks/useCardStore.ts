import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { cardTemplates, makeInitialCards } from "../data/sampleCards";
import { AddCardPayload, Benefit, TrackerCard } from "../types";

const STORAGE_KEY = "cardpilot.cards.v1";

function makeLocalId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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
          setCards(JSON.parse(stored) as TrackerCard[]);
        } else {
          setCards(makeInitialCards());
        }
      } catch {
        if (mounted) {
          setCards(makeInitialCards());
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
      openDate: payload.openDate,
      annualFeeDueDate: payload.annualFeeDueDate,
      earningRules: template.earningRules.map((rule) => ({
        ...rule,
        id: makeLocalId("rule")
      })),
      benefits: template.benefits.map((benefit) => ({
        ...benefit,
        id: makeLocalId("benefit"),
        amountUsedThisPeriod: 0,
        isUsed: false,
        lastUsedDate: undefined
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
    updateBenefit(cardId, benefitId, (benefit) => ({
      ...benefit,
      isUsed: true,
      lastUsedDate: new Date().toISOString(),
      amountUsedThisPeriod: benefit.amountTotalThisPeriod
    }));
  }

  function resetBenefit(cardId: string, benefitId: string) {
    updateBenefit(cardId, benefitId, (benefit) => ({
      ...benefit,
      isUsed: false,
      lastUsedDate: undefined,
      amountUsedThisPeriod: 0
    }));
  }

  function archiveCard(cardId: string) {
    setCards((current) =>
      current.map((card) => (card.id === cardId ? { ...card, isActive: false } : card))
    );
  }

  return {
    cards,
    ready,
    addCardFromTemplate,
    markBenefitUsed,
    resetBenefit,
    archiveCard
  };
}

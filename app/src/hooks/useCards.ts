// app/src/hooks/useCards.ts
import { useState, useEffect } from 'react';
import { Card } from '../types';
import { cardService } from '../services/cardService';

export const useCards = (accountNumber: string | undefined) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accountNumber) {
      loadCards();
    }
  }, [accountNumber]);

  const loadCards = async () => {
    if (!accountNumber) return;

    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await cardService.getCards(accountNumber);
      
      if (err) {
        setError(err);
      } else {
        setCards(data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadCards();
  };

  const blockCard = async (cardId: string) => {
    const { error: err } = await cardService.updateCardStatus(cardId, 'blocked');
    if (!err) {
      await loadCards();
    }
    return { error: err };
  };

  const unblockCard = async (cardId: string) => {
    const { error: err } = await cardService.updateCardStatus(cardId, 'active');
    if (!err) {
      await loadCards();
    }
    return { error: err };
  };

  return { cards, loading, error, refresh, blockCard, unblockCard };
};
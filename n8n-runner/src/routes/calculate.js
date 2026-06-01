import { Router } from 'express';
import { PRICE_TABLE } from './price-lookup.js';

export const calculateRouter = Router();

const VAT_RATE = 0.15;

function getBasePrice(cut) {
  const entry = PRICE_TABLE[cut.toLowerCase()];
  return entry ? entry.pricePerKg : null;
}

function marbleMultiplier(score) {
  if (score == null) return 1.0;
  const s = Number(score);
  if (s >= 9) return 1.5;
  if (s >= 7) return 1.3;
  if (s >= 5) return 1.15;
  return 1.0;
}

calculateRouter.post('/calculate', (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items array is required and must not be empty' });
    }

    const lineItems = items.map((item, i) => {
      const { cut, weight, marbleScore } = item;

      if (!cut || weight == null) {
        throw new Error(`Item ${i}: cut and weight are required`);
      }

      const basePrice = getBasePrice(cut);
      if (basePrice == null) {
        throw new Error(`Item ${i}: unknown cut "${cut}"`);
      }

      const weightKg = Number(weight);
      const multiplier = marbleMultiplier(marbleScore);
      const unitPrice = basePrice * multiplier;
      const subtotal = unitPrice * weightKg;

      return {
        cut,
        weightKg,
        marbleScore: marbleScore ?? null,
        unitPricePerKg: Math.round(unitPrice * 100) / 100,
        subtotal: Math.round(subtotal * 100) / 100,
      };
    });

    const subtotal = lineItems.reduce((sum, li) => sum + li.subtotal, 0);
    const vat = Math.round(subtotal * VAT_RATE * 100) / 100;
    const total = Math.round((subtotal + vat) * 100) / 100;

    res.json({
      lineItems,
      subtotal: Math.round(subtotal * 100) / 100,
      vatRate: VAT_RATE,
      vat,
      total,
      currency: 'ZAR',
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

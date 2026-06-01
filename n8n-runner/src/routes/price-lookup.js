import { Router } from 'express';

export const priceLookupRouter = Router();

export const PRICE_TABLE = {
  ribeye:       { cut: 'Ribeye',        pricePerKg: 289.99, description: 'Bone-in or boneless ribeye steak' },
  sirloin:      { cut: 'Sirloin',       pricePerKg: 219.99, description: 'Premium sirloin steak' },
  fillet:       { cut: 'Fillet',        pricePerKg: 349.99, description: 'Beef fillet / tenderloin' },
  rump:         { cut: 'Rump',          pricePerKg: 179.99, description: 'Rump steak' },
  tbone:        { cut: 'T-Bone',        pricePerKg: 259.99, description: 'T-bone steak' },
  porterhouse:  { cut: 'Porterhouse',   pricePerKg: 279.99, description: 'Porterhouse steak' },
  brisket:      { cut: 'Brisket',       pricePerKg: 139.99, description: 'Whole or point brisket' },
  shortrib:     { cut: 'Short Rib',     pricePerKg: 199.99, description: 'Beef short ribs' },
  topside:      { cut: 'Topside',       pricePerKg: 149.99, description: 'Topside roast' },
  silverside:   { cut: 'Silverside',    pricePerKg: 139.99, description: 'Silverside roast' },
  mince:        { cut: 'Mince',         pricePerKg: 109.99, description: 'Premium beef mince' },
  boerewors:    { cut: 'Boerewors',     pricePerKg: 129.99, description: 'Traditional boerewors sausage' },
  flank:        { cut: 'Flank',         pricePerKg: 159.99, description: 'Flank steak' },
  oxtail:       { cut: 'Oxtail',        pricePerKg: 169.99, description: 'Oxtail portions' },
  lamb_chops:   { cut: 'Lamb Chops',    pricePerKg: 249.99, description: 'Lamb loin chops' },
  lamb_leg:     { cut: 'Lamb Leg',      pricePerKg: 199.99, description: 'Whole or deboned lamb leg' },
  chicken_breast: { cut: 'Chicken Breast', pricePerKg: 89.99, description: 'Skinless chicken breast' },
  pork_belly:   { cut: 'Pork Belly',    pricePerKg: 129.99, description: 'Skin-on pork belly' },
};

priceLookupRouter.get('/price-lookup', (req, res) => {
  const { cut } = req.query;

  if (cut) {
    const key = cut.toLowerCase().replace(/[\s-]/g, '_');
    const altKey = cut.toLowerCase().replace(/[\s_]/g, '');
    const entry = PRICE_TABLE[key] || PRICE_TABLE[altKey];

    if (!entry) {
      return res.status(404).json({
        error: `Cut "${cut}" not found`,
        availableCuts: Object.values(PRICE_TABLE).map(e => e.cut),
      });
    }

    return res.json({ ...entry, currency: 'ZAR' });
  }

  res.json({
    cuts: Object.values(PRICE_TABLE).map(e => ({
      cut: e.cut,
      pricePerKg: e.pricePerKg,
      description: e.description,
    })),
    currency: 'ZAR',
  });
});

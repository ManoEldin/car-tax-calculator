/**
 * Configuration for Car Tax Calculator
 * Updated: 2025
 * Contains all hardcoded values for easy maintenance and updates
 */

const CONFIG = {
  // Car groups with their base usage values (monthly)
  carGroups: {
    1: { name: 'קבוצה 1', value: 2910, priceRange: 'עד 130,000 ₪' },
    2: { name: 'קבוצה 2', value: 3150, priceRange: '130,001-141,000 ₪' },
    3: { name: 'קבוצה 3', value: 4060, priceRange: '141,001-150,000 ₪' },
    4: { name: 'קבוצה 4', value: 4880, priceRange: '150,001-188,000 ₪' },
    5: { name: 'קבוצה 5', value: 6750, priceRange: '188,001-265,000 ₪' },
    6: { name: 'קבוצה 6', value: 8770, priceRange: '265,001-380,000 ₪' },
    7: { name: 'קבוצה 7', value: 11250, priceRange: 'מעל 380,000 ₪' }
  },

  // Eco-friendly vehicle discounts (in ILS)
  discounts: {
    hybrid: 500,        // Hybrid discount
    plugin: 1000,       // Plug-in hybrid/Electric discount
    electric: 1000      // Electric vehicle discount
  },

  // Income tax brackets and rates (2025)
  taxBrackets: [
    { limit: 6790, rate: 0.10 },
    { limit: 9730, rate: 0.14 },
    { limit: 15620, rate: 0.20 },
    { limit: 21710, rate: 0.31 },
    { limit: 45180, rate: 0.35 },
    { limit: 58190, rate: 0.47 },
    { limit: Infinity, rate: 0.50 }
  ],

  // Default credit points (2025)
  defaultCreditPoints: 2.25,

  // Credit point value in ILS (2025)
  creditPointValue: 235,

  // Currency format
  currency: {
    locale: 'he-IL',
    code: 'ILS'
  },

  // Input constraints
  constraints: {
    minSalary: 0,
    maxSalary: 1000000,
    minCreditPoints: 0,
    maxCreditPoints: 3.75,
    minCustomValue: 0,
    maxCustomValue: 50000,
    salaryStep: 100,
    creditPointsStep: 0.25,
    customValueStep: 10
  }
};

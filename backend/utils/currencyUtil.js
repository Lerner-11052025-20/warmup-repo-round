const axios = require('axios');

// Map to cache rates
// Key: baseCurrency, Value: { rates: {}, timestamp: Date }
const cache = new Map();
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 mins

/**
 * Fetch latest exchange rates for a base currency
 */
const getExchangeRates = async (baseCurrency) => {
  const now = Date.now();
  const cached = cache.get(baseCurrency);

  if (cached && (now - cached.timestamp < CACHE_DURATION_MS)) {
    console.log(`[CURRENCY] Using cached rates for ${baseCurrency}`);
    return cached.rates;
  }

  try {
    const url = `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`;
    const response = await axios.get(url);
    const rates = response.data.rates;

    // Cache the rates
    cache.set(baseCurrency, {
      rates,
      timestamp: now
    });

    return rates;
  } catch (error) {
    console.error(`[ERROR] Currency API failed: ${error.message}`);
    
    // Check if we have stale cache to fallback
    if (cached) {
      console.log(`[CURRENCY] Fallback to stale cache for ${baseCurrency}`);
      return cached.rates;
    }

    throw new Error('Could not fetch exchange rates');
  }
};

/**
 * Convert amount from originalCurrency to companyBaseCurrency
 */
const convertToCompanyCurrency = async (amount, originalCurrency, companyBaseCurrency) => {
  if (originalCurrency === companyBaseCurrency) {
    return {
      convertedAmount: Number(amount),
      exchangeRate: 1,
      baseCurrency: companyBaseCurrency
    };
  }

  const rates = await getExchangeRates(companyBaseCurrency);
  
  // Rate is: 1 Base = X target
  // But we have: Amount in target.
  // Example: Base = USD, Target = INR. Rate = 83.
  // 5000 INR -> USD: 5000 / 83.
  const rateInOriginal = rates[originalCurrency.toUpperCase()];

  if (!rateInOriginal) {
    throw new Error(`Currency ${originalCurrency} not supported`);
  }

  const convertedAmount = Number(amount) / rateInOriginal;

  return {
    convertedAmount: Number(convertedAmount.toFixed(2)),
    exchangeRate: Number((1 / rateInOriginal).toFixed(8)), // 1 Original = X Base
    baseCurrency: companyBaseCurrency
  };
};

module.exports = {
  getExchangeRates,
  convertToCompanyCurrency
};

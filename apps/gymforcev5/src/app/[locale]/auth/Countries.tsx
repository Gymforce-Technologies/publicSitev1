import { countries } from 'countries-list';
import getSymbolFromCurrency from 'currency-symbol-map';

interface CountryMapping {
  code: string;
  currency: string;
  symbol: string;
  std_code: string;
}

function generateCountryMappings(): { [key: string]: CountryMapping } {
  const mappings: { [key: string]: CountryMapping } = {};

  for (const [code, country] of Object.entries(countries)) {
    const primaryCurrency = Array.isArray(country.currency) ? country.currency[0] : country.currency;
    
    mappings[country.name] = {
      code: code,
      currency: primaryCurrency,
      symbol: getSymbolFromCurrency(primaryCurrency) || primaryCurrency,
      std_code: `+${country.phone}`,
    };
  }

  return mappings;
}

export const COUNTRY_MAPPINGS = generateCountryMappings();

// export const COUNTRY_MAPPINGS_ARRAY = Object.entries(COUNTRY_MAPPINGS).map(
//   ([name, details]) => ({ name, ...details })
// );
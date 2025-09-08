// Tanzania Land Use Types and Colors
export const tanzaniaLandUseLegend = [
  {
    swahili: 'Makazi',
    english: 'Residential',
    hex: '#FF0000'
  },
  {
    swahili: 'Kilimo',
    english: 'Agriculture',
    hex: '#00FF00'
  },
  {
    swahili: 'Misitu',
    english: 'Forest',
    hex: '#006400'
  },
  {
    swahili: 'Malisho',
    english: 'Grazing',
    hex: '#90EE90'
  },
  {
    swahili: 'Hifadhi',
    english: 'Conservation',
    hex: '#228B22'
  }
];

// Mock Region Land Use Data (percentages)
export const tanzaniaRegionLandUse: Record<string, Record<string, number>> = {
  'Dar es Salaam': {
    'Makazi': 60,
    'Kilimo': 20,
    'Misitu': 5,
    'Malisho': 5,
    'Hifadhi': 10
  },
  'Arusha': {
    'Makazi': 15,
    'Kilimo': 35,
    'Misitu': 20,
    'Malisho': 20,
    'Hifadhi': 10
  }
};

// Mock Region Areas (hectares)
export const tanzaniaRegionAreas: Record<string, number> = {
  'Dar es Salaam': 140000,
  'Arusha': 3500000
};

// Mock data structures for different administrative levels
export const tanzaniaDistrictLandUse: Record<string, Record<string, number>> = {
  'Mpwapwa': {
    'Makazi': 5,
    'Kilimo': 50,
    'Misitu': 15,
    'Malisho': 20,
    'Hifadhi': 10
  },
  'Kondoa': {
    'Makazi': 6,
    'Kilimo': 48,
    'Misitu': 18,
    'Malisho': 18,
    'Hifadhi': 10
  }
};

export const tanzaniaDistrictAreas: Record<string, number> = {
  'Mpwapwa': 750000,
  'Kondoa': 850000
};

export const tanzaniaWardLandUse: Record<string, Record<string, number>> = {
  'Mima': {
    'Makazi': 7,
    'Kilimo': 52,
    'Misitu': 12,
    'Malisho': 19,
    'Hifadhi': 10
  },
  'Berege': {
    'Makazi': 6,
    'Kilimo': 51,
    'Misitu': 14,
    'Malisho': 20,
    'Hifadhi': 9
  }
};

export const tanzaniaWardAreas: Record<string, number> = {
  'Mima': 29768,
  'Berege': 18063
};

export const tanzaniaVillageLandUse: Record<string, Record<string, number>> = {
  'Kikore': {
    'Makazi': 8,
    'Kilimo': 53,
    'Misitu': 11,
    'Malisho': 18,
    'Hifadhi': 10
  },
  'Keikei': {
    'Makazi': 7,
    'Kilimo': 52,
    'Misitu': 13,
    'Malisho': 19,
    'Hifadhi': 9
  }
};

export const tanzaniaVillageAreas: Record<string, number> = {
  'Kikore': 15892,
  'Keikei': 60084
};

// Mock CCRO Data
const nationalCCROs = 250000;

export const getNationalCCROsTotal = () => nationalCCROs;

export const tanzaniaRegionCCROs: Record<string, number> = {
  'Dar es Salaam': 15000,
  'Arusha': 35000
};

// Mock National Land Use Totals
export const getNationalLandUseTotals = () => ({
  totals: {
    'Makazi': { percent: 8, hectares: 7500000 },
    'Kilimo': { percent: 45, hectares: 42000000 },
    'Misitu': { percent: 20, hectares: 18700000 },
    'Malisho': { percent: 17, hectares: 15900000 },
    'Hifadhi': { percent: 10, hectares: 9400000 }
  }
});

export interface RegionStats {
  population: number;
  landUse: {
    total: number;
    agricultural: number;
    residential: number;
    commercial: number;
    protected: number;
  };
  landRights: {
    totalCCROs: number;
    activeCCROs: number;
    pendingCCROs: number;
  };
  landConflicts: {
    total: number;
    resolved: number;
    pending: number;
  };
}

export const mockRegionData: Record<string, RegionStats> = {
  "Dar es Salaam": {
    population: 6000000,
    landUse: {
      total: 1500,
      agricultural: 300,
      residential: 750,
      commercial: 300,
      protected: 150
    },
    landRights: {
      totalCCROs: 25000,
      activeCCROs: 22000,
      pendingCCROs: 3000
    },
    landConflicts: {
      total: 150,
      resolved: 120,
      pending: 30
    }
  },
  "Arusha": {
    population: 2000000,
    landUse: {
      total: 3700,
      agricultural: 1850,
      residential: 925,
      commercial: 555,
      protected: 370
    },
    landRights: {
      totalCCROs: 15000,
      activeCCROs: 13500,
      pendingCCROs: 1500
    },
    landConflicts: {
      total: 85,
      resolved: 65,
      pending: 20
    }
  }
};

// Function to get stats for any region, returns default values if region not found
export const getRegionStats = (regionName: string): RegionStats => {
  return mockRegionData[regionName] || {
    population: 0,
    landUse: {
      total: 0,
      agricultural: 0,
      residential: 0,
      commercial: 0,
      protected: 0
    },
    landRights: {
      totalCCROs: 0,
      activeCCROs: 0,
      pendingCCROs: 0
    },
    landConflicts: {
      total: 0,
      resolved: 0,
      pending: 0
    }
  };
};

import { CCROApplication } from "@/types/ccro";

// Helper function to generate random dates within a range
function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

// Sample villages and hamlets
const locations = [
  { village: "Kimara", hamlets: ["Mbezi", "Kilungule", "Mavurunza"] },
  { village: "Goba", hamlets: ["Kinzudi", "Kunguru", "Matosa"] },
  { village: "Kibamba", hamlets: ["Kibamba", "Kiluvya", "Kwembe"] },
];

// Land use types
const landUses = [
  "Residential",
  "Agricultural",
  "Commercial",
  "Mixed Use",
];

// Generate realistic looking claim numbers
function generateClaimNo(index: number) {
  return `CCRO/${new Date().getFullYear()}/` + String(index + 1).padStart(4, '0');
}

// Generate mock CCRO applications
export const mockCCROApplications: CCROApplication[] = Array.from({ length: 50 }, (_, i) => {
  const location = locations[Math.floor(Math.random() * locations.length)];
  const currentUse = landUses[Math.floor(Math.random() * landUses.length)];
  const proposedUse = Math.random() > 0.7 ? landUses[Math.floor(Math.random() * landUses.length)] : currentUse;
  
  const statuses: CCROApplication["status"][] = ['draft', 'submitted', 'under_review', 'surveying', 'approved', 'rejected', 'completed'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];

  // Ensure completed applications include parcel geometry and allocations for reliable UI display
  let geomForMock = Math.random() > 0.2 ? {
    type: "Point",
    coordinates: [
      39.2 + (Math.random() - 0.5) * 0.1,
      -6.8 + (Math.random() - 0.5) * 0.1
    ]
  } : undefined;

  let allocationsForMock = Math.random() > 0.5 ? [
    { partyName: 'John Doe', share: 60, rights: 'Primary occupant' },
    { partyName: 'Jane Smith', share: 40, rights: 'Co-owner' }
  ] : undefined;

  // Make a deterministic record for index 0 (ccro-1) so you always see parcel data in the UI
  if (i === 0) {
    // fixed geometry in Dar es Salaam
    (geomForMock as any) = {
      type: 'Point',
      coordinates: [39.254, -6.854]
    };

    (allocationsForMock as any) = [
      { partyName: 'Deterministic Owner', share: 70, rights: 'Owner' },
      { partyName: 'Deterministic Co-owner', share: 30, rights: 'Co-owner' }
    ];
  }

  return {
    id: `ccro-${i + 1}`,
    claimNo: generateClaimNo(i),
    status,
    partyInfo: [
      {
        name: Math.random() > 0.3 ? "John Doe" : "Jane Smith",
        verificationStatus: Math.random() > 0.4 ? ('verified' as const) : ('unverified' as const),
        idNumber: Math.random() > 0.3 ? `ID${Math.floor(Math.random() * 1000000)}` : undefined,
      },
      ...(Math.random() > 0.7 ? [{
        name: "Alice Johnson",
        verificationStatus: Math.random() > 0.4 ? ('verified' as const) : ('unverified' as const),
        idNumber: Math.random() > 0.3 ? `ID${Math.floor(Math.random() * 1000000)}` : undefined,
      }] : []),
    ],
    locality: {
      village: location.village,
      hamlet: location.hamlets[Math.floor(Math.random() * location.hamlets.length)],
    },
    parcel: (() => {
      // For completed CCROs, prefer to include geometry and allocations so UI always has data to show
      if (status === 'completed') {
        return {
          area: `${(Math.random() * 10 + 0.1).toFixed(2)} ha`,
          currentUse,
          proposedUse,
          geom: geomForMock ?? {
            type: "Point",
            coordinates: [39.25, -6.85]
          },
          allocations: allocationsForMock ?? [
            { partyName: 'John Doe', share: 50, rights: 'Owner' },
            { partyName: 'Alice Johnson', share: 50, rights: 'Co-owner' }
          ]
        };
      }

      return {
        area: `${(Math.random() * 10 + 0.1).toFixed(2)} ha`,
        currentUse,
        proposedUse,
        // Simple point geometry for testing
        geom: geomForMock,
        // Optional allocations (ownership shares)
        allocations: allocationsForMock
      };
    })(),
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
  };
});
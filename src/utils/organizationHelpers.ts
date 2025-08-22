import type { Organization } from "@/types/organizations";

// 1. Utility function to add sequential numbers to organizations
export const addSequentialNumbers = (organizations: Organization[]): Organization[] => {
  return organizations.map((org, index) => ({
    ...org,
    number: index + 1 // 2. Add sequential numbering starting from 1
  }));
};

// 3. Utility function to get organization by number
export const getOrganizationByNumber = (organizations: Organization[], number: number): Organization | undefined => {
  return organizations.find(org => org.number === number);
};

// 4. Utility function to create numbered organization map
export const createNumberedOrganizationMap = (organizations: Organization[]): Map<number, Organization> => {
  const map = new Map<number, Organization>();
  organizations.forEach((org, index) => {
    map.set(index + 1, { ...org, number: index + 1 });
  });
  return map;
};

// 5. Utility function to get organization ID by number
export const getOrganizationIdByNumber = (organizations: Organization[], number: number): string | undefined => {
  const org = organizations.find(org => org.number === number);
  return org?.id;
};

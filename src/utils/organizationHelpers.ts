// import type { OrganizationI } from "@/types/organizations";

// // 1. Utility function to add sequential numbers to organizations
// export const addSequentialNumbers = (organizations: OrganizationI[]): OrganizationI[] => {
//   return organizations.map((org, index) => ({
//     ...org,
//     number: index + 1 // 2. Add sequential numbering starting from 1
//   }));
// };

// // 3. Utility function to get organization by number
// // export const getOrganizationByNumber = (organizations: OrganizationI[], number: number): OrganizationI | undefined => {
// export const getOrganizationByNumber = () => {
//   // return organizations.find(org => org.number === number);
//   return undefined
// };

// // 4. Utility function to create numbered organization map
// export const createNumberedOrganizationMap = (organizations: OrganizationI[]): Map<number, OrganizationI> => {
//   const map = new Map<number, OrganizationI>();
//   organizations.forEach((org, index) => {
//     map.set(index + 1, { ...org, number: index + 1 });
//   });
//   return map;
// };

// // 5. Utility function to get organization ID by number
// export const getOrganizationIdByNumber = (organizations: OrganizationI[], number: number): string | undefined => {
//   const org = organizations.find(org => org.number === number);
//   return org?.id;
// };

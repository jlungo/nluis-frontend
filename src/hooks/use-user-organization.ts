import { useEffect, useState } from "react";

export function useUserOrganization() {
  const [organization, setOrganization] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setOrganization(user.organization || null);
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
      }
    }
  }, []);

  return organization;
}

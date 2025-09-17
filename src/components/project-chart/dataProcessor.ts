import type { ProjectI } from "@/types/projects";

export const dataProcessor = (
  data: ProjectI[]
): Promise<{ project: string; progress: number; created_at: Date }[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const parsedData = data.map((item) => {
        const progress =
          item?.localities && item.localities.length > 0
            ? item.localities.reduce(
                (sum, locality) => sum + locality.progress,
                0
              ) / item.localities.length
            : 0;
        return {
          project: item.name,
          progress: Number.isInteger(progress)
            ? progress
            : Math.floor(progress * 100) / 100,
          localities: item.localities?.length || 0,
          created_at: new Date(item.created_at),
        };
      });

      resolve(parsedData);
    }, 0);
  });
};

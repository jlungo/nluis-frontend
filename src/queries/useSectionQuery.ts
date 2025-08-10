import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

export interface SectionProps {
  id: string;
  name: string;
}

export const sectionQueryKey = "section";

export const useSectionQuery = (search: string, page: number) => {
  const [store, setStore] = useState<SectionProps[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: [sectionQueryKey, { search, page }],
    queryFn: () =>
      api
        .get(`/section?s=${search}&limit=1000&page=${page}`)
        .then((res) => res.data),
  });

  useEffect(() => {
    if (page === 1) setStore(data?.data ?? []);
    // If the page is 1, we reset the store to the new data
    else if (page > 1 && data?.data)
      setStore((prev) => [...prev, ...data.data]);
    else if (data)
      setStore((prev) => {
        const map = new Map();
        [...prev, ...data.data].forEach((item) => {
          map.set(item.id, item);
        });
        return Array.from(map.values()).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return {
    data: store,
    isLoading,
    nextPage: (data?.nextPage as boolean) || false,
  };
};

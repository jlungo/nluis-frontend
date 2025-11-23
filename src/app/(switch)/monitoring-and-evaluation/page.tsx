import { usePageStore } from "@/store/pageStore";
import { useEffect } from "react";

const Page = () => {
  const { setPage } = usePageStore();

  useEffect(() => {
    setPage({
      module: 'monitoring-and-evaluation',
      title: 'Monitoring & Evaluation',
    });
  }, [setPage]);

  return (
    <div>
      <h1>Monitoring and Evaluation</h1>
    </div>
  );
};

export default Page;
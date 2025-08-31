// import { Spinner } from "@/components/ui/spinner";
import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect } from "react";
import { useParams } from "react-router";

export default function Page() {
  const { locality_project_id } = useParams<{ locality_project_id: string }>();
  const { setPage } = usePageStore();

  // const { data, isLoading } = useProjectQuery(workflow_slug || "");
  console.log(locality_project_id)

  useLayoutEffect(() => {
    setPage({
      module: 'land-uses',
      title: "Zonal Land Use Project",

    });
  }, [setPage]);

  // if (!data && !isLoading)
  //       return <div className='flex flex-col items-center justify-center h-60'>
  //           <p className='text-muted-foreground'>No workflow data found!</p>
  //       </div>

  //   if (!data || isLoading)
  //       return (
  //           <div className='flex flex-col items-center justify-center h-60'>
  //               <Spinner />
  //               <p className="text-muted-foreground mt-4">Loading workflow...</p>
  //           </div>
  //       )

  //   if (isLoading) return <div className='flex flex-col items-center justify-center h-60'>
  //       <Spinner />
  //       <p className="text-muted-foreground mt-4">Loading workflow...</p>
  //   </div>

  return (
    <></>
  );
}

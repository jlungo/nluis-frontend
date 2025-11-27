<<<<<<<< HEAD:src/app/(switch)/ccro-management/ccro-projects/[project_id]/[locality_project_id]/index.ts
import Layout from "./layout";
import Page from "./page";
import Workflow from "./workflow";
========
import Layout from "./layout"
import Page from "./page"
import Batch from "./[batch]"
>>>>>>>> d33f3ffd17c5e408f56d3aa6ef038f0f6cf86208:src/app/(switch)/land-uses/zonal-land-use/[project_id]/[locality_project_id]/questionnaire/[questionnaire_id]/index.ts

const Index = {
  path: ":locality_project_id",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
<<<<<<<< HEAD:src/app/(switch)/ccro-management/ccro-projects/[project_id]/[locality_project_id]/index.ts
    Workflow,
========
    Batch,
>>>>>>>> d33f3ffd17c5e408f56d3aa6ef038f0f6cf86208:src/app/(switch)/land-uses/zonal-land-use/[project_id]/[locality_project_id]/questionnaire/[questionnaire_id]/index.ts
  ],
}

export default Index

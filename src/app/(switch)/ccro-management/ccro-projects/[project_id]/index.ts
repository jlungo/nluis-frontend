<<<<<<<< HEAD:src/app/(switch)/ccro-management/ccro-projects/[project_id]/index.ts
import Page from "./page";
import LocalityProjectId from "./[locality_project_id]";
import Edit from "./edit"
========
import Layout from "./layout"
import Page from "./page"
import Batch from "./[batch]"
>>>>>>>> d33f3ffd17c5e408f56d3aa6ef038f0f6cf86208:src/app/(switch)/land-uses/district-land-use/[project_id]/[locality_project_id]/questionnaire/[questionnaire_id]/index.ts

const Index = {
  path: ":project_id",
  children: [
    {
      index: true,
      Component: Page,
    },
<<<<<<<< HEAD:src/app/(switch)/ccro-management/ccro-projects/[project_id]/index.ts
    Edit,
    LocalityProjectId,
========
    Batch,
>>>>>>>> d33f3ffd17c5e408f56d3aa6ef038f0f6cf86208:src/app/(switch)/land-uses/district-land-use/[project_id]/[locality_project_id]/questionnaire/[questionnaire_id]/index.ts
  ],
}

export default Index

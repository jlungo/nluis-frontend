<<<<<<<< HEAD:src/app/(switch)/ccro-management/ccro-projects/create/index.ts
import Page from "./page";
========
import Layout from "./layout"
import Page from "./page"
import Batch from "./[batch]"
>>>>>>>> d33f3ffd17c5e408f56d3aa6ef038f0f6cf86208:src/app/(switch)/land-uses/regional-land-use/[project_id]/[locality_project_id]/questionnaire/[questionnaire_id]/index.ts

const Index = {
  path: "create",
  children: [
    {
      index: true,
      Component: Page,
    },
    Batch,
  ],
}

export default Index

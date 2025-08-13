import Layout from "./layout";
import Page from "./page";

import FormBuilder from "./form-builder";
import LevelSection from "./level-sections";
import ModuleLevels from "./module-levels";
import Builder from "./builder";

const Index = {
  path: "form-management",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    ModuleLevels,
    LevelSection,
    FormBuilder,
    Builder,
  ],
};

export default Index;

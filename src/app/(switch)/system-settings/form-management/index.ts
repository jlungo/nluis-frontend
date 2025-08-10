import Layout from "./layout";
import Page from "./page";
import Forms from "./forms";
import Responses from "./responses";

import FormBuilder from "./form-builder";
import LevelSection from "./level-sections";
import ModuleLevels from "./module-levels";

const Index = {
  path: "form-management",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    Forms,
    Responses,

    ModuleLevels,
    LevelSection,
    FormBuilder,
  ],
};

export default Index;

import Layout from "./layout";
import Page from "./page";
import QuestionnaireSlugPage from "./[questionnaire_slug]";
import QuestionnaireBuilder from "./questionnaire-builder";

const Index = {
  path: "questionnaires",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    QuestionnaireSlugPage,
    QuestionnaireBuilder,
  ],
};

export default Index;

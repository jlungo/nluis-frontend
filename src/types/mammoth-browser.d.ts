declare module "mammoth/mammoth.browser" {
  export interface MammothMessage {
    type?: string;
    message?: string;
  }

  export interface ConvertToHtmlOptions {
    styleMap?: string[];
    includeEmbeddedStyleMap?: boolean;
    transformDocument?: (document: any) => any | Promise<any>;
    convertImage?: (image: any) => any | Promise<any>;
    ignoreEmptyParagraphs?: boolean;
  }

  export interface ConvertToHtmlInput {
    arrayBuffer: ArrayBuffer;
  }

  export interface ConvertToHtmlResult {
    value: string;
    messages: MammothMessage[];
  }

  export function convertToHtml(
    input: ConvertToHtmlInput,
    options?: ConvertToHtmlOptions
  ): Promise<ConvertToHtmlResult>;
}

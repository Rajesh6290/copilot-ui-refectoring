declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Intercom?: (...args: unknown[]) => void;
  }
}
declare module "html-to-markdown" {
  export default function htmlToMarkdown(html: string): string;
}

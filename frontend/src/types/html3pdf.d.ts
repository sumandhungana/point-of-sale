declare module 'html3pdf' {
    interface Html3PdfOptions {
        margin?: number;
        filename?: string;
        image?: {
            type?: string;
            quality?: number;
        };
        html2canvas?: {
            scale?: number;
            useCORS?: boolean;
            logging?: boolean;
            letterRendering?: boolean;
        };
        jsPDF?: {
            unit?: string;
            format?: string;
            orientation?: 'portrait' | 'landscape';
        };
    }

    interface Html3PdfInstance {
        set: (options: Html3PdfOptions) => Html3PdfInstance;
        from: (element: HTMLElement) => Html3PdfInstance;
        save: () => Promise<void>;
    }

    function html3pdf(): Html3PdfInstance;
    export = html3pdf;
} 
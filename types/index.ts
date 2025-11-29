export interface Settings {
    geminiKey: string;
    googleClientId: string;
    googleDeveloperKey: string;  // Used for Google Picker API, NOT for Gemini
}

export interface GoogleOAuthToken {
    accessToken: string;
    expiresAt: number;
}

export interface CalendarEvent {
    id: string;
    summary: string;
    start?: {
        dateTime?: string;
        date?: string;
    };
    end?: {
        dateTime?: string;
        date?: string;
    };
}

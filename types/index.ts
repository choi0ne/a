export interface Settings {
    geminiKey: string;
    googleClientId: string;
    googleDeveloperKey: string;  // Used for Google Picker API, NOT for Gemini
}

export interface GoogleOAuthToken {
    accessToken: string;
    refreshToken?: string;  // Added for OAuth 2.0 PKCE flow
    expiresAt: number;
    tokenType?: string;     // Usually "Bearer"
    scope?: string;         // Granted scopes
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

import React from 'react';

export const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"></path>
    <path d="M17 11h-1c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92z"></path>
  </svg>
);

export const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h12v12H6z"></path>
  </svg>
);

export const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
  </svg>
);

export const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

export const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.44.17-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.3 9.81c-.11.2-.06.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.04.24.24.41.48.41h3.84c.24 0-.44.17-.48.41l-.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59.22l1.92-3.32c.12-.22.06-.47-.12-.61l-2.03-1.58zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
    </svg>
);
  
export const GeminiIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.542L16.5 21.75l-.398-1.208a3.375 3.375 0 00-2.456-2.456L12.75 18l1.208-.398a3.375 3.375 0 002.456-2.456L16.5 14.25l.398 1.208a3.375 3.375 0 002.456 2.456L20.25 18l-1.208.398a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
);
  
export const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const DjdLogoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
      className={className} 
      viewBox="0 0 50 50" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="50" height="50" rx="5" ry="5" fill="#1428A0" />
      <text 
        x="50%" 
        y="50%" 
        dominantBaseline="middle" 
        textAnchor="middle" 
        fill="white" 
        fontSize="20" 
        fontWeight="bold" 
        fontFamily="Arial, sans-serif"
      >
        DJD
      </text>
    </svg>
);

export const OpenAIIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M22.2819 10.1319C22.6244 10.3031 22.9994 10.6031 22.9994 11.0006V13.0006C22.9994 13.3981 22.6244 13.6981 22.2819 13.8694C22.2631 13.8781 22.2431 13.8863 22.2238 13.8938C21.7938 14.1044 21.3206 14.2156 20.8294 14.2156C20.3381 14.2156 19.8644 14.1044 19.4344 13.8938C19.4156 13.8863 19.3956 13.8781 19.3769 13.8694C19.0344 13.6981 18.6594 13.3981 18.6594 13.0006V11.0006C18.6594 10.6031 19.0344 10.3031 19.3769 10.1319C19.3956 10.1231 19.4156 10.1156 19.4344 10.1069C19.8644 9.89623 20.3381 9.78498 20.8294 9.78498C21.3206 9.78498 21.7938 9.89623 22.2238 10.1069C22.2431 10.1156 22.2631 10.1231 22.2819 10.1319ZM17.2438 10.8794C16.8138 10.6688 16.3406 10.5575 15.8494 10.5575C15.3581 10.5575 14.8844 10.6688 14.4544 10.8794C14.4356 10.8881 14.4156 10.8956 14.3969 10.9044C14.0544 11.0756 13.6794 11.3756 13.6794 11.7731V13.7731C13.6794 14.1706 14.0544 14.4706 14.3969 14.6419C14.4156 14.6506 14.4356 14.6581 14.4544 14.6669C14.8844 14.8775 15.3581 14.9887 15.8494 14.9887V15.7412C14.5294 15.7412 13.3794 15.1994 12.5306 14.2881C12.1131 13.8269 11.7894 13.2844 11.5869 12.6931C11.5356 12.5444 11.4938 12.3931 11.4619 12.2394C11.2331 11.1619 11.4438 10.0056 12.0488 9.04311C12.6994 8.01186 13.7256 7.28811 14.9088 7.02811L14.9656 7.01686C15.2419 6.96561 15.5306 6.93811 15.8494 6.93811C17.5519 6.93811 19.0069 8.35811 19.0069 10.0412C19.0069 10.2981 18.9831 10.5512 18.9369 10.8006C18.4906 10.7019 17.8869 10.8362 17.2438 10.8794ZM1.71688 13.8694C1.37438 13.6981 1 13.3981 1 13.0006V11.0006C1 10.6031 1.375 10.3031 1.7175 10.1319C1.73625 10.1231 1.75625 10.1156 1.77562 10.1069C2.20562 9.89623 2.67875 9.78498 3.17062 9.78498C3.66187 9.78498 4.13562 9.89623 4.56562 10.1069C4.58437 10.1156 4.60437 10.1231 4.62312 10.1319C4.96562 10.3031 5.34062 10.6031 5.34062 11.0006V13.0006C5.34062 13.3981 4.96562 13.6981 4.62312 13.8694C4.60437 13.8781 4.58437 13.8863 4.56562 13.8938C4.13562 14.1044 3.66187 14.2156 3.17062 14.2156C2.67875 14.2156 2.20562 14.1044 1.77562 13.8938C1.75625 13.8863 1.73625 13.8781 1.71688 13.8694ZM6.77563 10.9044C6.75688 10.8956 6.73687 10.8881 6.71812 10.8794C6.11312 10.8362 5.50937 10.7019 5.06312 10.8006C4.98687 10.5512 4.96312 10.2981 4.96312 10.0412C4.96312 8.35811 6.41812 6.93811 8.12062 6.93811C8.43937 6.93811 8.72812 6.96561 9.00437 7.01686L9.06125 7.02811C10.2444 7.28811 11.2706 8.01186 11.9212 9.04311C12.5262 10.0056 12.7369 11.1619 12.5081 12.2394C12.4762 12.3931 12.4344 12.5444 12.3831 12.6931C12.1806 13.2844 11.8569 13.8269 11.4394 14.2881C10.5906 15.1994 9.44062 15.7412 8.12062 15.7412V14.9887C8.61187 14.9887 9.08562 14.8775 9.51562 14.6669C9.53437 14.6581 9.55437 14.6506 9.57312 14.6419C9.91562 14.4706 10.2906 14.1706 10.2906 13.7731V11.7731C10.2906 11.3756 9.91562 11.0756 9.57312 10.9044C9.55437 10.8956 9.53437 10.8881 9.51562 10.8794C9.08562 10.6688 8.61187 10.5575 8.12062 10.5575C7.62937 10.5575 7.15562 10.6688 6.72562 10.8794L6.77563 10.9044ZM15.8494 6.23811C14.7581 6.23811 13.8569 6.55186 13.1969 7.14936L13.1531 7.18936C13.7831 6.50561 14.7706 6.04061 15.8494 6.04061C16.9281 6.04061 17.9156 6.50561 18.5456 7.18936L18.5019 7.14936C17.8419 6.55186 16.9406 6.23811 15.8494 6.23811ZM8.12062 6.23811C7.02937 6.23811 6.12812 6.55186 5.46812 7.14936L5.42437 7.18936C6.05437 6.50561 7.04187 6.04061 8.12062 6.04061C9.19937 6.04061 10.1869 6.50561 10.8169 7.18936L10.7731 7.14936C10.1131 6.55186 9.21187 6.23811 8.12062 6.23811Z" />
    </svg>
);

export const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);

export const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);
  
export const MarkdownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125A1.125 1.125 0 003 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
    </svg>
);

export const AttachmentIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.122 2.122l7.81-7.81" />
    </svg>
);

export const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.63 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

export const LogoutIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-3 0l-3-3m0 0l3-3m-3 3h12" />
    </svg>
);

export const GoogleCalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 12.25H6.25V18H12V12.25Z" fill="#1A73E8"/>
      <path d="M17.75 12.25H12V18H17.75V12.25Z" fill="#4285F4"/>
      <path d="M12 6.5H17.75V12.25H12V6.5Z" fill="#188038"/>
      <path d="M11.2183 2.64819L12 3.43069V6.5H6.25V3.42781C6.25 3.08594 6.51813 2.78406 6.85313 2.75156L11.2183 2.64819Z" fill="#34A853"/>
      <path d="M18.3531 2.75188C18.0181 2.78438 17.75 3.08625 17.75 3.42812V6.5H21.5625V5.625C21.5625 4.3125 20.5625 3.25 19.3125 3.25H18.6L18.3531 2.75188Z" fill="#4285F4"/>
      <path d="M2.4375 5.625V19.3125C2.4375 20.5625 3.4375 21.5625 4.6875 21.5625H19.3125C20.5625 21.5625 21.5625 20.5625 21.5625 19.3125V12.25H18.3534L18.6 12.5H17.75V18H6.25V12.25H12V6.5H6.25V5.625H4.6875C3.4375 5.625 2.4375 4.625 2.4375 3.375V5.625Z" fill="#4285F4"/>
      <path d="M11.2188 2.64844L6.85312 2.75188C6.51812 2.78438 6.25 3.08625 6.25 3.42812V6.5H12V3.43094L11.2188 2.64844Z" fill="#34A853"/>
      <path d="M12.7812 2.64844L12 3.43094V6.5H17.75V3.42812C17.75 3.08625 17.4819 2.78438 17.1469 2.75188L12.7812 2.64844Z" fill="#188038"/>
    </svg>
);

export const GoogleKeepIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 3h8c1.1 0 2 .9 2 2v2.17c0 .27-.11.52-.29.71L17 8.59V19c0 1.1-.9 2-2 2H9c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2z" fill="#FFC107"/>
        <path d="M14 4h-4c-.55 0-1 .45-1 1v1h6V5c0-.55-.45-1-1-1z" fill="#FFECB3"/>
        <path d="M17.71 7.29L16 9h-2v2h-4V9H8l-1.71-1.71C6.11 7.52 6 7.77 6 8.04V19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V8.04c0-.27-.11-.52-.29-.71z" fill="#FFD54F"/>
    </svg>
);

export const GoogleSheetsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.5,2H6A2,2,0,0,0,4,4V20a2,2,0,0,0,2,2H18a2,2,0,0,0,2-2V7.5L14.5,2M12,18H7v-2h5v2m3-4H7V12h8v2m0-4H7V8h8V10m2.5-7.5V6H18L14.5,2.5Z" fill="#20A464"/>
    </svg>
);

export const ClaudeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.92 11.45c0 3.32-2.31 4.55-5.41 4.55-2.25 0-5.41-1.09-5.41-6.18s3.4-6.36 6-6.36c2.31 0 4.82 2.05 4.82 4.4v-2.3h-2.1v-.95h3.04v7.3a4.5 4.5 0 01-1.04 3.1c-1.08 1.48-2.9 2.18-4.96 2.18-4.22 0-6.9-2.36-6.9-7.64S8.25 2 12.18 2c4.46 0 6.84 2.82 6.84 5.95v.91h-2.1v2.59h.01Z"/>
    </svg>
);

export const NotebookLMIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M10.51 3.5h7.02v1.85h-7.02V3.5ZM6 18.2V7.9H4V19.9c0 .9.8 1.6 1.7 1.6h12.5c.9 0 1.7-.7 1.7-1.6V7.9h-2v10.3H6ZM9.56 3.5c-.9 0-1.7.7-1.7 1.6v.95h-2V4.4c0-1.5 1.2-2.7 2.7-2.7h11c1.5 0 2.7 1.2 2.7 2.7v15.2c0 1.5-1.2 2.7-2.7 2.7H7.7c-1.5 0-2.7-1.2-2.7-2.7V7.05h2v-1.1c0-.9.8-1.6 1.7-1.6h.86Z" clipRule="evenodd"/>
    </svg>
);

export const SpeechifyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.193 18.067c-3.185 0-5.783-2.52-5.783-5.636s2.598-5.636 5.783-5.636c2.955 0 5.4 2.149 5.713 4.965h2.513c-.3-4.9-4.234-8.729-9.226-8.729C6.305 3.031 2 7.214 2 12.431s4.305 9.4 10.193 9.4c2.83 0 5.378-1.24 7.21-3.21l-1.92-1.983c-1.336 1.24-3.2 2.019-5.29 2.019m7.727-4.116c.453 0 .82.355.82.793v3.457c0 .438-.367.793-.82.793s-.82-.355-.82-.793v-3.457c0-.438.367.793.82-.793m-2.92-2.43c.453 0 .82.355.82.793v8.535c0 .438-.367.793-.82.793s-.82-.355-.82-.793V12.31c0-.438.367-.793.82-.793m-2.92 1.45c.453 0 .82.355.82.793v5.29c0 .438-.367.793-.82.793s-.82-.355-.82-.793v-5.29c0-.438.367-.793.82-.793Z"/>
    </svg>
);

export const GoogleDriveIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.7 2.58l-5.12 8.86a.4.4 0 00.34.6h10.24a.4.4 0 00.34-.6L8.38 2.58a.4.4 0 00-.68 0z" fill="#34A853"/>
        <path d="M21.42 12.64H11.18a.4.4 0 00-.34.6l5.12 8.86a.4.4 0 00.68 0l5.12-8.86a.4.4 0 00-.34-.6z" fill="#FFC107"/>
        <path d="M2.92 13.24a.4.4 0 000 .72l7.92 4.56a.4.4 0 00.4 0l7.92-4.56a.4.4 0 000-.72L11.24 8.1a.4.4 0 00-.4 0z" fill="#1A73E8"/>
    </svg>
);

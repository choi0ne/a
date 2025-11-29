// FIX: Removed references to missing type definitions for google.picker and gapi.client.drive.
// The global `window.gapi` and `window.google` are typed as `any`, which is sufficient for compilation.

declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

export const getOauthToken = (): string | null => {
    const storedTokenString = localStorage.getItem('googleOauthToken');
    if (!storedTokenString) {
        console.warn('⚠️ No OAuth token found in localStorage');
        return null;
    }

    try {
        const token = JSON.parse(storedTokenString);
        // Check if token exists and has more than 60 seconds left
        if (token?.accessToken && token.expiresAt > Date.now() + 60000) {
            return token.accessToken;
        }

        // Token expired - log for debugging
        console.warn('⚠️ OAuth token expired. Please re-authenticate.');
    } catch (e) {
        console.error("❌ Failed to parse OAuth token from localStorage", e);
        // If parsing fails, remove the invalid item
        localStorage.removeItem('googleOauthToken');
        return null;
    }

    // Token expired or invalid
    localStorage.removeItem('googleOauthToken');
    return null;
};

export const generateFilename = (prefix: string, extension: 'txt', nameSourceContent?: string): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timestamp = `${year}${month}${day}_${hours}${minutes}`;
    
    const contentForName = nameSourceContent ?? '';
    const match = contentForName.match(/환자명:\s*(.*)/);
    const patientNameRaw = match && match[1] ? match[1].trim() : '미확인';
    // Remove brackets if they exist
    let patientName = (patientNameRaw.replace(/^\[(.*)\]$/, '$1').trim()) || '미확인';
    // Sanitize for filename
    patientName = patientName.replace(/[\\?%*:"|<>./]/g, '_');
    
    return `${prefix}_${timestamp}_${patientName}.${extension}`;
};


export const saveToGoogleDrive = async (chartContent: string): Promise<void> => {
    const oauthToken = getOauthToken();
    if (!oauthToken) {
        console.error('❌ saveToGoogleDrive: No valid OAuth token');
        throw new Error("Google 로그인이 필요합니다. 토큰이 만료되었거나 로그인하지 않았습니다.");
    }

    if (!window.gapi?.client?.drive) {
        console.error('❌ saveToGoogleDrive: Google Drive API not loaded');
        throw new Error("Google Drive API가 로드되지 않았습니다.");
    }
    
    const FOLDER_ID = '1XGJmZp53bm_o-zaDgEzMv36FIxEL2e1F';
    const fileName = generateFilename('SOAP차트', 'txt', chartContent);
    
    try {
        const fileMetadata = {
            'name': fileName,
            'parents': [FOLDER_ID],
            'mimeType': 'text/plain'
        };
        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        const multipartRequestBody =
            delimiter +
            'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
            JSON.stringify(fileMetadata) +
            delimiter +
            'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
            chartContent +
            close_delim;

        await window.gapi.client.request({
            'path': '/upload/drive/v3/files',
            'method': 'POST',
            'params': {'uploadType': 'multipart'},
            'headers': { 'Content-Type': `multipart/related; boundary="${boundary}"` },
            'body': multipartRequestBody
        });
    } catch (err: any) {
        throw new Error(`Google Drive 저장 실패: ${err.result?.error?.message || '알 수 없는 오류'}`);
    }
};


export const openDrivePicker = (
    googleApiKey: string,
    pickerCallback: (data: any) => void
) => {
    const oauthToken = getOauthToken();
    if (!oauthToken) {
        console.error('❌ openDrivePicker: No valid OAuth token');
        throw new Error("Google 로그인이 필요합니다. 먼저 로그인해주세요.");
    }

    if (!window.google?.picker) {
        console.error('❌ openDrivePicker: Google Picker API not loaded');
        throw new Error("Google Picker API가 로드되지 않았습니다.");
    }

    const FOLDER_ID = '1XGJmZp53bm_o-zaDgEzMv36FIxEL2e1F';

    const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
        .setParent(FOLDER_ID)
        .setIncludeFolders(true);

    const picker = new window.google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(oauthToken)
        .setDeveloperKey(googleApiKey)
        .setCallback(pickerCallback)
        .build();
    picker.setVisible(true);
};

export const downloadDriveFile = async (fileData: any): Promise<File> => {
    const fileId = fileData.id;
    const oauthToken = getOauthToken();

    if (!oauthToken) {
        console.error('❌ downloadDriveFile: No valid OAuth token');
        throw new Error("Google 로그인이 필요합니다. 토큰이 만료되었거나 로그인하지 않았습니다.");
    }

    console.log(`📥 Downloading file: ${fileData.name} (ID: ${fileId})`);


    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { 'Authorization': `Bearer ${oauthToken}` }
    });

    if (!res.ok) {
        let detailedMessage = `HTTP ${res.status}`;
        try {
            const errorBody = await res.json();
            detailedMessage = errorBody.error.message || detailedMessage;
        } catch (e) {
            // Body might not be JSON, ignore and use status code.
        }

        if (res.status === 404) {
             throw new Error(`파일을 찾을 수 없습니다. 파일이 삭제되었거나 앱에 접근 권한이 없을 수 있습니다. (오류: ${detailedMessage})`);
        }
        
        throw new Error(`파일 다운로드 실패: ${detailedMessage}`);
    }

    const blob = await res.blob();
    return new File([blob], fileData.name, { type: fileData.mimeType });
};
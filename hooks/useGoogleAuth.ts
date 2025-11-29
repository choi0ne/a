import { useState, useEffect, useCallback } from 'react';
import { GoogleOAuthToken } from '../types';

declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

export const useGoogleAuth = (googleClientId: string, googleApiKey: string) => {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [tokenClient, setTokenClient] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Auto-refresh token before expiration
    useEffect(() => {
        if (!isSignedIn || !tokenClient) return;

        const checkAndRefreshToken = () => {
            const storedToken = localStorage.getItem('googleOauthToken');
            if (!storedToken) {
                console.log('⚠️ No token found, signing out');
                setIsSignedIn(false);
                return;
            }

            try {
                const token: GoogleOAuthToken = JSON.parse(storedToken);
                const timeUntilExpiry = token.expiresAt - Date.now();

                // If token expires in less than 5 minutes, refresh it
                if (timeUntilExpiry < 5 * 60 * 1000) {
                    console.log('🔄 Token expiring soon, refreshing...');

                    // Silent refresh (no prompt)
                    tokenClient.requestAccessToken({ prompt: '' });
                } else {
                    console.log(`✅ Token valid for ${Math.floor(timeUntilExpiry / 60000)} more minutes`);
                }
            } catch (e) {
                console.error('Failed to check token:', e);
            }
        };

        // Check immediately
        checkAndRefreshToken();

        // Then check every 5 minutes
        const intervalId = setInterval(checkAndRefreshToken, 5 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, [isSignedIn, tokenClient]);

    // Initialize Google APIs
    useEffect(() => {
        if (!googleClientId || !googleApiKey) {
            console.log('Google credentials not set');
            return;
        }

        const initializeGoogleAPIs = () => {
            if (!window.gapi || !window.google) {
                setTimeout(initializeGoogleAPIs, 100);
                return;
            }

            console.log('🔧 Initializing Google APIs...');

            // Initialize GAPI (for Calendar & Drive API calls)
            window.gapi.load('client:picker', async () => {
                try {
                    await window.gapi.client.init({
                        apiKey: googleApiKey,
                        discoveryDocs: [
                            'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
                            'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
                        ],
                    });
                    console.log('✅ GAPI client initialized');

                    // Restore previous session if available
                    const storedToken = localStorage.getItem('googleOauthToken');
                    if (storedToken) {
                        try {
                            const token: GoogleOAuthToken = JSON.parse(storedToken);
                            if (token.accessToken && token.expiresAt > Date.now() + 60000) {
                                window.gapi.client.setToken({ access_token: token.accessToken });
                                setIsSignedIn(true);
                                console.log('✅ Session restored from storage');
                            } else {
                                localStorage.removeItem('googleOauthToken');
                                console.log('⚠️ Stored token expired');
                            }
                        } catch (e) {
                            console.error('Failed to parse stored token:', e);
                            localStorage.removeItem('googleOauthToken');
                        }
                    }
                } catch (err) {
                    console.error('❌ GAPI initialization failed:', err);
                    setError('Google API 초기화 실패. API 키를 확인해주세요.');
                }
            });

            // Initialize GIS (for OAuth)
            try {
                const client = window.google.accounts.oauth2.initTokenClient({
                    client_id: googleClientId,
                    scope: [
                        'https://www.googleapis.com/auth/calendar.readonly',
                        'https://www.googleapis.com/auth/drive.file',
                        'https://www.googleapis.com/auth/drive.readonly'
                    ].join(' '),
                    callback: (response: any) => {
                        console.log('🔑 OAuth callback received:', response);

                        // Handle errors first
                        if (response.error) {
                            const errorMsg = response.error_description || response.error;
                            console.error('❌ OAuth error:', errorMsg);
                            setError(`인증 실패: ${errorMsg}`);
                            setIsSignedIn(false);
                            return;
                        }

                        // Handle success
                        if (response.access_token) {
                            const expiresAt = Date.now() + (response.expires_in * 1000);
                            const token: GoogleOAuthToken = {
                                accessToken: response.access_token,
                                expiresAt
                            };

                            localStorage.setItem('googleOauthToken', JSON.stringify(token));
                            window.gapi.client.setToken({ access_token: response.access_token });
                            setIsSignedIn(true);
                            setError(null);
                            console.log('✅ Login successful');
                        } else {
                            console.error('❌ No access token in response');
                            setError('액세스 토큰을 받지 못했습니다.');
                            setIsSignedIn(false);
                        }
                    },
                });

                setTokenClient(client);
                setIsInitialized(true);
                console.log('✅ OAuth client initialized');
            } catch (err) {
                console.error('❌ OAuth client initialization failed:', err);
                setError('OAuth 초기화 실패. Client ID를 확인해주세요.');
            }
        };

        initializeGoogleAPIs();
    }, [googleClientId, googleApiKey]);

    const signIn = useCallback(() => {
        console.log('🔐 Sign in requested');

        if (!tokenClient) {
            console.error('❌ Token client not initialized');
            setError('인증 클라이언트가 초기화되지 않았습니다.');
            return;
        }

        try {
            // Request access token with prompt
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } catch (err) {
            console.error('❌ Sign in failed:', err);
            setError('로그인 요청 실패');
        }
    }, [tokenClient]);

    const signOut = useCallback(() => {
        console.log('🚪 Sign out requested');

        const storedToken = localStorage.getItem('googleOauthToken');
        if (storedToken) {
            try {
                const token: GoogleOAuthToken = JSON.parse(storedToken);
                if (token.accessToken && window.google?.accounts?.oauth2) {
                    window.google.accounts.oauth2.revoke(token.accessToken, () => {
                        console.log('✅ Token revoked');
                    });
                }
            } catch (e) {
                console.error('Failed to revoke token:', e);
            }
        }

        localStorage.removeItem('googleOauthToken');
        setIsSignedIn(false);
        setError(null);
        console.log('✅ Signed out');
    }, []);

    // Check if current token is valid
    const isTokenValid = useCallback(() => {
        const storedToken = localStorage.getItem('googleOauthToken');
        if (!storedToken) return false;

        try {
            const token: GoogleOAuthToken = JSON.parse(storedToken);
            return token.accessToken && token.expiresAt > Date.now() + 60000;
        } catch {
            return false;
        }
    }, []);

    // Refresh token silently
    const refreshToken = useCallback(() => {
        console.log('🔄 Attempting to refresh token...');

        if (!tokenClient) {
            console.error('❌ Token client not initialized');
            return;
        }

        try {
            // Silent refresh without user interaction
            tokenClient.requestAccessToken({ prompt: '' });
        } catch (err) {
            console.error('❌ Token refresh failed:', err);
            setError('토큰 갱신 실패. 다시 로그인해주세요.');
            setIsSignedIn(false);
        }
    }, [tokenClient]);

    return {
        isSignedIn,
        isInitialized,
        error,
        signIn,
        signOut,
        refreshToken,
        isTokenValid,
        clearError: () => setError(null)
    };
};

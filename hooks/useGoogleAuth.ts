/**
 * Google OAuth Authentication Hook
 *
 * Manages Google OAuth 2.0 authentication using Authorization Code Flow with PKCE.
 *
 * AUTHENTICATION FLOW:
 * 1. User clicks sign in → opens OAuth consent page
 * 2. User authorizes → redirected back with authorization code
 * 3. Exchange code for tokens (access_token + refresh_token)
 * 4. Store tokens in localStorage
 * 5. Auto-refresh access_token using refresh_token before expiration
 *
 * KEY IMPROVEMENTS:
 * ✅ Real refresh_token support (unlimited auto-renewal)
 * ✅ No dependency on Google session cookies
 * ✅ Works offline after initial authorization
 * ✅ PKCE for security (no client secret needed)
 *
 * NOTE: This is completely separate from Gemini API key authentication
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleOAuthToken } from '../types';
import {
    buildAuthUrl,
    exchangeCodeForTokens,
    refreshAccessToken,
    revokeToken,
    parseOAuthCallback,
    verifyState
} from '../utils/oauth';

declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

const SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly'
];

export const useGoogleAuth = (googleClientId: string, googleDeveloperKey: string) => {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const refreshTimeoutRef = useRef<number | null>(null);

    // Auto-refresh token before expiration
    useEffect(() => {
        if (!isSignedIn || !googleClientId) return;

        const scheduleTokenRefresh = () => {
            const storedToken = localStorage.getItem('googleOauthToken');
            if (!storedToken) {
                console.log('⚠️ No token found, signing out');
                setIsSignedIn(false);
                return;
            }

            try {
                const token: GoogleOAuthToken = JSON.parse(storedToken);
                const timeUntilExpiry = token.expiresAt - Date.now();

                // If token expires in less than 5 minutes, refresh it now
                if (timeUntilExpiry < 5 * 60 * 1000) {
                    console.log('🔄 Token expiring soon, refreshing...');
                    performTokenRefresh();
                } else {
                    // Schedule refresh for 5 minutes before expiration
                    const refreshTime = timeUntilExpiry - (5 * 60 * 1000);
                    console.log(`⏰ Token refresh scheduled in ${Math.floor(refreshTime / 60000)} minutes`);

                    refreshTimeoutRef.current = window.setTimeout(() => {
                        performTokenRefresh();
                    }, refreshTime);
                }
            } catch (e) {
                console.error('Failed to schedule token refresh:', e);
            }
        };

        const performTokenRefresh = async () => {
            const storedToken = localStorage.getItem('googleOauthToken');
            if (!storedToken) return;

            try {
                const token: GoogleOAuthToken = JSON.parse(storedToken);

                if (!token.refreshToken) {
                    console.error('❌ No refresh token available');
                    setError('리프레시 토큰이 없습니다. 다시 로그인해주세요.');
                    setIsSignedIn(false);
                    return;
                }

                // Use refresh token to get new access token
                const newToken = await refreshAccessToken(token.refreshToken, googleClientId);

                // Update stored token
                localStorage.setItem('googleOauthToken', JSON.stringify(newToken));

                // Update GAPI client token
                if (window.gapi?.client) {
                    window.gapi.client.setToken({ access_token: newToken.accessToken });
                }

                console.log('✅ Token refreshed successfully');

                // Schedule next refresh
                scheduleTokenRefresh();
            } catch (e) {
                console.error('❌ Token refresh failed:', e);
                setError('토큰 갱신 실패. 다시 로그인해주세요.');
                setIsSignedIn(false);
            }
        };

        // Initial schedule
        scheduleTokenRefresh();

        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, [isSignedIn, googleClientId]);

    // Handle OAuth callback (when redirected back from Google)
    useEffect(() => {
        const handleOAuthCallback = async () => {
            const urlParams = parseOAuthCallback(window.location.href);

            // Check if this is an OAuth callback
            if (!urlParams.code && !urlParams.error) {
                return; // Not an OAuth callback
            }

            console.log('🔐 OAuth callback detected');
            setIsAuthenticating(true);

            try {
                // Handle errors
                if (urlParams.error) {
                    throw new Error(urlParams.error);
                }

                // Verify state for CSRF protection
                if (urlParams.state && !verifyState(urlParams.state)) {
                    throw new Error('State mismatch - possible CSRF attack');
                }

                // Exchange code for tokens
                if (urlParams.code) {
                    console.log('🔄 Exchanging code for tokens...');
                    const token = await exchangeCodeForTokens(urlParams.code, googleClientId);

                    // Store token
                    localStorage.setItem('googleOauthToken', JSON.stringify(token));

                    // Set GAPI client token
                    if (window.gapi?.client) {
                        window.gapi.client.setToken({ access_token: token.accessToken });
                    }

                    setIsSignedIn(true);
                    setError(null);
                    console.log('✅ Login successful with refresh token!');

                    // Clean up URL (remove OAuth parameters)
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            } catch (err: any) {
                console.error('❌ OAuth callback error:', err);
                setError(`인증 실패: ${err.message}`);
                setIsSignedIn(false);

                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } finally {
                setIsAuthenticating(false);
            }
        };

        if (googleClientId) {
            handleOAuthCallback();
        }
    }, [googleClientId]);

    // Initialize Google APIs
    useEffect(() => {
        if (!googleClientId || !googleDeveloperKey) {
            console.log('Google credentials not set');
            return;
        }

        const initializeGoogleAPIs = () => {
            if (!window.gapi) {
                setTimeout(initializeGoogleAPIs, 100);
                return;
            }

            console.log('🔧 Initializing Google APIs...');

            // Initialize GAPI (for Calendar & Drive API calls)
            window.gapi.load('client:picker', async () => {
                try {
                    await window.gapi.client.init({
                        apiKey: googleDeveloperKey,
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
                            // Check if token is still valid (with 1 minute buffer)
                            if (token.accessToken && token.expiresAt > Date.now() + 60000) {
                                window.gapi.client.setToken({ access_token: token.accessToken });
                                setIsSignedIn(true);
                                console.log('✅ Session restored from storage');
                            } else if (token.refreshToken) {
                                // Token expired but we have refresh token - will auto-refresh
                                setIsSignedIn(true);
                                console.log('⚠️ Access token expired, will refresh automatically');
                            } else {
                                localStorage.removeItem('googleOauthToken');
                                console.log('⚠️ Stored token expired and no refresh token');
                            }
                        } catch (e) {
                            console.error('Failed to parse stored token:', e);
                            localStorage.removeItem('googleOauthToken');
                        }
                    }

                    setIsInitialized(true);
                } catch (err) {
                    console.error('❌ GAPI initialization failed:', err);
                    setError('Google API 초기화 실패. API 키를 확인해주세요.');
                }
            });
        };

        initializeGoogleAPIs();
    }, [googleClientId, googleDeveloperKey]);

    const signIn = useCallback(async () => {
        console.log('🔐 Sign in requested');

        if (!googleClientId) {
            setError('Google Client ID가 설정되지 않았습니다.');
            return;
        }

        try {
            setIsAuthenticating(true);
            setError(null);

            // Build OAuth URL with PKCE
            const authUrl = await buildAuthUrl(googleClientId, SCOPES);

            console.log('🌐 Redirecting to Google OAuth...');

            // Redirect to Google OAuth consent page
            window.location.href = authUrl;
        } catch (err: any) {
            console.error('❌ Sign in failed:', err);
            setError(`로그인 요청 실패: ${err.message}`);
            setIsAuthenticating(false);
        }
    }, [googleClientId]);

    const signOut = useCallback(async () => {
        console.log('🚪 Sign out requested');

        const storedToken = localStorage.getItem('googleOauthToken');
        if (storedToken) {
            try {
                const token: GoogleOAuthToken = JSON.parse(storedToken);

                // Revoke both access and refresh tokens
                if (token.accessToken) {
                    await revokeToken(token.accessToken);
                }
                if (token.refreshToken) {
                    await revokeToken(token.refreshToken);
                }
            } catch (e) {
                console.error('Failed to revoke tokens:', e);
            }
        }

        // Clear stored token
        localStorage.removeItem('googleOauthToken');

        // Clear GAPI token
        if (window.gapi?.client) {
            window.gapi.client.setToken(null);
        }

        // Clear refresh timeout
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
        }

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

            // Valid if we have access token that's not expired
            // OR if we have refresh token (can always refresh)
            return (
                (token.accessToken && token.expiresAt > Date.now() + 60000) ||
                !!token.refreshToken
            );
        } catch {
            return false;
        }
    }, []);

    // Manual refresh (for testing or explicit refresh)
    const refreshToken = useCallback(async () => {
        console.log('🔄 Manual token refresh requested');

        const storedToken = localStorage.getItem('googleOauthToken');
        if (!storedToken) {
            setError('토큰이 없습니다.');
            return;
        }

        try {
            const token: GoogleOAuthToken = JSON.parse(storedToken);

            if (!token.refreshToken) {
                setError('리프레시 토큰이 없습니다. 다시 로그인해주세요.');
                setIsSignedIn(false);
                return;
            }

            const newToken = await refreshAccessToken(token.refreshToken, googleClientId);

            localStorage.setItem('googleOauthToken', JSON.stringify(newToken));

            if (window.gapi?.client) {
                window.gapi.client.setToken({ access_token: newToken.accessToken });
            }

            console.log('✅ Token manually refreshed');
        } catch (err: any) {
            console.error('❌ Manual token refresh failed:', err);
            setError(`토큰 갱신 실패: ${err.message}`);
            setIsSignedIn(false);
        }
    }, [googleClientId]);

    return {
        isSignedIn,
        isInitialized,
        isAuthenticating,
        error,
        signIn,
        signOut,
        refreshToken,
        isTokenValid,
        clearError: () => setError(null)
    };
};

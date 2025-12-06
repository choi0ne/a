/**
 * OAuth 2.0 Authorization Code Flow with PKCE
 *
 * This module implements OAuth 2.0 with PKCE (Proof Key for Code Exchange)
 * which allows secure OAuth flow in browser without server.
 *
 * Key features:
 * - Generates code_verifier and code_challenge for PKCE
 * - Exchanges authorization code for tokens (including refresh_token)
 * - Refreshes access tokens using refresh_token
 * - Works entirely in browser (no server needed)
 */

import { GoogleOAuthToken } from '../types';

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const REDIRECT_URI = window.location.origin + '/oauth-callback'; // Will handle in same window

/**
 * Generate a random string for PKCE code_verifier
 */
function generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return base64UrlEncode(array);
}

/**
 * Generate code_challenge from code_verifier using SHA-256
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return base64UrlEncode(new Uint8Array(hash));
}

/**
 * Base64 URL encode (without padding)
 */
function base64UrlEncode(buffer: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...buffer));
    return base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * Generate random state for CSRF protection
 */
function generateState(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return base64UrlEncode(array);
}

/**
 * Build OAuth authorization URL
 */
export async function buildAuthUrl(clientId: string, scopes: string[]): Promise<string> {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();

    // Store code_verifier and state for later verification
    sessionStorage.setItem('oauth_code_verifier', codeVerifier);
    sessionStorage.setItem('oauth_state', state);

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope: scopes.join(' '),
        access_type: 'offline',           // Request refresh_token
        prompt: 'consent',                 // Always show consent to get refresh_token
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
    });

    return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
    code: string,
    clientId: string
): Promise<GoogleOAuthToken> {
    const codeVerifier = sessionStorage.getItem('oauth_code_verifier');

    if (!codeVerifier) {
        throw new Error('Code verifier not found. OAuth flow may have been interrupted.');
    }

    const params = new URLSearchParams({
        client_id: clientId,
        code: code,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI
    });

    try {
        const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error_description || 'Token exchange failed');
        }

        const data = await response.json();

        // Clean up stored values
        sessionStorage.removeItem('oauth_code_verifier');
        sessionStorage.removeItem('oauth_state');

        const token: GoogleOAuthToken = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,  // This is the key! 🎉
            expiresAt: Date.now() + (data.expires_in * 1000),
            tokenType: data.token_type,
            scope: data.scope
        };

        console.log('✅ Tokens received:', {
            hasAccessToken: !!token.accessToken,
            hasRefreshToken: !!token.refreshToken,
            expiresIn: data.expires_in + 's'
        });

        return token;
    } catch (error) {
        console.error('❌ Token exchange error:', error);
        throw error;
    }
}

/**
 * Refresh access token using refresh_token
 */
export async function refreshAccessToken(
    refreshToken: string,
    clientId: string
): Promise<GoogleOAuthToken> {
    const params = new URLSearchParams({
        client_id: clientId,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
    });

    try {
        const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error_description || 'Token refresh failed');
        }

        const data = await response.json();

        const token: GoogleOAuthToken = {
            accessToken: data.access_token,
            refreshToken: refreshToken,  // Keep existing refresh_token
            expiresAt: Date.now() + (data.expires_in * 1000),
            tokenType: data.token_type,
            scope: data.scope
        };

        console.log('🔄 Token refreshed successfully');

        return token;
    } catch (error) {
        console.error('❌ Token refresh error:', error);
        throw error;
    }
}

/**
 * Revoke token (for sign out)
 */
export async function revokeToken(token: string): Promise<void> {
    try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        console.log('✅ Token revoked');
    } catch (error) {
        console.error('⚠️ Token revocation failed:', error);
        // Don't throw - revocation failure shouldn't block sign out
    }
}

/**
 * Parse OAuth callback URL
 */
export function parseOAuthCallback(url: string): { code?: string; state?: string; error?: string } {
    const params = new URLSearchParams(new URL(url).search);
    return {
        code: params.get('code') || undefined,
        state: params.get('state') || undefined,
        error: params.get('error') || undefined
    };
}

/**
 * Verify state parameter for CSRF protection
 */
export function verifyState(receivedState: string): boolean {
    const storedState = sessionStorage.getItem('oauth_state');
    return storedState === receivedState;
}

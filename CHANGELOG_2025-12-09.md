# 📋 변경사항: OAuth 2.0 PKCE 구현

**날짜**: 2025-12-09
**커밋**: `d3dbd62`
**브랜치**: `claude/fix-oauth-refresh-token-01MArsVNLTJEd38KKZ3wcMdU`
**작업자**: Claude AI Assistant

---

## 🎯 목표

Google OAuth Refresh Token이 발급되지 않는 근본적인 문제 해결

---

## ✨ 주요 변경사항

### 1. **Refresh Token 완전 지원**
- ✅ Authorization Code Flow with PKCE 구현
- ✅ 진짜 `refresh_token` 발급 및 저장
- ✅ 무제한 자동 토큰 갱신

**이전**:
- Cookie 기반 Silent Refresh (Google 세션 필요)
- Google 로그아웃 시 재로그인 필요
- Refresh Token 없음

**현재**:
- Refresh Token 기반 자동 갱신
- Google 세션 독립적
- 영구적 세션 유지

---

### 2. **PKCE (Proof Key for Code Exchange) 구현**
- ✅ 브라우저에서 안전한 OAuth 인증
- ✅ Client Secret 불필요
- ✅ CSRF 공격 방지 (state 검증)

**보안 강화**:
```
Code Verifier (랜덤 생성)
  → SHA-256 해싱
  → Code Challenge
  → Google OAuth
  → Authorization Code
  → PKCE로 검증하여 Token 교환
```

---

### 3. **자동 토큰 갱신 개선**
- ✅ Access Token 만료 5분 전 자동 갱신
- ✅ Refresh Token으로 영구 갱신 가능
- ✅ Google 로그아웃/쿠키 삭제 영향 없음

**갱신 로직**:
```javascript
// 만료 5분 전에 정확히 예약
const refreshTime = expiresAt - (5 * 60 * 1000);
setTimeout(() => {
  // Refresh Token으로 자동 갱신
  refreshAccessToken(refreshToken, clientId);
}, refreshTime);
```

---

## 📁 변경된 파일

### 🆕 **신규 생성**

#### `utils/oauth.ts` (230줄)
OAuth 2.0 PKCE 전체 구현:
- `generateCodeVerifier()` - PKCE code verifier 생성
- `generateCodeChallenge()` - SHA-256 해싱
- `buildAuthUrl()` - OAuth 인증 URL 생성
- `exchangeCodeForTokens()` - Code → Token 교환
- `refreshAccessToken()` - Refresh Token으로 갱신
- `revokeToken()` - 토큰 폐기
- `parseOAuthCallback()` - Callback URL 파싱
- `verifyState()` - CSRF 방지 검증

---

### 📝 **수정된 파일**

#### `hooks/useGoogleAuth.ts` (259줄 → 385줄)
완전히 재작성:

**제거**:
- ❌ GIS Token Client (`window.google.accounts.oauth2.initTokenClient`)
- ❌ Cookie 기반 silent refresh

**추가**:
- ✅ Authorization Code Flow
- ✅ OAuth Callback 처리
- ✅ Refresh Token 자동 갱신
- ✅ `isAuthenticating` 상태 추가

**새로운 함수**:
```typescript
// 로그인: OAuth 페이지로 리디렉션
const signIn = async () => {
  const authUrl = await buildAuthUrl(clientId, scopes);
  window.location.href = authUrl;
}

// 자동 갱신: Refresh Token 사용
const performTokenRefresh = async () => {
  const newToken = await refreshAccessToken(refreshToken, clientId);
  localStorage.setItem('googleOauthToken', JSON.stringify(newToken));
}
```

---

#### `types/index.ts`
토큰 타입 확장:

**이전**:
```typescript
interface GoogleOAuthToken {
  accessToken: string;
  expiresAt: number;
}
```

**현재**:
```typescript
interface GoogleOAuthToken {
  accessToken: string;
  refreshToken?: string;  // 🎉 추가!
  expiresAt: number;
  tokenType?: string;     // "Bearer"
  scope?: string;         // 권한 범위
}
```

---

#### `docs/AUTHENTICATION.md`
문서 대폭 업데이트:
- ✅ OAuth 2.0 PKCE 플로우 설명
- ✅ Google Cloud Console 설정 가이드
- ✅ 리디렉션 URI 설정 방법
- ✅ 토큰 구조 변경사항
- ✅ 이전 vs 현재 비교표

---

#### `tsconfig.json`
타입 설정 최적화:
- `refreshTimeoutRef` 타입 충돌 해결
- 브라우저 환경 최적화

---

## 🔧 기술적 세부사항

### 새로운 토큰 구조

```json
{
  "accessToken": "ya29.a0AfB_byC...",
  "refreshToken": "1//0gDEr8W9V...",
  "expiresAt": 1733735890000,
  "tokenType": "Bearer",
  "scope": "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/drive.file"
}
```

---

### OAuth 인증 플로우

```
1. 사용자 "Google 로그인" 클릭
   ↓
2. PKCE Code Verifier/Challenge 생성
   ↓
3. Google OAuth 페이지로 리디렉션
   (access_type=offline, prompt=consent)
   ↓
4. 사용자 권한 승인
   ↓
5. Authorization Code와 함께 앱으로 리디렉션
   (/oauth-callback?code=xxx&state=yyy)
   ↓
6. State 검증 (CSRF 방지)
   ↓
7. Code → Token 교환 (PKCE 검증)
   ↓
8. Access Token + Refresh Token 발급
   ↓
9. localStorage에 저장
   ↓
10. 자동 갱신 스케줄링
```

---

## ⚠️ Breaking Changes

### 1. **OAuth Redirect URI 설정 필수**

**Google Cloud Console 설정 필요**:

1. [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials) 접속
2. OAuth 2.0 클라이언트 ID 선택
3. **승인된 리디렉션 URI** 추가:
   - 개발: `http://localhost:5173/oauth-callback`
   - 프로덕션: `https://yourdomain.com/oauth-callback`
4. **승인된 JavaScript 원본** 추가:
   - 개발: `http://localhost:5173`
   - 프로덕션: `https://yourdomain.com`
5. 저장

---

### 2. **기존 사용자 재인증 필요**

**이유**:
- 기존 토큰에는 `refresh_token` 없음
- 새로운 OAuth 플로우로 토큰 재발급 필요

**조치**:
1. 한 번 로그아웃
2. 다시 로그인
3. Google OAuth 동의 페이지에서 권한 승인
4. Refresh Token 자동 발급

---

### 3. **토큰 구조 변경**

**필드 추가** (모두 optional이므로 기존 코드 호환):
- `refreshToken?: string`
- `tokenType?: string`
- `scope?: string`

---

## 📊 성능 및 개선 효과

### 비교표

| 항목 | 이전 (GIS) | 현재 (PKCE) |
|------|-----------|------------|
| **Refresh Token** | ❌ 없음 | ✅ 있음 |
| **자동 갱신** | ⚠️ 제한적 (쿠키 의존) | ✅ 무제한 |
| **Google 로그아웃 영향** | ❌ 재로그인 필요 | ✅ 영향 없음 |
| **브라우저 쿠키 의존** | ⚠️ 의존 | ✅ 독립적 |
| **세션 지속성** | ⚠️ 일시적 | ✅ 영구적 |
| **보안** | 중간 | ✅ 높음 (PKCE) |
| **서버 필요** | ❌ 불필요 | ❌ 불필요 |
| **갱신 간격** | 5분마다 체크 | 만료 5분 전 정확히 |

---

## 🧪 테스트 방법

### 1. **로컬 테스트**

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 localhost:5173 접속
```

---

### 2. **Refresh Token 확인**

```javascript
// 브라우저 개발자 도구 콘솔 (F12)
const token = JSON.parse(localStorage.getItem('googleOauthToken'));
console.log(token);

// 확인할 것:
// ✅ refreshToken: "1//..." (있어야 함)
// ✅ accessToken: "ya29..." (있어야 함)
// ✅ expiresAt: 숫자 (미래 시간)
```

---

### 3. **자동 갱신 테스트**

**방법 1**: 시간 경과 테스트
- 로그인 상태 유지하고 1시간 대기
- Console에 "🔄 Token refreshed successfully" 로그 확인

**방법 2**: Google 세션 독립성 테스트
- 앱에서 로그인
- 다른 탭에서 Google 계정 로그아웃
- 앱에서 Google Drive 저장 시도
- ✅ 정상 작동해야 함 (이전에는 실패)

---

### 4. **콘솔 로그 확인**

```
✅ 로그인 성공 시:
🔐 OAuth callback detected
🔄 Exchanging code for tokens...
✅ Tokens received: { hasAccessToken: true, hasRefreshToken: true, expiresIn: "3600s" }
✅ Login successful with refresh token!

✅ 토큰 갱신 시:
🔄 Token expiring soon, refreshing...
🔄 Token refreshed successfully
⏰ Token refresh scheduled in 55 minutes
```

---

## 📈 통계

### 코드 변경량

```
5 files changed
514 insertions(+)
122 deletions(-)
1 new file (utils/oauth.ts)
```

### 파일별 변경

| 파일 | 변경 | 라인 수 |
|------|------|--------|
| `utils/oauth.ts` | 신규 생성 | +230 |
| `hooks/useGoogleAuth.ts` | 재작성 | +126 / -122 |
| `docs/AUTHENTICATION.md` | 문서화 | +50 |
| `types/index.ts` | 타입 추가 | +3 |
| `tsconfig.json` | 설정 | +1 / -1 |

---

## 🔗 관련 리소스

### Git 정보
- **커밋 해시**: `d3dbd62`
- **브랜치**: `claude/fix-oauth-refresh-token-01MArsVNLTJEd38KKZ3wcMdU`
- **베이스 브랜치**: `main`

### 문서
- `docs/AUTHENTICATION.md` - OAuth 인증 전체 가이드
- `utils/oauth.ts` - PKCE 구현 코드
- `hooks/useGoogleAuth.ts` - OAuth Hook 구현

### 외부 링크
- [Google OAuth 2.0 문서](https://developers.google.com/identity/protocols/oauth2)
- [PKCE 스펙 (RFC 7636)](https://tools.ietf.org/html/rfc7636)
- [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

---

## 🎓 기술 용어 설명

### PKCE (Proof Key for Code Exchange)
- OAuth 2.0 확장 기능
- 브라우저/모바일 앱에서 안전한 OAuth 구현
- Client Secret 없이도 보안 유지
- Authorization Code 탈취 방지

### Refresh Token
- 만료되지 않는 영구 토큰
- Access Token 재발급에 사용
- 사용자 재로그인 없이 자동 갱신

### Authorization Code Flow
- OAuth 2.0 표준 인증 방식
- 2단계 인증 (Code → Token)
- 가장 안전한 OAuth 방식

---

## 📝 참고사항

### 보안 고려사항
- ✅ Refresh Token은 localStorage에 저장 (XSS 주의)
- ✅ PKCE로 Code 탈취 방지
- ✅ State 파라미터로 CSRF 방지
- ✅ HTTPS 필수 (프로덕션 환경)

### 호환성
- ✅ 기존 Gemini API 인증과 완전 독립적
- ✅ 기존 코드 영향 없음 (optional 필드)
- ✅ 점진적 마이그레이션 가능

### 제한사항
- Google이 Refresh Token 폐기할 수 있음:
  - 6개월 미사용 시
  - 보안 정책 변경 시
  - 사용자가 권한 취소 시
- 이 경우 재로그인 필요

---

## 🚀 다음 단계

### 즉시 필요한 작업
1. ✅ Google Cloud Console에서 Redirect URI 설정
2. ✅ 개발 환경에서 테스트
3. ✅ 기존 사용자에게 재로그인 안내

### 선택적 개선사항
- [ ] Refresh Token 암호화 (보안 강화)
- [ ] Token 만료 알림 UI
- [ ] 에러 처리 개선
- [ ] 로그인 상태 표시 개선

---

## ✅ 체크리스트

### 구현 완료
- [x] PKCE 구현 (`utils/oauth.ts`)
- [x] Authorization Code Flow 구현
- [x] Refresh Token 저장 및 관리
- [x] 자동 갱신 로직
- [x] TypeScript 타입 정의
- [x] 문서화
- [x] 빌드 검증

### 설정 필요
- [ ] Google Cloud Console Redirect URI 설정
- [ ] 프로덕션 환경 도메인 설정
- [ ] 기존 사용자 재로그인

### 테스트 완료
- [x] TypeScript 컴파일 성공
- [x] Vite 프로덕션 빌드 성공
- [ ] 실제 OAuth 플로우 테스트 (사용자가 수행)
- [ ] Refresh Token 갱신 테스트 (사용자가 수행)

---

## 💬 FAQ

**Q: 기존 사용자는 어떻게 되나요?**
A: 기존 토큰에는 refresh_token이 없으므로, 한 번 로그아웃 후 재로그인이 필요합니다.

**Q: Google 로그아웃하면 앱도 로그아웃되나요?**
A: 아니요! Refresh Token 덕분에 Google 세션과 독립적으로 작동합니다.

**Q: Refresh Token은 영구적인가요?**
A: 네, 하지만 Google이 6개월 미사용 시 폐기할 수 있습니다.

**Q: 서버가 필요한가요?**
A: 아니요! PKCE 덕분에 브라우저만으로 안전하게 작동합니다.

**Q: 이전 방식과 호환되나요?**
A: 네, 새로운 필드는 모두 optional이므로 기존 코드와 호환됩니다.

---

**작성일**: 2025-12-09
**작성자**: Claude AI Assistant
**검토자**: -
**승인자**: -

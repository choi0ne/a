# 인증 시스템 설명

이 애플리케이션은 **두 개의 독립적인 인증 시스템**을 사용합니다.

## 1. Gemini API 인증 (AI 서비스)

### 용도
- 음성 전사 (Speech-to-Text)
- SOAP 차트 생성
- 차트 내용 검수 및 수정
- 심층 분석

### 인증 방식
- **간단한 API 키** 사용
- 사용자 로그인 불필요
- Google AI Studio에서 발급

### 설정
- **변수명**: `geminiApiKey`
- **저장소**: `localStorage.getItem('geminiApiKey')`
- **설정 화면**: "Google Gemini API" 섹션
- **발급 URL**: https://makersuite.google.com/app/apikey

### 관련 파일
- `services/geminiService.ts` - Gemini API 호출
- `App.tsx` - API 키 사용 (transcription, chart generation)

---

## 2. Google OAuth 인증 (Workspace APIs)

### 용도
- Google Drive 파일 저장/불러오기
- Google Calendar 조회
- Google Picker (파일 선택)

### 인증 방식
- **OAuth 2.0 Authorization Code Flow with PKCE** 사용
- 사용자 Google 계정 로그인 필요
- **Refresh Token** 완전 지원 (무제한 자동 갱신)
- 서버 불필요 (브라우저만으로 안전한 인증)

### 설정
- **변수명**:
  - `googleClientId` - OAuth 클라이언트 ID
  - `googleDeveloperKey` - Google API Developer Key (Picker용)
- **저장소**:
  - `localStorage.getItem('googleClientId')`
  - `localStorage.getItem('googleDeveloperKey')`
  - `localStorage.getItem('googleOauthToken')` - OAuth 토큰 (JSON)
- **설정 화면**: "Google Workspace API" 섹션
- **발급 URL**: https://console.cloud.google.com/apis/credentials

### OAuth 클라이언트 설정 요구사항
⚠️ **중요**: Google Cloud Console에서 OAuth 클라이언트 생성 시:
1. **애플리케이션 유형**: "웹 애플리케이션" 선택
2. **승인된 리디렉션 URI**에 추가:
   - `http://localhost:5173/oauth-callback` (개발 환경)
   - `https://yourdomain.com/oauth-callback` (프로덕션 환경)
3. **승인된 JavaScript 원본**에 추가:
   - `http://localhost:5173` (개발 환경)
   - `https://yourdomain.com` (프로덕션 환경)

### 토큰 관리
- **자동 갱신**: 만료 5분 전 자동으로 갱신
- **갱신 방식**: Refresh Token 사용 (Google 세션 불필요)
- **저장 형식**:
  ```json
  {
    "accessToken": "ya29...",
    "refreshToken": "1//...",  // 🎉 진짜 refresh token!
    "expiresAt": 1234567890000,
    "tokenType": "Bearer",
    "scope": "https://www.googleapis.com/auth/..."
  }
  ```

### 인증 플로우
1. 사용자가 "Google 로그인" 클릭
2. Google OAuth 동의 페이지로 리디렉션
3. 사용자 권한 승인
4. Authorization Code와 함께 앱으로 리디렉션
5. PKCE를 사용하여 Code를 Token으로 교환
6. Access Token + **Refresh Token** 발급
7. localStorage에 토큰 저장
8. 이후 Access Token 만료 시 Refresh Token으로 자동 갱신

### 주요 개선사항 (2025-12-06)
✅ **Refresh Token 완전 지원**
- 이전: Cookie 기반 자동 갱신 (Google 세션 필요)
- 현재: Refresh Token 기반 (무제한 자동 갱신)

✅ **PKCE (Proof Key for Code Exchange)**
- 브라우저에서 안전하게 OAuth 사용
- Client Secret 불필요
- CSRF 공격 방지

✅ **무제한 토큰 갱신**
- Google 로그아웃해도 앱 세션 유지
- 브라우저 쿠키 삭제해도 영향 없음
- 한 번 로그인하면 Refresh Token으로 계속 갱신

### 관련 파일
- `hooks/useGoogleAuth.ts` - OAuth 인증 관리 (PKCE Flow)
- `utils/oauth.ts` - OAuth 헬퍼 함수 (PKCE, Token Exchange, Refresh)
- `services/googleDriveService.ts` - Drive API 호출
- `App.tsx` - 로그인/로그아웃 UI

---

## 에러 메시지 구분

### Gemini API 에러
- "Gemini API 키가 설정되지 않았습니다"
- "Gemini API 키가 잘못되었을 수 있습니다"
- "AI 모델 서비스에 문제가 있을 수 있습니다"

### Google OAuth 에러
- "Google 로그인이 필요합니다"
- "토큰이 만료되었거나 로그인하지 않았습니다"
- "Google 인증 문제로 Drive 저장 실패"
- "OAuth 초기화 실패"

---

## 주의사항

⚠️ **두 인증 시스템은 완전히 독립적입니다:**
- Gemini API 키로는 Google Drive에 접근할 수 없습니다
- Google OAuth 토큰으로는 AI 서비스를 사용할 수 없습니다
- 각각 별도로 설정해야 합니다

⚠️ **변수명 혼동 주의:**
- `geminiApiKey` ≠ `googleDeveloperKey`
- "Google Gemini API" ≠ "Google Workspace API"
- 두 개는 다른 서비스입니다!

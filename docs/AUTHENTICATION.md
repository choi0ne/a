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
- **OAuth 2.0** 사용
- 사용자 Google 계정 로그인 필요
- Access Token 발급 및 자동 갱신

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

### 토큰 관리
- **자동 갱신**: 만료 5분 전 자동으로 갱신
- **유효성 검사**: 5분마다 토큰 유효성 확인
- **저장 형식**:
  ```json
  {
    "accessToken": "ya29...",
    "expiresAt": 1234567890000
  }
  ```

### 관련 파일
- `hooks/useGoogleAuth.ts` - OAuth 인증 관리
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

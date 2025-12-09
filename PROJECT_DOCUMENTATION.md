# DJD SOAP 차트 시스템 - 종합 프로젝트 문서

> **작성일**: 2025-12-09
> **버전**: 1.0
> **목적**: 프로젝트 유지보수 및 개발 참고 자료

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [시스템 아키텍처](#시스템-아키텍처)
3. [주요 기능](#주요-기능)
4. [기술 스택](#기술-스택)
5. [파일 구조](#파일-구조)
6. [인증 시스템](#인증-시스템)
7. [API 및 서비스](#api-및-서비스)
8. [개발 히스토리](#개발-히스토리)
9. [설정 가이드](#설정-가이드)
10. [배포 프로세스](#배포-프로세스)
11. [트러블슈팅](#트러블슈팅)
12. [향후 개선사항](#향후-개선사항)

---

## 프로젝트 개요

### 프로젝트명
**DJD SOAP 차트 시스템** (djd_soap_main)

### 목적
한의원 진료 대화를 AI로 자동 전사하고 SOAP 형식의 의료 차트를 생성하는 웹 애플리케이션

### 핵심 가치
- ⏱️ **시간 절약**: 진료 후 차트 작성 시간을 80% 단축
- 📝 **정확성**: AI 기반 전사 및 의학 용어 자동 교정
- 🔄 **통합**: Google Drive/Calendar와 완벽한 연동
- 🎯 **전문성**: 한의학 특화 SOAP 차트 형식

### 주요 사용자
- 한의사 (Primary User)
- 의료 보조 인력
- 진료 기록 관리자

### 배포 정보
- **Repository**: https://github.com/choi0ne/a
- **AI Studio**: https://ai.studio/apps/drive/1YMOIS9MAZN3IbP3YgnoKOhLZBrKdiG2h
- **Netlify 배포**: 자동 배포 (main 브랜치)

---

## 시스템 아키텍처

### 전체 구조도

```
┌─────────────────────────────────────────────────────────────┐
│                        사용자 인터페이스                        │
│                      (React + TypeScript)                    │
└────────────┬────────────────────────────────────┬────────────┘
             │                                    │
    ┌────────▼────────┐                  ┌───────▼────────┐
    │  Gemini AI API  │                  │  Google APIs   │
    │  (AI Services)  │                  │  (Workspace)   │
    └────────┬────────┘                  └───────┬────────┘
             │                                    │
    ┌────────▼────────────────────────────────────▼────────┐
    │         음성 전사 → SOAP 차트 생성 → 저장/분석         │
    └───────────────────────────────────────────────────────┘
```

### 주요 컴포넌트

#### 1. **프론트엔드 (React)**
- **App.tsx**: 메인 애플리케이션 로직
- **Components**: 재사용 가능한 UI 컴포넌트
  - SettingsModal: API 키 설정
  - AnalysisModal: SOAP 차트 심층 분석
  - GoogleCalendarModal: 캘린더 연동
  - icons.tsx: SVG 아이콘 라이브러리

#### 2. **서비스 레이어**
- **geminiService.ts**: Gemini AI API 통신
  - 음성 전사
  - SOAP 차트 생성
  - 전사 내용 검수
  - 심층 분석
- **googleDriveService.ts**: Google Drive API 통신
  - 파일 저장/불러오기
  - 파일 선택 (Picker)

#### 3. **유틸리티**
- **audioUtils.ts**: 오디오 파일 처리
  - WAV 변환
  - 파일 분할 (대용량 처리)
- **hooks/useGoogleAuth.ts**: OAuth 인증 관리
  - 자동 토큰 갱신
  - 로그인 상태 관리

#### 4. **타입 시스템**
- **types/index.ts**: TypeScript 타입 정의
  - Settings, OAuthToken 등

---

## 주요 기능

### 1. 음성 녹음 및 전사

**기능 설명**:
- 실시간 음성 녹음 (MediaRecorder API)
- Gemini AI를 통한 한국어 음성 전사
- 대용량 파일 자동 분할 처리 (20MB 이상)

**사용 기술**:
- Browser MediaRecorder API
- Gemini 2.5 Pro (Primary), Gemini 2.5 Flash (Fallback)

**주요 코드**:
```typescript
// App.tsx
const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  // ... 녹음 로직
};

// geminiService.ts
export async function transcribeWithGemini(
  geminiApiKey: string,
  audioBlob: Blob
): Promise<string> {
  // 20MB 이상 파일은 5MB씩 분할
  if (audioBlob.size > MAX_FILE_SIZE_BYTES) {
    const chunks = await splitAudioBlob(audioBlob, CHUNK_SIZE_BYTES);
    // 병렬 전사 후 병합
  }
}
```

**특징**:
- ✅ 진료 대화 특화 시스템 인스트럭션
- ✅ 의학 용어 자동 인식
- ✅ 대용량 파일 병렬 처리로 속도 향상

### 2. SOAP 차트 자동 생성

**기능 설명**:
- 전사된 텍스트를 한의학 SOAP 형식으로 구조화
- 주관적(S), 객관적(O), 평가(A), 계획(P) 섹션 자동 분류
- 환자명, 진료일시, 요약, 체크리스트 포함

**SOAP 차트 형식**:
```
✅ 환자명: [자동 추출]
✅ 진료일시: 2025. 12. 9. 오후 2:30:00

S (주관적)
- 주호소: 요통
- 현병력: 3일 전부터 허리 통증 시작
- 악화·완화 요인: 오래 앉아있을 때 악화
- 관련 증상: 하지 저림

O (객관적)
- 시진: 자세 관찰
- 촉진/압통: L4-L5 부위 압통
- ROM/기능검사: 전방굴곡 제한

A (평가)
- 진단명: 요추 염좌
- 의증: 추간판 질환 의심

P (계획)
- 시술: 침치료, 부항
- 치료 빈도/기간: 주 3회, 2주
- 한약: [처방 내용]
- 예후: 양호
- 주의사항/금기: 무리한 동작 자제
- 생활지도/재활: 스트레칭 교육
- 추적계획: 2주 후 재평가

✅ 청구 태그: 침치료, 부항, 초진

✅ 요약
- 3일 전 발생한 요통 환자, 침치료 및 부항 시행

✅ 확인사항 (체크리스트)
1. 주소증에 대해서 정확하게 진찰했는가? → 예
2. 예후 및 주의사항이 누락되지 않았는가? → 예
3. 치료계획이 환자에게 충분히 설명되었는가? → 예
```

**주요 코드**:
```typescript
// geminiService.ts
const SYSTEM_INSTRUCTION = `
당신은 한의원 진료를 돕는 AI 어시스턴트입니다.
제공된 진료 기록을 한의과 SOAP 형식에 맞춰 정리합니다.
...
`;

export async function generateSoapChart(
  geminiApiKey: string,
  transcript: string,
  additionalNotes: string,
  consultationDate: Date
): Promise<string> {
  // SOAP 차트 생성 로직
}
```

### 3. 전사 내용 검수 및 수정

**기능 설명**:
- AI가 전사 내용을 자동 검수
- 오탈자, 문법 오류 교정
- 의학/한의학 용어 자동 수정

**주요 코드**:
```typescript
// geminiService.ts
export async function verifyAndCorrectTranscript(
  geminiApiKey: string,
  transcript: string
): Promise<string> {
  // 검수 및 수정 로직
}
```

### 4. SOAP 차트 심층 분석

**기능 설명**:
- 작성된 SOAP 차트를 비판적으로 검토
- 차트 작성 문제점 지적
- 필수 확인 질문 제시
- 진단 평가 및 치료 계획 검토
- 개선 사항 제안

**분석 보고서 형식**:
```
[차트 작성의 문제점]
- 주관적 정보(S)와 객관적 정보(O)가 혼재되어 있음

[필수 확인 및 질문 사항]
- 통증의 양상(쑤시는지, 저리는지 등) 구체화 필요

[진단 평가 및 제언]
- 추간판 질환 감별을 위한 추가 검사 권장

[치료 계획 검토]
- 물리치료 추가 고려

[핵심 요약]
1. 주호소 구체화 필요
2. 감별 진단 추가 검토
3. 치료 계획 보완
```

### 5. Google Drive 연동

**기능 설명**:
- SOAP 차트를 Google Drive에 자동 저장
- 파일명 자동 생성: `SOAP차트_YYYYMMDD_HHMM_환자명.txt`
- Google Picker를 통한 파일 불러오기
- 특정 폴더에 자동 저장

**주요 코드**:
```typescript
// googleDriveService.ts
export const saveToGoogleDrive = async (chartContent: string): Promise<void> => {
  const FOLDER_ID = '1XGJmZp53bm_o-zaDgEzMv36FIxEL2e1F';
  const fileName = generateFilename('SOAP차트', 'txt', chartContent);
  // Drive API 호출
};

export const generateFilename = (
  prefix: string,
  extension: 'txt',
  nameSourceContent?: string
): string => {
  // 환자명 추출 및 파일명 생성
  // 형식: SOAP차트_20251209_1430_홍길동.txt
};
```

### 6. Google Calendar 연동

**기능 설명**:
- 오늘의 진료 일정 조회
- 환자 정보 자동 불러오기
- 차트 작성 시 참고 가능

### 7. 파일 업로드 및 Drag & Drop

**기능 설명**:
- 녹음 파일(.wav, .webm, .mp3 등) 직접 업로드
- Drag & Drop 지원
- 자동 WAV 변환

**주요 코드**:
```typescript
// App.tsx
const handleFileDrop = async (e: React.DragEvent) => {
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('audio/')) {
    const wavBlob = await convertAudioToWav(file);
    // 전사 시작
  }
};
```

### 8. 외부 도구 연동 버튼

**통합된 도구들**:
- 🔵 **Claude**: AI 어시스턴트
- 🟣 **NotebookLM**: 문서 분석
- 🟠 **Speechify**: 텍스트 음성 변환
- 🟢 **Google Keep**: 메모
- 🔴 **Google Sheets**: 데이터 관리
- 📊 **DocTalk**: 문서 대화
- 🔄 **Re-visit**: 재방문 분석

---

## 기술 스택

### 프론트엔드
- **React 19.2.0**: UI 프레임워크
- **TypeScript 5.2.2**: 타입 안전성
- **Tailwind CSS 4.1.17**: 스타일링
- **Vite 5.2.0**: 빌드 도구

### AI/ML
- **Google Gemini 2.5 Pro**: 주 모델
- **Google Gemini 2.5 Flash**: 폴백 모델
- **@google/genai 1.29.0**: Gemini SDK

### APIs
- **Google OAuth 2.0**: 사용자 인증
- **Google Drive API v3**: 파일 관리
- **Google Calendar API v3**: 일정 조회
- **Google Picker API**: 파일 선택

### 개발 도구
- **PostCSS 8.5.6**: CSS 처리
- **Autoprefixer 10.4.22**: 브라우저 호환성
- **ESLint + Prettier**: 코드 품질

### 배포
- **Netlify**: 자동 배포 및 호스팅
- **Git/GitHub**: 버전 관리

---

## 파일 구조

```
a/
├── public/
│   └── _headers                    # HTTP 보안 헤더 설정
│
├── src/
│   └── index.css                   # 글로벌 스타일
│
├── components/
│   ├── AnalysisModal.tsx           # SOAP 차트 분석 모달
│   ├── GoogleCalendarModal.tsx     # 캘린더 모달
│   ├── SettingsModal.tsx           # 설정 모달
│   └── icons.tsx                   # SVG 아이콘 라이브러리
│
├── docs/
│   └── AUTHENTICATION.md           # 인증 시스템 설명서
│
├── hooks/
│   └── useGoogleAuth.ts            # Google OAuth 커스텀 훅
│
├── services/
│   ├── geminiService.ts            # Gemini AI 서비스
│   └── googleDriveService.ts       # Google Drive 서비스
│
├── types/
│   └── index.ts                    # TypeScript 타입 정의
│
├── utils/
│   └── audioUtils.ts               # 오디오 처리 유틸리티
│
├── App.tsx                         # 메인 애플리케이션
├── index.tsx                       # 엔트리 포인트
├── index.html                      # HTML 템플릿
│
├── package.json                    # 의존성 관리
├── package-lock.json               # 의존성 잠금 파일
├── tsconfig.json                   # TypeScript 설정
├── vite.config.ts                  # Vite 빌드 설정
├── tailwind.config.js              # Tailwind CSS 설정
├── postcss.config.js               # PostCSS 설정
│
├── CLAUDE.md                       # AI 어시스턴트 가이드
├── README.md                       # 프로젝트 소개
└── PROJECT_DOCUMENTATION.md        # 이 문서
```

### 주요 파일 설명

#### **App.tsx** (메인 애플리케이션)
- 상태 관리 (녹음, 전사, 차트 생성)
- UI 렌더링 및 이벤트 핸들링
- API 호출 오케스트레이션
- 약 800줄

#### **geminiService.ts** (AI 서비스)
- `transcribeWithGemini()`: 음성 전사
- `generateSoapChart()`: SOAP 차트 생성
- `verifyAndCorrectTranscript()`: 전사 검수
- `analyzeSoapChart()`: 심층 분석
- Retry 로직 및 Fallback 처리
- 약 400줄

#### **googleDriveService.ts** (Drive 서비스)
- `saveToGoogleDrive()`: 파일 저장
- `openDrivePicker()`: 파일 선택
- `downloadDriveFile()`: 파일 다운로드
- `getOauthToken()`: OAuth 토큰 관리
- 약 200줄

#### **useGoogleAuth.ts** (인증 훅)
- OAuth 초기화 및 로그인/로그아웃
- 토큰 자동 갱신 (5분마다)
- 에러 처리
- 약 150줄

#### **audioUtils.ts** (오디오 처리)
- `convertAudioToWav()`: WAV 변환
- `splitAudioBlob()`: 파일 분할
- 약 100줄

---

## 인증 시스템

### 🔐 두 개의 독립적인 인증 시스템

#### 1. **Gemini API 인증** (AI 서비스)

**용도**:
- 음성 전사
- SOAP 차트 생성
- 전사 검수
- 심층 분석

**인증 방식**:
- 간단한 API 키
- 사용자 로그인 불필요

**설정**:
```typescript
// localStorage
geminiApiKey: string
```

**발급처**:
- https://makersuite.google.com/app/apikey

**관련 파일**:
- `services/geminiService.ts`

#### 2. **Google OAuth 2.0** (Workspace APIs)

**용도**:
- Google Drive 파일 저장/불러오기
- Google Calendar 조회
- Google Picker 사용

**인증 방식**:
- OAuth 2.0
- 사용자 Google 계정 로그인 필요
- Access Token 자동 갱신

**설정**:
```typescript
// localStorage
googleClientId: string        // OAuth 클라이언트 ID
googleDeveloperKey: string    // Developer Key (Picker용)
googleOauthToken: {           // OAuth 토큰
  accessToken: string,
  expiresAt: number
}
```

**발급처**:
- https://console.cloud.google.com/apis/credentials

**관련 파일**:
- `hooks/useGoogleAuth.ts`
- `services/googleDriveService.ts`

**토큰 갱신 로직**:
```typescript
// useGoogleAuth.ts
useEffect(() => {
  const interval = setInterval(() => {
    const tokenString = localStorage.getItem('googleOauthToken');
    if (tokenString) {
      const token = JSON.parse(tokenString);
      const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;

      // 5분 이내 만료 시 자동 갱신
      if (token.expiresAt < fiveMinutesFromNow) {
        refreshToken();
      }
    }
  }, 5 * 60 * 1000); // 5분마다 체크

  return () => clearInterval(interval);
}, []);
```

### ⚠️ 주의사항

**변수명 혼동 방지**:
- `geminiApiKey` ≠ `googleDeveloperKey`
- 두 개는 완전히 다른 서비스!

**독립성**:
- Gemini API 키로는 Google Drive 접근 불가
- Google OAuth로는 AI 서비스 사용 불가

---

## API 및 서비스

### Gemini AI API

#### **transcribeWithGemini()**
```typescript
export async function transcribeWithGemini(
  geminiApiKey: string,
  audioBlob: Blob
): Promise<string>
```

**기능**: 오디오를 텍스트로 전사

**파라미터**:
- `geminiApiKey`: Gemini API 키
- `audioBlob`: 오디오 파일 (Blob)

**반환값**: 전사된 텍스트 (string)

**특징**:
- 20MB 이상 파일은 5MB씩 자동 분할
- 병렬 처리로 속도 향상
- Primary/Fallback 모델 자동 전환
- Retry 로직 (최대 2회)

**시스템 인스트럭션**:
```
당신은 의료 진료 대화를 전사하는 전문 전사 AI입니다.

[전사 규칙]
1. 오디오에서 실제로 들리는 말만 정확하게 전사
2. 들리지 않는 내용 추측 금지
3. 내용 요약/의역 금지
4. 불명확한 부분은 [불명확]으로 표시
5. 배경 소음 무시
6. 설명/해석/주석 추가 금지
7. 전사된 텍스트만 출력
```

#### **generateSoapChart()**
```typescript
export async function generateSoapChart(
  geminiApiKey: string,
  transcript: string,
  additionalNotes: string,
  consultationDate: Date
): Promise<string>
```

**기능**: SOAP 차트 생성

**파라미터**:
- `geminiApiKey`: API 키
- `transcript`: 전사된 텍스트
- `additionalNotes`: 추가 메모
- `consultationDate`: 진료일시

**반환값**: SOAP 차트 (string)

**시스템 인스트럭션**:
```
당신은 한의원 진료를 돕는 AI 어시스턴트입니다.

작동 목표:
1. 진료 기록을 한의과 SOAP 형식으로 정리
2. 기록에 있는 내용만 사용 (추론 금지)
3. 숫자, 경혈명, 용량 등 원문 유지
4. 특정 정보 없으면 "미확인" 표시
5. 요약 및 체크리스트 포함
6. 인사말 없이 바로 본문 시작
```

#### **verifyAndCorrectTranscript()**
```typescript
export async function verifyAndCorrectTranscript(
  geminiApiKey: string,
  transcript: string
): Promise<string>
```

**기능**: 전사 내용 검수 및 수정

**파라미터**:
- `geminiApiKey`: API 키
- `transcript`: 원본 전사 텍스트

**반환값**: 수정된 전사 텍스트 (string)

**시스템 인스트럭션**:
```
당신은 의료 기록 전문 검수 AI입니다.

수정 규칙:
1. 오탈자 및 문법 오류 교정
2. 의학/한의학 용어 정확하게 수정
3. 원래 의미/내용 변경 금지
4. 수정된 텍스트만 출력
```

#### **analyzeSoapChart()**
```typescript
export async function analyzeSoapChart(
  geminiApiKey: string,
  chartContent: string
): Promise<string>
```

**기능**: SOAP 차트 심층 분석

**파라미터**:
- `geminiApiKey`: API 키
- `chartContent`: SOAP 차트 내용

**반환값**: 분석 보고서 (string)

**분석 항목**:
1. 차트 작성의 문제점
2. 필수 확인 및 질문 사항
3. 진단 평가 및 제언
4. 치료 계획 검토
5. 핵심 요약

### Google Drive API

#### **saveToGoogleDrive()**
```typescript
export const saveToGoogleDrive = async (
  chartContent: string
): Promise<void>
```

**기능**: SOAP 차트를 Google Drive에 저장

**파라미터**:
- `chartContent`: 저장할 차트 내용

**저장 위치**:
- Folder ID: `1XGJmZp53bm_o-zaDgEzMv36FIxEL2e1F`

**파일명 형식**:
- `SOAP차트_YYYYMMDD_HHMM_환자명.txt`
- 예: `SOAP차트_20251209_1430_홍길동.txt`

**에러 처리**:
```typescript
if (!oauthToken) {
  throw new Error("Google 로그인이 필요합니다.");
}
if (!window.gapi?.client?.drive) {
  throw new Error("Google Drive API가 로드되지 않았습니다.");
}
```

#### **openDrivePicker()**
```typescript
export const openDrivePicker = (
  googleDeveloperKey: string,
  pickerCallback: (data: any) => void
) => void
```

**기능**: Google Picker로 파일 선택

**파라미터**:
- `googleDeveloperKey`: Developer Key
- `pickerCallback`: 파일 선택 시 콜백

**선택 가능 파일**:
- 특정 폴더 내 `.txt` 파일

#### **downloadDriveFile()**
```typescript
export const downloadDriveFile = async (
  fileData: any
): Promise<File>
```

**기능**: Drive 파일 다운로드

**파라미터**:
- `fileData`: Picker에서 선택한 파일 정보

**반환값**: File 객체

### Google Calendar API

**기능**: 오늘의 일정 조회

**사용 위치**:
- `components/GoogleCalendarModal.tsx`

**API 호출**:
```typescript
const response = await window.gapi.client.calendar.events.list({
  calendarId: 'primary',
  timeMin: new Date().toISOString(),
  maxResults: 10,
  singleEvents: true,
  orderBy: 'startTime',
});
```

---

## 개발 히스토리

### 주요 브랜치 통합 내역

#### **2025-12-09: 전체 브랜치 통합 (PR #6)**

**통합된 브랜치**:
1. `claude/claude-md`: AI 어시스턴트 가이드 추가
2. `claude/fix-google-login`: Google 인증 개선 (8개 커밋)
3. `claude/trigger-deploy`: UI 레이아웃 개선

**변경 내용**:
- ✅ CLAUDE.md 문서 추가 (245줄)
- ✅ docs/AUTHENTICATION.md 추가 (96줄)
- ✅ Google OAuth 인증 버그 수정
- ✅ 에러 핸들링 및 로깅 강화
- ✅ Tailwind v4 설정 및 브랜드 색상 수정
- ✅ 리소스 로컬 관리로 전환
- ✅ UI 버튼 레이아웃 수평 배치
- ✅ package-lock.json 추가

**커밋 히스토리** (15개):
```
6ab566d Merge pull request #6
ee2c0f6 Consolidate all branch changes
e9c95cd Merge branch 'claude/trigger-deploy'
3374720 Merge branch 'claude/fix-google-login'
7bdd484 Merge branch 'claude/claude-md'
a9ed7c2 Layout re-visit and DocTalk buttons horizontally
1cb765c Fix brand colors for Tailwind v4
97638cd Move all resources to local management
ebc8b35 Fix COOP policy for Google OAuth popup
e84240a Add package-lock.json
4e825c6 Fix authentication conflicts
c8b4b6a Improve Google Drive authentication
9e586d0 Add React TypeScript type definitions
5553296 Add missing files
0a96e1e docs: Add comprehensive CLAUDE.md
```

### 개발 타임라인

**Phase 1: 초기 개발**
- 음성 녹음 기능 구현
- Gemini API 연동
- 기본 UI 구성

**Phase 2: SOAP 차트 기능**
- SOAP 차트 자동 생성
- 한의학 특화 프롬프트 작성
- 전사 검수 기능 추가

**Phase 3: Google 연동**
- Google OAuth 구현
- Drive 저장/불러오기
- Calendar 연동

**Phase 4: 고도화**
- 심층 분석 기능
- 대용량 파일 처리
- UI/UX 개선
- 외부 도구 연동

**Phase 5: 안정화 (현재)**
- 버그 수정
- 에러 핸들링 강화
- 문서화
- 배포 자동화

---

## 설정 가이드

### 1. 개발 환경 설정

#### **사전 요구사항**:
- Node.js 18+
- npm 또는 yarn
- Git

#### **설치 단계**:
```bash
# 1. 저장소 클론
git clone https://github.com/choi0ne/a.git
cd a

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev

# 4. 브라우저에서 열기
# http://localhost:5173
```

### 2. API 키 설정

#### **Gemini API 키**:
1. https://makersuite.google.com/app/apikey 접속
2. "Create API key" 클릭
3. API 키 복사
4. 앱의 설정 모달에서 "Google Gemini API" 섹션에 입력

#### **Google OAuth 설정**:

**Google Cloud Console 설정**:
1. https://console.cloud.google.com 접속
2. 새 프로젝트 생성
3. "APIs & Services" → "Credentials" 이동
4. "Create Credentials" → "OAuth 2.0 Client ID" 선택
5. Application type: "Web application"
6. Authorized JavaScript origins:
   - `http://localhost:5173` (개발)
   - `https://your-netlify-app.netlify.app` (배포)
7. Client ID 및 API Key 복사

**필수 API 활성화**:
- Google Drive API
- Google Calendar API
- Google Picker API

**앱에서 설정**:
- 설정 모달 → "Google Workspace API" 섹션
- Client ID 입력
- Developer Key 입력

### 3. 환경 변수 (선택)

`.env.local` 파일 생성 (선택사항):
```bash
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_GOOGLE_DEVELOPER_KEY=your_developer_key
```

**주의**: 프로덕션에서는 환경 변수 사용 권장

### 4. CORS 및 보안 헤더 설정

**Netlify 설정** (`public/_headers`):
```
/*
  Cross-Origin-Opener-Policy: same-origin-allow-popups
  Cross-Origin-Embedder-Policy: require-corp
```

**중요**: Google OAuth 팝업이 작동하려면 `same-origin-allow-popups` 필수

---

## 배포 프로세스

### Netlify 자동 배포

#### **배포 트리거**:
- `main` 브랜치에 push
- PR이 `main`에 merge

#### **빌드 설정**:
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### **빌드 명령어**:
```bash
npm run build
```

**결과물**:
- `dist/` 디렉토리에 빌드된 파일 생성
- HTML, CSS, JS 번들

### 수동 배포

#### **로컬 빌드 및 테스트**:
```bash
# 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

#### **배포 체크리스트**:
- [ ] 모든 테스트 통과
- [ ] 빌드 에러 없음
- [ ] API 키 설정 확인
- [ ] CORS 설정 확인
- [ ] 브라우저 호환성 테스트

### 배포 후 확인사항

1. ✅ 앱이 정상적으로 로드되는지 확인
2. ✅ API 키 설정 모달이 표시되는지 확인
3. ✅ 녹음 기능 테스트
4. ✅ Google 로그인 테스트
5. ✅ Drive 저장/불러오기 테스트
6. ✅ SOAP 차트 생성 테스트

---

## 트러블슈팅

### 일반적인 문제

#### 1. **"Gemini API 키가 설정되지 않았습니다"**

**원인**:
- API 키 미설정

**해결**:
1. 설정 모달 열기
2. "Google Gemini API" 섹션에 API 키 입력
3. 저장

#### 2. **"Google 로그인이 필요합니다"**

**원인**:
- OAuth 토큰 만료
- Client ID 미설정

**해결**:
1. 설정 모달에서 Google Client ID 확인
2. "Google 계정 로그인" 버튼 클릭
3. 팝업에서 계정 선택 및 권한 승인

#### 3. **OAuth 팝업이 차단됨**

**원인**:
- 브라우저 팝업 차단
- CORS 정책 문제

**해결**:
1. 브라우저 팝업 차단 해제
2. `public/_headers`에 `same-origin-allow-popups` 설정 확인
3. Netlify 재배포

#### 4. **"Google Drive API가 로드되지 않았습니다"**

**원인**:
- Google API 스크립트 로드 실패
- 네트워크 오류

**해결**:
1. 페이지 새로고침
2. 네트워크 연결 확인
3. 브라우저 콘솔에서 에러 로그 확인

#### 5. **대용량 파일 전사 실패**

**원인**:
- 파일 크기 제한 초과
- 메모리 부족

**해결**:
- 자동 분할 처리됨 (20MB 이상)
- 파일 크기가 너무 크면 (100MB+) 수동으로 분할

#### 6. **SOAP 차트 생성이 느림**

**원인**:
- Gemini API 응답 지연
- Primary 모델 오류로 Fallback 사용

**해결**:
- 정상 동작 (AI 처리 시간 필요)
- 네트워크 상태 확인
- API 키 할당량 확인

### 개발 중 문제

#### **TypeScript 에러**

```bash
# 타입 체크
npm run build

# tsconfig.json 확인
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "strict": true
  }
}
```

#### **Tailwind CSS 적용 안됨**

```bash
# Tailwind 설정 확인
# tailwind.config.js
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
}

# PostCSS 설정 확인
# postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

#### **Vite 빌드 에러**

```bash
# 캐시 삭제 후 재빌드
rm -rf node_modules/.vite
rm -rf dist
npm run build
```

### 로그 및 디버깅

#### **브라우저 콘솔 활용**:
```javascript
// 개발자 도구 → Console
// 에러 로그 확인
console.error() // 빨간색 에러
console.warn()  // 노란색 경고
console.log()   // 일반 로그
```

#### **네트워크 탭 확인**:
1. F12 → Network 탭
2. API 호출 상태 확인
3. 요청/응답 헤더 확인
4. 페이로드 확인

#### **localStorage 확인**:
```javascript
// 개발자 도구 → Application → Local Storage
localStorage.getItem('geminiApiKey')
localStorage.getItem('googleOauthToken')
```

---

## 향후 개선사항

### 단기 개선 (1-3개월)

#### 1. **사용자 경험 개선**
- [ ] 로딩 애니메이션 추가
- [ ] 진행 상황 표시 (%)
- [ ] 키보드 단축키 지원
- [ ] 다크 모드 지원

#### 2. **기능 확장**
- [ ] SOAP 차트 템플릿 커스터마이징
- [ ] 즐겨찾기 기능
- [ ] 검색 기능 (과거 차트)
- [ ] 차트 버전 관리

#### 3. **안정성 향상**
- [ ] 오프라인 모드 지원
- [ ] 자동 저장 기능
- [ ] 에러 리포팅 시스템
- [ ] Unit 테스트 추가

### 중기 개선 (3-6개월)

#### 1. **데이터 관리**
- [ ] 데이터베이스 연동 (Supabase/Firebase)
- [ ] 환자 관리 시스템
- [ ] 진료 기록 통계
- [ ] 데이터 백업/복원

#### 2. **AI 고도화**
- [ ] 커스텀 프롬프트 작성 기능
- [ ] 진단 보조 AI
- [ ] 처방 추천 시스템
- [ ] 음성 명령 지원

#### 3. **협업 기능**
- [ ] 다중 사용자 지원
- [ ] 차트 공유 기능
- [ ] 실시간 협업
- [ ] 권한 관리

### 장기 비전 (6개월+)

#### 1. **플랫폼 확장**
- [ ] 모바일 앱 (React Native)
- [ ] 태블릿 최적화
- [ ] 데스크톱 앱 (Electron)

#### 2. **통합 EMR 시스템**
- [ ] 예약 관리
- [ ] 청구 시스템
- [ ] 재고 관리
- [ ] 보고서 생성

#### 3. **AI 학습 및 개인화**
- [ ] 사용자별 AI 학습
- [ ] 진료 패턴 분석
- [ ] 맞춤형 차트 템플릿
- [ ] 예측 분석

---

## 사업 계획

### 비즈니스 모델

#### **타겟 시장**:
- 한의원 (Primary)
- 양방 병/의원
- 재활의학과
- 물리치료실

#### **수익 모델**:
1. **SaaS 구독**:
   - Basic: 월 29,000원 (1 사용자)
   - Pro: 월 79,000원 (5 사용자)
   - Enterprise: 월 199,000원 (무제한)

2. **API 사용료**:
   - Gemini API: 사용량 기반
   - 추가 AI 기능: 건당 과금

3. **커스터마이징**:
   - 맞춤형 프롬프트: 100만원~
   - EMR 통합: 500만원~

### 경쟁 우위

1. **AI 특화**:
   - 한의학 전문 AI 프롬프트
   - 높은 전사 정확도
   - 자동 의학 용어 교정

2. **사용 편의성**:
   - 간단한 UI
   - 빠른 설정 (5분 이내)
   - 클라우드 기반 (설치 불필요)

3. **통합성**:
   - Google Workspace 완벽 연동
   - 외부 도구 연계
   - 확장 가능한 아키텍처

### 마케팅 전략

1. **초기 고객 확보**:
   - 무료 체험 (14일)
   - 한의사 커뮤니티 홍보
   - 학회 발표 및 데모

2. **입소문 마케팅**:
   - 추천 프로그램 (1개월 무료)
   - 성공 사례 공유
   - 사용자 후기 수집

3. **파트너십**:
   - 한의과대학 협력
   - EMR 업체 제휴
   - 의료 기기 업체 제휴

### 성장 로드맵

**Year 1**:
- ✅ MVP 출시
- 🎯 베타 사용자 50명 확보
- 📈 피드백 수집 및 개선

**Year 2**:
- 📱 모바일 앱 출시
- 🌐 유료 서비스 시작
- 💼 첫 100명 유료 고객 확보

**Year 3**:
- 🏥 EMR 시스템 통합
- 🌏 해외 시장 진출 (일본, 중국)
- 💰 매출 10억원 달성

---

## 기술 부채 및 알려진 이슈

### 현재 기술 부채

1. **테스트 부재**:
   - Unit 테스트 없음
   - E2E 테스트 없음
   - **우선순위**: 높음

2. **에러 처리 개선 필요**:
   - 일부 에러 메시지 불명확
   - Sentry 등 에러 트래킹 미도입
   - **우선순위**: 중간

3. **코드 중복**:
   - API 호출 로직 일부 중복
   - 리팩토링 필요
   - **우선순위**: 낮음

4. **타입 안전성**:
   - 일부 `any` 타입 사용
   - 타입 정의 보완 필요
   - **우선순위**: 중간

### 알려진 이슈

1. **Safari 호환성**:
   - MediaRecorder API 일부 제한
   - 대체 방법 필요

2. **대용량 파일 처리**:
   - 100MB 이상 파일은 느림
   - 최적화 필요

3. **오프라인 지원 부재**:
   - 네트워크 필수
   - PWA 전환 고려

---

## 참고 자료

### 공식 문서
- [Gemini API](https://ai.google.dev/docs)
- [Google Drive API](https://developers.google.com/drive/api/guides/about-sdk)
- [Google Calendar API](https://developers.google.com/calendar/api/guides/overview)
- [React 문서](https://react.dev/)
- [TypeScript 문서](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### 내부 문서
- [CLAUDE.md](./CLAUDE.md) - AI 어시스턴트 가이드
- [AUTHENTICATION.md](./docs/AUTHENTICATION.md) - 인증 시스템 설명
- [README.md](./README.md) - 프로젝트 소개

### 유용한 링크
- [GitHub Repository](https://github.com/choi0ne/a)
- [AI Studio App](https://ai.studio/apps/drive/1YMOIS9MAZN3IbP3YgnoKOhLZBrKdiG2h)
- [Google Cloud Console](https://console.cloud.google.com)
- [Netlify Dashboard](https://app.netlify.com)

---

## 연락처 및 지원

### 개발팀
- **Repository**: https://github.com/choi0ne/a
- **Issues**: https://github.com/choi0ne/a/issues

### 기술 지원
- **이메일**: [지원 이메일 추가 필요]
- **Discord**: [커뮤니티 링크 추가 필요]

---

## 변경 이력

### v1.0 (2025-12-09)
- ✅ 초기 프로젝트 문서 작성
- ✅ 모든 브랜치 통합 완료
- ✅ 인증 시스템 안정화
- ✅ UI 개선 (버튼 레이아웃)
- ✅ 문서화 완료

---

## 라이선스

**Private Repository** - 상업적 사용 제한

---

**문서 최종 업데이트**: 2025-12-09
**작성자**: AI Assistant (Claude)
**버전**: 1.0

이 문서는 지속적으로 업데이트됩니다.

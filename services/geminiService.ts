
/**
 * Gemini AI Service
 *
 * This service handles all AI operations (transcription, chart generation, analysis).
 *
 * AUTHENTICATION:
 * - Uses simple Gemini API key (NOT Google OAuth)
 * - API key stored in localStorage as 'geminiApiKey'
 * - No user login required - just an API key
 *
 * NOTE: This is completely separate from Google Drive/Calendar OAuth authentication
 */

import { GoogleGenAI } from '@google/genai';
import { splitAudioBlob } from '../utils/audioUtils.ts';

// Helper function to convert a Blob to a Base64 string
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) {
                const base64data = (reader.result as string).split(',')[1];
                resolve(base64data);
            } else {
                reject(new Error("Blob 읽기 실패"));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
    });
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const PRIMARY_MODEL = 'gemini-2.5-pro';
const FALLBACK_MODEL = 'gemini-2.5-flash';
const MAX_RETRIES = 2; // Try original + 1 retry
const RETRY_DELAY_MS = 1500;

async function callGeminiWithRetry(
    geminiApiKey: string | undefined, 
    request: any, 
    errorContext: string,
    model = PRIMARY_MODEL
): Promise<string> {
    if (!geminiApiKey) {
        throw new Error('Gemini API 키가 없습니다.');
    }

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    let lastError: Error | null = null;

    // --- Primary Model Attempt with Retries ---
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const finalRequest = { model, ...request };
            const response = await ai.models.generateContent(finalRequest);
            return response.text?.trim() ?? '';
        } catch (e) {
            lastError = e as Error;
            console.error(`Gemini API call for '${errorContext}' attempt ${attempt} with model ${model} failed:`, e);

            if (attempt === MAX_RETRIES) {
                break; 
            }
            await sleep(RETRY_DELAY_MS * attempt);
        }
    }

    // --- Fallback Logic ---
    let isInternalError = false;
    const originalErrorMessage = lastError ? lastError.message : '';
    try {
        const errorJson = JSON.parse(originalErrorMessage);
        if (errorJson?.error?.status === 'INTERNAL' || errorJson?.error?.code === 500) {
            isInternalError = true;
        }
    } catch (e) { /* ignore parse error */ }
    
    if (isInternalError && model === PRIMARY_MODEL) {
        console.warn(`Primary model '${PRIMARY_MODEL}' failed with internal error. Attempting fallback with '${FALLBACK_MODEL}'.`);
        try {
            const fallbackRequest = { model: FALLBACK_MODEL, ...request };
            const response = await ai.models.generateContent(fallbackRequest);
            return response.text?.trim() ?? '';
        } catch (fallbackError) {
            console.error(`Fallback attempt with '${FALLBACK_MODEL}' also failed.`, fallbackError);
        }
    }

    // --- Final Error Handling ---
    if (lastError) {
        let errorMessage = originalErrorMessage;
        try {
            const errorJson = JSON.parse(errorMessage);
            errorMessage = errorJson?.error?.message || errorMessage;
        } catch (parseError) { /* Not JSON */ }

        if (isInternalError) {
            throw new Error('AI 서버에 문제가 지속되고 있습니다. 잠시 후 다시 시도해주세요.');
        }
        throw new Error(`${errorContext} 중 오류 발생: ${errorMessage}`);
    }
    
    throw new Error(`${errorContext}에 최종적으로 실패했습니다.`);
}


// This function will handle a single audio blob (either a chunk or a small file)
async function transcribeSingleAudioBlob(
    geminiApiKey: string,
    audioBlob: Blob,
    isChunk: boolean
): Promise<string> {
    const audioBase64 = await blobToBase64(audioBlob);

    const audioPart = {
        inlineData: {
            mimeType: audioBlob.type,
            data: audioBase64,
        },
    };

    const textPart = {
        text: '다음 한국어 오디오를 텍스트로 정확하게 전사(transcribe)해 주세요. 다른 설명 없이 대화 내용만 텍스트로 변환하면 됩니다.',
    };
    
    const request = {
        contents: { parts: [audioPart, textPart] },
    };
    
    const errorContext = isChunk ? 'Gemini 음성인식 (분할)' : 'Gemini 음성인식';
    return callGeminiWithRetry(geminiApiKey, request, errorContext);
}

export async function transcribeWithGemini(
    geminiApiKey: string,
    audioBlob: Blob
): Promise<string> {
    if (audioBlob.size === 0) {
        return '';
    }

    const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
    const CHUNK_SIZE_BYTES = 5 * 1024 * 1024;

    if (audioBlob.size > MAX_FILE_SIZE_BYTES) {
        console.log(`오디오 파일 크기(${(audioBlob.size / 1024 / 1024).toFixed(2)}MB)가 ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB를 초과하여 자동 분할 처리를 시작합니다.`);
        try {
            const audioChunks = await splitAudioBlob(audioBlob, CHUNK_SIZE_BYTES);
            console.log(`${audioChunks.length}개의 파일로 분할되었습니다. 병렬로 전사를 시작합니다.`);
            
            const transcriptionPromises = audioChunks.map((chunk, index) => {
                console.log(`분할 파일 ${index + 1}/${audioChunks.length} 전사 중...`);
                return transcribeSingleAudioBlob(geminiApiKey, chunk, true);
            });
            
            const transcriptions = await Promise.all(transcriptionPromises);
            console.log('모든 분할 파일의 전사가 완료되었습니다. 결과를 병합합니다.');
            
            return transcriptions.join(' ').trim();
        } catch (error) {
            console.error("대용량 오디오 파일 처리 중 오류 발생:", error);
            throw new Error(`대용량 오디오 파일 처리 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        }
    } else {
        // For files smaller than 20MB, use the existing method.
        return transcribeSingleAudioBlob(geminiApiKey, audioBlob, false);
    }
}


const VERIFICATION_SYSTEM_INSTRUCTION = `당신은 대한민국 한의원에서 사용하는 의료 기록 전문 검수 AI입니다. 당신의 임무는 제공된 진료 대화 전사문을 검토하고, 다음과 같은 규칙에 따라 수정하는 것입니다.

[수정 규칙]
1.  명백한 오탈자 및 문법 오류를 교정합니다.
2.  의학 용어 및 한의학 용어(예: 경혈명, 약재명, 병증명 등)가 잘못 사용되었거나 오기된 경우, 문맥에 가장 적합하고 정확한 용어로 수정합니다.
3.  대화의 원래 의미나 내용을 절대 변경하거나 추가하지 마십시오. 오직 교정 작업만 수행합니다.
4.  수정이 완료된 최종 전사문 텍스트'만'을 응답으로 출력해야 합니다. 어떠한 설명이나 인사말도 포함하지 마십시오.
`;

const getVerificationPrompt = (transcript: string): string => `
아래의 진료 대화 전사문을 검토하고 수정 규칙에 따라 교정해주세요.

[전사문 원본]
---
${transcript}
---
`;

export async function verifyAndCorrectTranscript(geminiApiKey: string | undefined, transcript: string): Promise<string> {
    if (!transcript.trim()) {
        return transcript;
    }
    
    const request = {
        contents: getVerificationPrompt(transcript),
        config: {
            systemInstruction: VERIFICATION_SYSTEM_INSTRUCTION,
        },
    };

    const result = await callGeminiWithRetry(geminiApiKey, request, 'Gemini 전사 내용 검수');
    return result || transcript; // Fallback to original if result is empty
}


const SYSTEM_INSTRUCTION = `당신은 한의원 진료를 돕는 AI 어시스턴트입니다. 당신의 임무는 제공된 진료 기록(대화 전사문, 추가 메모 등)을 바탕으로 구조화된 SOAP 차트를 작성하는 것입니다.

──────────────────────────────
📋 작동 목표
──────────────────────
1️⃣  제공된 진료 기록을 한의과 SOAP 형식에 맞춰 정리합니다.
2️⃣  기록에 있는 내용만 사용해야 하며, 절대 내용을 지어내거나 추론하지 않습니다.
3️⃣  숫자, 경혈명, 용량, 횟수 등은 원문 그대로 유지합니다.
4️⃣  기록에서 특정 정보를 찾을 수 없는 경우, 해당 항목은 "미확인"으로 표시합니다.
5️⃣  차트 마지막에는 주치의가 검토하기 쉽도록 요약과 확인사항 체크리스트를 추가합니다. 체크리스트 3개 항목에 대해서는 대화 내용을 근거로 간결하게 답변해야 합니다. 만약 특정 항목(예: 주호소)이 '미확인'이라 답변 근거가 없다면, 해당 체크리스트 답변도 '미확인'으로 통일하여 기재합니다.
6️⃣  어떠한 인사말이나 서론 없이 바로 SOAP 차트 본문으로 시작합니다.

──────────────────
📋 출력 형식 규칙
──────────────────
- 제공된 SOAP 출력 형식을 엄격하게 준수합니다.
- 깔끔하고 간결한 언어를 사용합니다.
- 실수 가능성이 있는 중요한 수치는 굵은 글씨로 강조합니다(예: **5분**, **3장**).
- 환자명은 대화에서 유추하여 기입하고, 유추가 불가능하면 "미확인"으로 표시합니다.
`;

const formatKST = (d: Date) =>
  new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).format(d);


const getUserPrompt = (transcript: string, additionalNotes: string, consultationDate: Date): string => {
    let contentSection = '';
    let mainInstruction = '아래의 출력 형식과 제공된 내용을 바탕으로 SOAP 차트를 작성해 주세요.';

    if (transcript.trim() && additionalNotes.trim()) {
        mainInstruction = '아래의 출력 형식과, [진료 대화 내용] 및 [추가 메모]를 모두 종합하여 SOAP 차트를 작성해 주세요.';
    }

    if (transcript.trim()) {
        contentSection += `
---

[진료 대화 내용]
${transcript}
`;
    }

    if (additionalNotes.trim()) {
        contentSection += `
---

[추가 메모]
${additionalNotes}
`;
    }

    return `
${mainInstruction}

[출력 형식]
✅ 환자명:
✅ 진료일시: ${formatKST(consultationDate)}

S (주관적)
- 주호소:
- 현병력:
- 악화·완화 요인:
- 관련 증상:
- 기타:

O (객관적)
- 시진:
- 촉진/압통:
- ROM/기능검사:
- 특수검사:
- 활력징후:
- 기타:

A (평가)
- 진단명:
- 의증:

P (계획)
- 시술:
- 치료 빈도/기간:
- 한약:
- 예후:
- 주의사항/금기:
- 생활지도/재활:
- 추적계획:

✅ 청구 태그:

✅ 요약
- 진료내용을 50자 내외 요약

✅확인사항 (체크리스트)
1. 주소증에 대해서 정확하게 진찰했는가?
2. 예후 및 주의사항이 누락되지 않았는가?
3. 치료계획이 환자에게 충분히 설명되었는가?
${contentSection}
`;
};


export async function generateSoapChart(geminiApiKey: string | undefined, transcript: string, additionalNotes: string, consultationDate: Date): Promise<string> {
    const request = {
        contents: getUserPrompt(transcript, additionalNotes, consultationDate),
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
        },
    };
    return callGeminiWithRetry(geminiApiKey, request, 'Gemini SOAP 차트 생성');
}


const ANALYSIS_SYSTEM_INSTRUCTION = `
당신은 SOAP 차트 분석 전문가 AI입니다. 당신의 임무는 제공된 SOAP 차트를 비판적으로 검토하고, 임상적 의사결정을 개선하기 위한 구체적이고 실행 가능한 피드백을 제공하는 것입니다.

[지시사항]
1.  서론이나 인사말 없이 즉시 분석을 시작하십시오.
2.  출력은 반드시 일반 텍스트(plain text) 형식이어야 합니다. 마크다운을 사용하지 마십시오.
3.  아래의 지정된 구조에 따라 분석 결과를 명확하게 정리하십시오.

──────────────────
📋 분석 보고서 형식
──────────────────

[차트 작성의 문제점]
- (여기에 차트 형식, 내용의 일관성, 구조적 오류 등 작성상의 문제점을 구체적으로 지적합니다.)
- (예: 주관적 정보(S)와 객관적 정보(O)가 혼재되어 있음.)

[필수 확인 및 질문 사항]
- (환자의 상태를 더 명확히 파악하기 위해 진료 중에 물어봤어야 할 핵심 질문들을 나열합니다.)
- (예: 통증의 양상(쑤시는지, 저리는지 등)에 대한 구체적인 질문이 누락됨.)

[진단 평가 및 제언]
- (제시된 진단(A)의 타당성을 평가하고, 근거가 부족하다면 지적합니다.)
- (고려해야 할 다른 감별 진단이나 가능한 병리 해석을 구체적인 이유와 함께 제시합니다.)

[치료 계획 검토]
- (제시된 치료 계획(P)이 진단(A)과 일관되는지, 환자의 상태에 적합한지 검토합니다.)
- (더 효과적이거나 안전한 대안 치료법, 또는 추가할 수 있는 치료법을 제안합니다.)

[핵심 요약]
1. (가장 시급하게 개선해야 할 사항이나 가장 중요한 분석 포인트를 요약합니다.)
2. (두 번째 핵심 요약 사항을 기술합니다.)
3. (세 번째 핵심 요약 사항을 기술합니다.)
`;

const getAnalysisPrompt = (chartContent: string): string => `
아래 SOAP 차트 내용을 검토하고, '대화형 진료 파트너 AI'의 관점에서 심층 분석 및 전문적인 제언을 제공해주세요.

[검토할 SOAP 차트]
${chartContent}
`;


export async function analyzeSoapChart(geminiApiKey: string | undefined, chartContent: string): Promise<string> {
    const request = {
        contents: getAnalysisPrompt(chartContent),
        config: {
            systemInstruction: ANALYSIS_SYSTEM_INSTRUCTION,
        },
    };
    return callGeminiWithRetry(geminiApiKey, request, 'Gemini 심층분석');
}
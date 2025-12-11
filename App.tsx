import React, { useState, useRef, useCallback, useEffect } from 'react';
import { transcribeWithGemini, generateSoapChart, analyzeSoapChart, verifyAndCorrectTranscript } from './services/geminiService.ts';
import { getOauthToken, generateFilename, saveToGoogleDrive, openDrivePicker, downloadDriveFile } from './services/googleDriveService.ts';
import { convertAudioToWav } from './utils/audioUtils.ts';
import { Settings } from './types';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import { SettingsModal } from './components/SettingsModal';
import { AnalysisModal } from './components/AnalysisModal';
import { GoogleCalendarModal } from './components/GoogleCalendarModal';
import {
  MicrophoneIcon,
  StopIcon,
  CopyIcon,
  SaveIcon,
  Spinner,
  SettingsIcon,
  GeminiIcon,
  DjdLogoIcon,
  OpenAIIcon,
  EditIcon,
  CheckIcon,
  AttachmentIcon,
  GoogleIcon,
  LogoutIcon,
  GoogleCalendarIcon,
  GoogleKeepIcon,
  GoogleSheetsIcon,
  ClaudeIcon,
  NotebookLMIcon,
  SpeechifyIcon,
  GoogleDriveIcon
} from './components/icons.tsx';

const App: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [transcript, setTranscript] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [soapChart, setSoapChart] = useState('');
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEditingAnalysis, setIsEditingAnalysis] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  // API Keys
  // NOTE: geminiApiKey is for AI services (transcription, chart generation)
  // googleClientId and googleDeveloperKey are for OAuth and Google Workspace APIs (Drive, Calendar, Picker)
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('geminiApiKey') || import.meta.env.VITE_GEMINI_API_KEY || '');
  const [googleClientId, setGoogleClientId] = useState(() => localStorage.getItem('googleClientId') || import.meta.env.VITE_GOOGLE_CLIENT_ID || '');
  const [googleDeveloperKey, setGoogleDeveloperKey] = useState(() => localStorage.getItem('googleDeveloperKey') || import.meta.env.VITE_GOOGLE_DEVELOPER_KEY || '');

  // Google Authentication (using custom hook)
  const { isSignedIn, signIn: handleSignIn, signOut: handleSignOut, error: googleAuthError } = useGoogleAuth(googleClientId, googleDeveloperKey);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<Date | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Show settings if no Gemini API key
  useEffect(() => {
    if (!geminiApiKey) {
      setIsSettingsOpen(true);
    }
  }, [geminiApiKey]);

  // Display Google Auth errors
  useEffect(() => {
    if (googleAuthError) {
      setError(googleAuthError);
    }
  }, [googleAuthError]);

  const handleGenerateChart = useCallback(async (
    transcriptText: string,
    notes: string,
    startTime: Date
  ) => {
    if (!geminiApiKey) {
      setError('Gemini API 키가 설정되지 않았습니다.');
      setIsSettingsOpen(true);
      return;
    }

    setIsGenerating(true);
    setStatusMessage('SOAP 차트 생성 중...');
    setError(null);
    setSoapChart('');
    setIsEditing(false);

    try {
      const generatedChart = await generateSoapChart(geminiApiKey, transcriptText, notes, startTime);
      setSoapChart(generatedChart);
      if (generatedChart) { // 차트가 생성되면 바로 수정 모드로 전환
        setIsEditing(true);
      }
      setStatusMessage('');
      if (isSignedIn) {
        setStatusMessage("Google Drive에 저장 중...");
        await saveToGoogleDrive(generatedChart);
        setStatusMessage("Google Drive에 성공적으로 저장되었습니다.");
        setTimeout(() => setStatusMessage(''), 4000);
      }
    } catch (err) {
      if (err instanceof Error) {
        const lowerCaseMessage = err.message.toLowerCase();
        if (lowerCaseMessage.includes('api key') || lowerCaseMessage.includes('api_key')) {
          setError(
            <>
              SOAP 차트 생성 실패: Gemini API 키가 잘못되었을 수 있습니다. <br />
              설정 메뉴에서 Gemini API 키를 확인해주세요.
            </>
          );
        } else if (lowerCaseMessage.includes('google drive')) {
          setError(`차트 생성은 완료되었으나, Google Drive 저장 실패: ${err.message}`);
        } else if (lowerCaseMessage.includes('로그인') || lowerCaseMessage.includes('토큰')) {
          setError(
            <>
              차트 생성은 완료되었으나, Google 인증 문제로 Drive 저장 실패. <br />
              Google 로그인을 다시 시도해주세요.
            </>
          );
        }
        else {
          setError(
            <>
              SOAP 차트 생성에 실패했습니다. <br />
              AI 모델 서비스에 문제가 있을 수 있습니다. 잠시 후 다시 시도해주세요.
            </>
          );
        }
      } else {
        setError('SOAP 차트 생성 실패: 알 수 없는 오류가 발생했습니다.');
      }
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, [geminiApiKey, isSignedIn]);

  const handleFile = useCallback(async (file: File | null | undefined) => {
    if (!file) {
      return;
    }

    let fileContent = '';

    // Set loading state for the whole process
    setIsGenerating(true);
    setStatusMessage('파일 처리 중...');
    setError(null);
    setTranscript('');
    setAdditionalNotes('');
    setSoapChart('');

    try {
      if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
        if (!geminiApiKey) {
          // Throw an error that will be caught and will open settings
          throw new Error('Gemini API를 사용하려면 Gemini API 키가 필요합니다.');
        }
        setStatusMessage('오디오 형식 변환 중 (WAV)...');
        const convertedBlob = await convertAudioToWav(file);

        setStatusMessage(file.type.startsWith('audio/') ? '오디오 파일 전사 중...' : '비디오 파일의 오디오 전사 중...');
        fileContent = await transcribeWithGemini(geminiApiKey, convertedBlob);
      } else if (file.type.startsWith('text/') || !file.type) { // Allow files with no mime type as text
        setStatusMessage('텍스트 파일 읽는 중...');
        fileContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
          reader.readAsText(file, 'UTF-8');
        });
      } else {
        throw new Error(`지원하지 않는 파일 형식입니다: ${file.type}`);
      }

      if (!fileContent.trim()) {
        throw new Error('파일 내용이 비어있거나 변환에 실패했습니다.');
      }

      setTranscript(fileContent);
      await handleGenerateChart(fileContent, '', new Date());

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      if (errorMessage.includes('Gemini API를 사용하려면')) {
        setIsSettingsOpen(true);
      }

      setError(`파일 처리 실패: ${errorMessage}`);

      setIsGenerating(false);
      setStatusMessage('');
      setTranscript(fileContent); // Show faulty transcript for debugging
    }
  }, [geminiApiKey, handleGenerateChart]);

  const pickerCallback = useCallback(async (data: any) => {
    if (data.action === window.google.picker.Action.PICKED) {
      const fileData = data.docs[0];

      try {
        setStatusMessage('Google Drive 파일 다운로드 중...');
        setIsGenerating(true);
        setError(null);

        const driveFile = await downloadDriveFile(fileData);
        await handleFile(driveFile);

      } catch (err) {
        setError(`Drive 파일 처리 실패: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
        setIsGenerating(false);
        setStatusMessage('');
      }
    }
  }, [handleFile]);

  const handleDrivePicker = useCallback(() => {
    if (!isSignedIn || !getOauthToken() || !window.google?.picker) {
      handleSignIn();
      return;
    }

    try {
      openDrivePicker(googleDeveloperKey, pickerCallback);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google Picker를 열 수 없습니다.');
      // Potentially prompt for sign-in again if the error is auth-related
      if (err instanceof Error && err.message.toLowerCase().includes('로그인')) {
        handleSignIn();
      }
    }
  }, [isSignedIn, googleDeveloperKey, handleSignIn, pickerCallback]);

  const handleToggleRecording = useCallback(async () => {
    if (!geminiApiKey) {
      setError('Gemini API 키가 설정되어야 합니다. 설정 메뉴에서 키를 입력해주세요.');
      setIsSettingsOpen(true);
      return;
    }

    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      setStatusMessage('녹음 중지. 처리 중...');
      setIsGenerating(true);
      setError(null);
    } else {
      // Start recording
      setError(null);
      setSoapChart('');
      setTranscript('');
      setIsEditing(false);
      setIsEditingTranscript(false);
      setStatusMessage('마이크 초기화 중...');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recordingStartTimeRef.current = new Date();
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          let audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const startTime = recordingStartTimeRef.current || new Date();

          // --- Stage 1: Transcription ---
          let transcriptText = '';
          try {
            setStatusMessage('오디오 형식 변환 중 (WAV)...');
            audioBlob = await convertAudioToWav(audioBlob);

            setStatusMessage('오디오 전사 중...');
            transcriptText = await transcribeWithGemini(geminiApiKey, audioBlob);
            setTranscript(transcriptText);
          } catch (err) {
            if (err instanceof Error) {
              const lowerCaseMessage = err.message.toLowerCase();
              if (lowerCaseMessage.includes('api key') || lowerCaseMessage.includes('api_key')) {
                setError(
                  <>
                    음성 전사 실패: API 키가 잘못되었을 수 있습니다. <br />
                    설정 메뉴에서 Gemini API 키를 확인해주세요.
                  </>
                );
              } else {
                setError(`음성 전사 실패: ${err.message}`);
              }
            } else {
              setError('음성 전사 실패: 알 수 없는 오류가 발생했습니다.');
            }
            console.error(err);
            setIsGenerating(false);
            setStatusMessage('');
            stream.getTracks().forEach(track => track.stop());
            return;
          }

          if (transcriptText.trim().length === 0 && additionalNotes.trim().length === 0) {
            setSoapChart('');
            setStatusMessage('음성이 감지되지 않았고 추가 입력도 없습니다.');
            setIsGenerating(false);
            stream.getTracks().forEach(track => track.stop());
            return;
          }

          // --- Stage 1.5: Verification & Correction ---
          let textToProcess = transcriptText;
          if (transcriptText.trim()) {
            try {
              setStatusMessage('전사 내용 검수 및 수정 중...');
              const corrected = await verifyAndCorrectTranscript(geminiApiKey, transcriptText);
              setTranscript(corrected);
              textToProcess = corrected;
            } catch (err) {
              setError(
                <>
                  전사 내용 자동 검수에 실패했습니다. 원본으로 차트 생성을 계속합니다. <br />
                  ({err instanceof Error ? err.message : '알 수 없는 오류'})
                </>
              );
              // textToProcess remains the original transcriptText
            }
          }

          // --- Stage 2: SOAP Chart Generation ---
          setStatusMessage('검수 완료. SOAP 차트 생성 중...');
          await handleGenerateChart(textToProcess, additionalNotes, startTime);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        setStatusMessage('녹음 중... 완료되면 중지 버튼을 클릭하세요.');

      } catch (err) {
        let specificMessage = '알 수 없는 오류가 발생했습니다.';
        if (err instanceof Error) {
          switch (err.name) {
            case 'NotAllowedError':
              specificMessage = '마이크 사용 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.';
              break;
            case 'NotFoundError':
              specificMessage = '사용 가능한 마이크를 찾을 수 없습니다.';
              break;
            case 'SecurityError':
              specificMessage = '마이크 기능은 보안(HTTPS) 연결에서만 사용할 수 있습니다.';
              break;
            case 'NotReadableError':
              specificMessage = '하드웨어 오류로 인해 마이크를 읽을 수 없습니다.';
              break;
            default:
              specificMessage = err.message;
              break;
          }
        }
        const errorMessage = err instanceof Error ? specificMessage : 'An unknown error occurred.';
        setError(`녹음 시작 실패: ${errorMessage}`);
        console.error(err);
        setStatusMessage('녹음을 시작할 수 없습니다. 권한 및 연결을 확인하세요.');
      }
    }
  }, [isRecording, geminiApiKey, additionalNotes, handleGenerateChart]);

  const handleTextGenerationClick = async () => {
    if (!transcript && !additionalNotes) {
      setError('분석할 텍스트가 없습니다. 녹음을 진행하거나 추가 입력을 해주세요.');
      return;
    }

    setIsGenerating(true);
    setStatusMessage('텍스트 내용 검수 및 수정 중...');
    setError(null);
    setSoapChart('');

    let textToProcess = transcript;

    if (transcript.trim()) {
      try {
        const corrected = await verifyAndCorrectTranscript(geminiApiKey, transcript);
        setTranscript(corrected);
        textToProcess = corrected;
      } catch (err) {
        setError(
          <>
            텍스트 내용 자동 검수에 실패했습니다. 현재 내용으로 차트 생성을 계속합니다. <br />
            ({err instanceof Error ? err.message : '알 수 없는 오류'})
          </>
        );
      }
    }

    await handleGenerateChart(textToProcess, additionalNotes, new Date());
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(soapChart)
      .then(() => alert('SOAP 차트가 클립보드에 복사되었습니다!'))
      .catch(() => alert('텍스트 복사에 실패했습니다.'));
  };

  const copyTranscriptToClipboard = () => {
    navigator.clipboard.writeText(transcript)
      .then(() => alert('전사 내용이 클립보드에 복사되었습니다!'))
      .catch(() => alert('전사 내용 복사에 실패했습니다.'));
  };

  const handleAnalysis = async () => {
    if (!soapChart) {
      alert('분석할 SOAP 차트 내용이 없습니다.');
      return;
    }
    setIsAnalysisModalOpen(true);
    setIsAnalyzing(true);
    setAnalysisResult('');
    setIsEditingAnalysis(false);
    setError(null);
    try {
      const result = await analyzeSoapChart(geminiApiKey, soapChart);
      setAnalysisResult(result);
    } catch (err) {
      if (err instanceof Error) {
        setAnalysisResult(`심층분석 실패: ${err.message}`);
      } else {
        setAnalysisResult('심층분석 실패: 알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveAsTextFile = () => {
    const filename = generateFilename('SOAP차트', 'txt', soapChart);
    const blob = new Blob([soapChart], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async () => {
    if (!soapChart) {
      alert("저장할 SOAP 차트 내용이 없습니다.");
      return;
    }

    // 1. Save locally
    saveAsTextFile();

    // 2. Save to Google Drive
    if (isSignedIn) {
      const tempStatus = statusMessage;
      setStatusMessage("Google Drive에 저장 중...");
      try {
        await saveToGoogleDrive(soapChart);
        setStatusMessage("Google Drive에 성공적으로 저장되었습니다.");
        setTimeout(() => setStatusMessage(tempStatus || ''), 4000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Google Drive 저장 실패");
        setStatusMessage(tempStatus);
      }
    } else {
      setError(
        <>
          로컬에 저장되었습니다. <br />
          Google Drive에도 저장하려면 <button onClick={handleSignIn} className="underline text-brand-accent hover:text-yellow-400 transition-colors">로그인</button>해주세요.
        </>
      );
      setTimeout(() => setError(null), 7000);
    }
  };

  const saveTranscriptAsTextFile = () => {
    const filename = generateFilename('전사내용', 'txt', soapChart);
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyAnalysisToClipboard = () => {
    navigator.clipboard.writeText(analysisResult)
      .then(() => alert('분석 내용이 클립보드에 복사되었습니다!'))
      .catch(() => alert('분석 내용 복사에 실패했습니다.'));
  };

  const saveAnalysisAsTextFile = () => {
    const filename = generateFilename('심층분석', 'txt', soapChart);
    const blob = new Blob([analysisResult], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSoapChart = (chartText: string) => {
    // Add line breaks for display
    const formattedText = chartText.replace(/\n/g, '<br />');
    // Apply bold styling
    const htmlText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-accent">$1</strong>');
    return <div dangerouslySetInnerHTML={{ __html: htmlText }} />;
  };

  const handleSaveSettings = (settings: Settings) => {
    localStorage.setItem('geminiApiKey', settings.geminiKey);
    setGeminiApiKey(settings.geminiKey);
    localStorage.setItem('googleClientId', settings.googleClientId);
    setGoogleClientId(settings.googleClientId);
    localStorage.setItem('googleDeveloperKey', settings.googleDeveloperKey);
    setGoogleDeveloperKey(settings.googleDeveloperKey);
    setIsSettingsOpen(false);
    alert('설정이 저장되었습니다. 페이지를 새로고침하여 적용해주세요.');
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center p-4 sm:p-6 lg:p-8 relative">
      <header className="w-full max-w-7xl flex justify-between items-start mb-6">
        {/* Left Sidebar Buttons */}
        <div className="flex-1">
          <nav className="flex flex-row flex-wrap gap-2 md:flex-col md:space-y-2 md:gap-0">
            <button onClick={() => setIsCalendarModalOpen(true)} className="bg-gray-900 text-gray-300 hover:bg-gray-700 hover:text-white w-40 text-left px-3 py-1 rounded-md transition-colors text-xs font-medium flex items-center justify-start gap-x-2" title="Google Calendar">
              <GoogleCalendarIcon className="w-4 h-4" />
              <span>Google Calendar</span>
            </button>
            <a href="https://keep.google.com/u/0/#home" target="_blank" rel="noopener noreferrer" className="bg-gray-900 text-gray-300 hover:bg-gray-700 hover:text-white w-40 text-left px-3 py-1 rounded-md transition-colors text-xs font-medium flex items-center justify-start gap-x-2" title="Google Keep">
              <GoogleKeepIcon className="w-4 h-4" />
              <span>Google Keep</span>
            </a>
            <a href="https://docs.google.com/spreadsheets/u/0/" target="_blank" rel="noopener noreferrer" className="bg-gray-900 text-gray-300 hover:bg-gray-700 hover:text-white w-40 text-left px-3 py-1 rounded-md transition-colors text-xs font-medium flex items-center justify-start gap-x-2" title="Google Sheets">
              <GoogleSheetsIcon className="w-4 h-4" />
              <span>Google Sheets</span>
            </a>
            <a href="https://drive.google.com/drive/folders/1XGJmZp53bm_o-zaDgEzMv36FIxEL2e1F" target="_blank" rel="noopener noreferrer" className="bg-gray-900 text-gray-300 hover:bg-gray-700 hover:text-white w-40 text-left px-3 py-1 rounded-md transition-colors text-xs font-medium flex items-center justify-start gap-x-2" title="Google Drive">
              <GoogleDriveIcon className="w-4 h-4" />
              <span>Google Drive</span>
            </a>
            <div className="flex flex-row gap-2 w-40">
              <a href="https://re-visit.kr/dongjedang/hospital/reception/list" target="_blank" rel="noopener noreferrer" className="bg-gray-900 text-gray-300 hover:bg-gray-700 hover:text-white flex-1 text-center px-2 py-1 rounded-md transition-colors text-xs font-medium" title="Re-visit">
                Re-visit
              </a>
              <a href="https://reservation.docfriends.com/?stateTypes=&reservationDate=dateTime&gte=2025-12-03&lte=2025-12-09&platformTypes=&productUuids=&bookingName=bookerName&bookingNameText=&reservationUuid=" target="_blank" rel="noopener noreferrer" className="bg-gray-900 text-gray-300 hover:bg-gray-700 hover:text-white flex-1 text-center px-2 py-1 rounded-md transition-colors text-xs font-medium" title="DocTalk">
                DocTalk
              </a>
            </div>
            <a href="https://aha-emr-assistant-394050950645.us-west1.run.app/" target="_blank" rel="noopener noreferrer" className="bg-gray-900 text-gray-300 hover:bg-gray-700 hover:text-white w-40 text-right px-3 py-1 rounded-md transition-colors text-xs font-medium" title="AHA">
              AHA
            </a>
            <a href="https://djd-diagnosisv2.netlify.app/" target="_blank" rel="noopener noreferrer" className="bg-gray-900 text-gray-300 hover:bg-gray-700 hover:text-white w-40 text-right px-3 py-1 rounded-md transition-colors text-xs font-medium" title="DJD">
              DJD
            </a>
          </nav>
        </div>

        {/* Center Title */}
        <div className="flex-1 text-center pt-2 md:pt-8 px-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center justify-center gap-x-3 sm:gap-x-4">
            <DjdLogoIcon className="h-8 sm:h-9 md:h-10 w-auto flex-shrink-0" />
            <span>ChartHelper</span>
          </h1>
        </div>

        {/* Right Sidebar Links */}
        <div className="flex-1 flex justify-end">
          <nav className="flex flex-row flex-wrap justify-end gap-2 md:flex-col md:space-y-2 md:gap-0">
            <a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer" className="bg-gray-900 text-gray-300 hover:bg-gray-700 hover:text-white w-40 px-3 py-1 rounded-md transition-colors text-xs font-medium flex items-center justify-end gap-x-2" title="Google Gemini">
              <GeminiIcon className="w-4 h-4" />
              <span>Google Gemini</span>
            </a>
            <a href="https://chat.openai.com/" target="_blank" rel="noopener noreferrer" className="bg-gray-900 text-gray-300 hover:bg-gray-700 hover:text-white w-40 px-3 py-1 rounded-md transition-colors text-xs font-medium flex items-center justify-end gap-x-2" title="ChatGPT">
              <OpenAIIcon className="w-4 h-4" />
              <span>ChatGPT</span>
            </a>
            <a href="https://claude.ai/" target="_blank" rel="noopener noreferrer" className="bg-gray-900 text-gray-300 hover:bg-gray-700 hover:text-white w-40 px-3 py-1 rounded-md transition-colors text-xs font-medium flex items-center justify-end gap-x-2" title="Claude">
              <ClaudeIcon className="w-4 h-4" />
              <span>Claude</span>
            </a>
            <a href="https://notebooklm.google.com/" target="_blank" rel="noopener noreferrer" className="bg-gray-900 text-gray-300 hover:bg-gray-700 hover:text-white w-40 px-3 py-1 rounded-md transition-colors text-xs font-medium flex items-center justify-end gap-x-2" title="NotebookLM">
              <NotebookLMIcon className="w-4 h-4" />
              <span>NotebookLM</span>
            </a>
            <a href="https://app.speechify.com/" target="_blank" rel="noopener noreferrer" className="bg-gray-900 text-gray-300 hover:bg-gray-700 hover:text-white w-40 px-3 py-1 rounded-md transition-colors text-xs font-medium flex items-center justify-end gap-x-2" title="Speechify">
              <SpeechifyIcon className="w-4 h-4" />
              <span>Speechify</span>
            </a>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="bg-gray-900 text-gray-300 hover:bg-gray-700 hover:text-white w-40 px-3 py-1 rounded-md transition-colors text-xs font-medium flex items-center justify-end gap-x-2"
              aria-label="설정"
              title="설정"
            >
              <SettingsIcon className="w-4 h-4" />
              <span>설정</span>
            </button>
            {googleClientId && (
              <>
                {isSignedIn ? (
                  <button onClick={handleSignOut} className="bg-gray-900 text-gray-300 hover:bg-gray-700 hover:text-white w-40 px-3 py-1 rounded-md transition-colors text-xs font-medium flex items-center justify-end gap-x-2" title="Google Logout">
                    <LogoutIcon className="w-4 h-4" />
                    <span>Google Logout</span>
                  </button>
                ) : (
                  <button onClick={handleSignIn} className="bg-gray-900 text-gray-300 hover:bg-gray-700 hover:text-white w-40 px-3 py-1 rounded-md transition-colors text-xs font-medium flex items-center justify-end gap-x-2" title="Google Login">
                    <GoogleIcon className="w-4 h-4" />
                    <span>Google Login</span>
                  </button>
                )}
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="w-full max-w-7xl flex-grow flex flex-col items-center">
        <div className="mb-6 flex flex-col items-center">
          <div className="flex items-center gap-x-4">
            <button
              onClick={handleToggleRecording}
              disabled={isGenerating}
              className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out shadow-lg
                ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-primary hover:bg-brand-secondary'}
                ${isGenerating ? 'bg-gray-500 cursor-not-allowed' : ''}
              `}
              aria-label={isRecording ? '녹음 중지' : '녹음 시작'}
            >
              {isGenerating && !isRecording ? <Spinner className="w-6 h-6 text-white" /> : (
                isRecording ? <StopIcon className="w-6 h-6 text-white" /> : <MicrophoneIcon className="w-6 h-6 text-white" />
              )}
            </button>
            <button
              onClick={handleTextGenerationClick}
              disabled={isGenerating || isRecording || (!transcript && !additionalNotes)}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ease-in-out shadow-lg bg-brand-secondary hover:bg-brand-primary disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-500"
              aria-label="텍스트로 차트 생성"
              title="텍스트로 차트 생성"
            >
              {isGenerating && !isRecording ? <Spinner className="w-6 h-6 text-white" /> : <EditIcon className="w-6 h-6 text-white" />}
            </button>
          </div>
          <p className="mt-4 text-gray-300 text-center h-5">{statusMessage || '진료 녹음을 시작하거나 텍스트를 입력하세요.'}</p>
          {error && <p className="mt-2 text-red-400 text-center">{error}</p>}
        </div>

        <div className="w-full flex-grow flex flex-col lg:flex-row gap-6">
          <div className={`w-full lg:w-1/2 flex flex-col gap-6 ${isEditing ? 'hidden' : 'flex'}`}>
            {/* Transcription Panel */}
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col flex-1">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">전사 내용</h2>
                {transcript && !isGenerating && (
                  <div className="flex items-center space-x-2">
                    <button onClick={() => setIsEditingTranscript(!isEditingTranscript)} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" aria-label={isEditingTranscript ? '수정 완료' : '수정'}>
                      {isEditingTranscript ? <CheckIcon className="w-5 h-5" /> : <EditIcon className="w-5 h-5" />}
                    </button>
                    <button onClick={copyTranscriptToClipboard} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" aria-label="클립보드에 복사">
                      <CopyIcon className="w-5 h-5" />
                    </button>
                    <button onClick={saveTranscriptAsTextFile} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" aria-label="텍스트 파일로 저장">
                      <SaveIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-grow bg-gray-900 rounded-md p-4 overflow-y-auto text-gray-300">
                {isEditingTranscript ? (
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    className="w-full h-full bg-transparent text-gray-300 resize-none focus:outline-none"
                    spellCheck="false"
                  />
                ) : transcript ? (
                  <div className="whitespace-pre-wrap">{transcript}</div>
                ) : (
                  <span className="text-gray-500">
                    {isRecording ? '녹음 중... 완료 후 여기에 대화 내용이 표시됩니다.' : '녹음이 시작되면 여기에 대화 내용이 표시됩니다.'}
                  </span>
                )}
              </div>
            </div>

            {/* Additional Notes Panel */}
            <div
              className={`bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col flex-1 relative transition-all duration-300 ${isDraggingOver ? 'border-2 border-dashed border-brand-primary ring-4 ring-brand-primary/20' : 'border-2 border-transparent'}`}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
              onDragEnter={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
              onDragLeave={() => { setIsDraggingOver(false); }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">음성/텍스트 입력</h2>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleDrivePicker}
                    className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Google Drive에서 가져오기"
                    title={!isSignedIn ? "Google 로그인이 필요합니다" : "Google Drive에서 파일 가져오기"}
                    disabled={!isSignedIn || isRecording || isGenerating}
                  >
                    <GoogleDriveIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleAttachClick}
                    className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="파일 첨부"
                    title="오디오/텍스트 파일 첨부"
                    disabled={isRecording || isGenerating}
                  >
                    <AttachmentIcon className="w-5 h-5" />
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".txt,text/plain,audio/*,video/*"
                  className="hidden"
                />
              </div>
              <div className="flex-grow bg-gray-900 rounded-md p-4 relative">
                {isDraggingOver && (
                  <div className="absolute inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center rounded-md pointer-events-none z-10">
                    <p className="text-lg font-semibold text-brand-primary">여기에 텍스트, 오디오, 비디오 파일을 드롭하세요</p>
                  </div>
                )}
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="w-full h-full bg-transparent text-gray-300 resize-none focus:outline-none placeholder-gray-500"
                  placeholder="여기에 텍스트, 오디오, 또는 비디오 파일을 드래그 앤 드롭하여 차트를 바로 생성하세요."
                  spellCheck="false"
                  disabled={isRecording || isGenerating}
                />
              </div>
            </div>
          </div>

          {/* SOAP Chart Panel */}
          <div className={`bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col ${isEditing ? 'w-full' : 'w-full lg:w-1/2'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">SOAP 차트</h2>
              {soapChart && !isGenerating && (
                <div className="flex items-center space-x-2">
                  <button onClick={handleAnalysis} className="p-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-x-2" aria-label="심층분석">
                    <GeminiIcon className="w-5 h-5" />
                    <span>심층분석</span>
                  </button>
                  <button onClick={() => setIsEditing(!isEditing)} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" aria-label={isEditing ? '수정 완료' : '수정'}>
                    {isEditing ? <CheckIcon className="w-5 h-5" /> : <EditIcon className="w-5 h-5" />}
                  </button>
                  <button onClick={copyToClipboard} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" aria-label="클립보드에 복사">
                    <CopyIcon className="w-5 h-5" />
                  </button>
                  <button onClick={handleSave} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" aria-label="저장" title="로컬 및 Google Drive에 저장">
                    <SaveIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex-grow bg-gray-900 rounded-md p-4 overflow-y-auto text-gray-300">
              {isEditing ? (
                <textarea
                  value={soapChart}
                  onChange={(e) => setSoapChart(e.target.value)}
                  className="w-full h-full bg-transparent text-gray-300 resize-none focus:outline-none"
                  spellCheck="false"
                />
              ) : soapChart ? (
                renderSoapChart(soapChart)
              ) : (
                <span className="text-gray-500">
                  {isGenerating ? 'SOAP 차트 생성 중...' : '녹음이 완료되거나 텍스트 입력 후 차트가 생성됩니다.'}
                </span>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-7xl mt-8 text-center text-xs text-gray-500">
        <p>© 2025 DJD Quality-improvement in Clinical Practice. All rights reserved.</p>
        <p className="mt-1">본 서비스는 진료개선화 도구이며, 임상 의사결정을 대체할 수 없습니다.</p>
      </footer>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        onSave={handleSaveSettings}
        currentSettings={{
          geminiKey: geminiApiKey,
          googleClientId: googleClientId,
          googleDeveloperKey: googleDeveloperKey
        }}
      />
      <AnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        result={analysisResult}
        isLoading={isAnalyzing}
        isEditing={isEditingAnalysis}
        onToggleEdit={() => setIsEditingAnalysis(!isEditingAnalysis)}
        onContentChange={setAnalysisResult}
        onCopy={copyAnalysisToClipboard}
        onSave={saveAnalysisAsTextFile}
      />
      <GoogleCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        isSignedIn={isSignedIn}
      />
    </div>
  );
};

export default App;
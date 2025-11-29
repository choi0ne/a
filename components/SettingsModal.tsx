import React, { useState, useEffect } from 'react';
import { Settings } from '../types';
import { SettingsIcon, CloseIcon, GeminiIcon, GoogleIcon } from './icons';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: Settings) => void;
    currentSettings: Settings;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    onSave,
    currentSettings
}) => {
    const [geminiKey, setGeminiKey] = useState(currentSettings.geminiKey);
    const [googleClientId, setGoogleClientId] = useState(currentSettings.googleClientId);
    const [googleApiKey, setGoogleApiKey] = useState(currentSettings.googleApiKey);

    useEffect(() => {
        setGeminiKey(currentSettings.geminiKey);
        setGoogleClientId(currentSettings.googleClientId);
        setGoogleApiKey(currentSettings.googleApiKey);
    }, [currentSettings, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave({ geminiKey, googleClientId, googleApiKey });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-2xl p-6 sm:p-8 w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <SettingsIcon className="w-6 h-6 mr-3" />
                        설정
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Gemini API */}
                    <div>
                        <h3 className="text-lg font-semibold text-brand-primary mb-3 flex items-center">
                            <GeminiIcon className="w-5 h-5 mr-2" />
                            Google Gemini API
                        </h3>
                        <label htmlFor="gemini-key" className="block text-sm font-medium text-gray-300 mb-1">
                            API Key (음성인식 / 차트생성용)
                        </label>
                        <input
                            id="gemini-key"
                            type="password"
                            value={geminiKey}
                            onChange={(e) => setGeminiKey(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            placeholder="Google Gemini API 키를 입력하세요"
                        />
                        <a
                            href="https://makersuite.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-400 hover:text-brand-accent mt-1 inline-block"
                        >
                            API 키 발급받기
                        </a>
                    </div>

                    {/* Google Workspace API */}
                    <div className="border-t border-gray-700 pt-6">
                        <h3 className="text-lg font-semibold text-brand-primary mb-3 flex items-center">
                            <GoogleIcon className="w-5 h-5 mr-2" />
                            Google Workspace API
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="google-client-id" className="block text-sm font-medium text-gray-300 mb-1">
                                    Client ID (로그인용)
                                </label>
                                <input
                                    id="google-client-id"
                                    type="password"
                                    value={googleClientId}
                                    onChange={(e) => setGoogleClientId(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                    placeholder="Google Client ID를 입력하세요"
                                />
                            </div>
                            <div>
                                <label htmlFor="google-api-key" className="block text-sm font-medium text-gray-300 mb-1">
                                    API Key (Google API 호출용)
                                </label>
                                <input
                                    id="google-api-key"
                                    type="password"
                                    value={googleApiKey}
                                    onChange={(e) => setGoogleApiKey(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                    placeholder="Google API Key를 입력하세요"
                                />
                            </div>
                            <a
                                href="https://console.cloud.google.com/apis/credentials"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-gray-400 hover:text-brand-accent inline-block"
                            >
                                인증 정보 발급받기
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-6 rounded-md transition-colors"
                    >
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
};

import React from 'react';
import { GeminiIcon, CloseIcon, EditIcon, CheckIcon, CopyIcon, SaveIcon, Spinner } from './icons';

interface AnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    result: string;
    isLoading: boolean;
    isEditing: boolean;
    onToggleEdit: () => void;
    onContentChange: (newContent: string) => void;
    onCopy: () => void;
    onSave: () => void;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({
    isOpen,
    onClose,
    result,
    isLoading,
    isEditing,
    onToggleEdit,
    onContentChange,
    onCopy,
    onSave
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-2xl p-6 sm:p-8 w-full max-w-2xl m-4 flex flex-col" style={{maxHeight: '90vh'}}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <GeminiIcon className="w-6 h-6 mr-3 text-brand-primary" />
                        심층분석
                    </h2>
                    <div className="flex items-center space-x-2">
                        {result && !isLoading && (
                            <>
                                <button
                                    onClick={onToggleEdit}
                                    className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                                    aria-label={isEditing ? '수정 완료' : '수정'}
                                >
                                    {isEditing ? <CheckIcon className="w-5 h-5" /> : <EditIcon className="w-5 h-5" />}
                                </button>
                                <button
                                    onClick={onCopy}
                                    className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                                    aria-label="클립보드에 복사"
                                >
                                    <CopyIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={onSave}
                                    className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                                    aria-label="텍스트 파일로 저장"
                                >
                                    <SaveIcon className="w-5 h-5" />
                                </button>
                            </>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors ml-2"
                        >
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex-grow bg-gray-900 rounded-md p-4 overflow-y-auto text-gray-300">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <Spinner className="w-10 h-10 text-brand-primary" />
                            <p className="mt-4 text-gray-400">잠시만 기다려주세요...</p>
                        </div>
                    ) : isEditing ? (
                        <textarea
                            value={result}
                            onChange={(e) => onContentChange(e.target.value)}
                            className="w-full h-full bg-transparent text-gray-300 resize-none focus:outline-none"
                            spellCheck="false"
                        />
                    ) : (
                        <div className="whitespace-pre-wrap">{result}</div>
                    )}
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-6 rounded-md transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

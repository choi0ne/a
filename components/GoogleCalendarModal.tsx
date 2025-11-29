import React, { useState, useEffect, useCallback } from 'react';
import { CalendarEvent } from '../types';
import { GoogleCalendarIcon, CloseIcon, Spinner } from './icons';

interface GoogleCalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    isSignedIn: boolean;
}

export const GoogleCalendarModal: React.FC<GoogleCalendarModalProps> = ({
    isOpen,
    onClose,
    isSignedIn
}) => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const listEvents = useCallback(async () => {
        if (!isSignedIn) {
            setError("Google 계정으로 로그인해주세요.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const today = new Date();
            const timeMin = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
            const timeMax = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

            const response = await window.gapi.client.calendar.events.list({
                'calendarId': 'primary',
                'timeMin': timeMin,
                'timeMax': timeMax,
                'showDeleted': false,
                'singleEvents': true,
                'orderBy': 'startTime',
            });

            setEvents(response.result.items || []);
        } catch (err: any) {
            const errorMsg = err.result?.error?.message || '알 수 없는 오류';
            setError(`일정 로딩 실패: ${errorMsg}`);
            console.error("Calendar API error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [isSignedIn]);

    useEffect(() => {
        if (isOpen) {
            listEvents();
        }
    }, [isOpen, listEvents]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg m-4 flex flex-col" style={{minHeight: '20rem'}}>
                <div className="bg-white p-3 rounded-t-lg flex justify-between items-center text-black">
                    <h2 className="text-xl font-bold flex items-center">
                        <GoogleCalendarIcon className="w-6 h-6 mr-2" />
                        Google Calendar
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow p-6 flex flex-col items-center justify-center">
                    {isLoading ? (
                        <Spinner className="w-10 h-10 text-brand-primary" />
                    ) : error ? (
                        <p className="text-red-400 text-center">{error}</p>
                    ) : !isSignedIn ? (
                        <p className="text-gray-400">Google 계정으로 로그인 후 이용 가능합니다.</p>
                    ) : events.length > 0 ? (
                        <ul className="w-full space-y-2">
                            {events.map(event => (
                                <li key={event.id} className="bg-gray-700 p-3 rounded-md text-gray-200">
                                    {event.summary}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400">오늘 일정이 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    message: string;
    type?: ToastType;
}

const ToastContext = createContext<{ showToast: (msg: string, type?: ToastType) => void }>({ showToast: () => {} });

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toast, setToast] = useState<Toast | null>(null);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <div
                    className={`
                        fixed bottom-6 right-6 z-50 px-6 py-3 rounded shadow-lg text-white
                        ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-gray-800'}
                        animate-fade-in
                    `}
                    style={{ pointerEvents: 'none', minWidth: 220 }}
                >
                    {toast.message}
                </div>
            )}
            <style jsx global>{`
                @keyframes fade-in {
                    0% { opacity: 0; transform: translateY(20px);}
                    10% { opacity: 1; transform: translateY(0);}
                    90% { opacity: 1;}
                    100% { opacity: 0; transform: translateY(20px);}
                }
                .animate-fade-in {
                    animation: fade-in 5s;
                }
            `}</style>
        </ToastContext.Provider>
    );
}
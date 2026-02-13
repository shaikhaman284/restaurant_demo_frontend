import React from 'react';

interface Props {
    message: string;
    type?: 'success' | 'error' | 'info';
    onClose: () => void;
}

const Toast: React.FC<Props> = ({ message, type = 'info', onClose }) => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
    }[type];

    return (
        <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in`}>
            <p>{message}</p>
        </div>
    );
};

export default Toast;

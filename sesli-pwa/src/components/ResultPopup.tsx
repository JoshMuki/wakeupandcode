import React from 'react';
import { ResultPopupProps } from '../types/types';

const ResultPopup: React.FC<ResultPopupProps> = ({ result, onClose }) => {
    if (!result) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg max-w-lg w-full">
                <h2 className="text-xl font-bold mb-2">{result.title}</h2>
                <p className="mb-4">{result.content}</p>
                <p className="mb-2">Alaka Düzeyi: {result.relevanceScore.toFixed(2)}</p>
                <button
                    onClick={onClose}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                    Kapat
                </button>
            </div>
        </div>
    );
};

export default ResultPopup;
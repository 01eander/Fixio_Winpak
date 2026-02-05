import React from 'react';
import { X, QrCode } from 'lucide-react';

export default function QrModal({ title, value, onClose }) {
    // Using a public API for demo purposes to generate real QR codes
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(value)}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl max-w-sm w-full relative overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        <QrCode className="text-blue-400" size={20} />
                        Código QR
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col items-center justify-center bg-white">
                    <div className="bg-white p-2 rounded-lg shadow-inner">
                        <img
                            src={qrUrl}
                            alt={`QR Code for ${title}`}
                            className="w-48 h-48 object-contain"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-[#1e293b] border-t border-white/10 text-center">
                    <p className="text-sm font-medium text-white mb-1">{title}</p>
                    <p className="text-xs text-gray-400 font-mono">{value}</p>
                    <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-wider">Escanear para ver historial</p>
                </div>
            </div>
        </div>
    );
}

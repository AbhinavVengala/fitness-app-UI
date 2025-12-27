import React, { useEffect, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { X, Camera } from 'lucide-react';

const BarcodeScanner = ({ onScan, onClose }) => {
    const [error, setError] = useState(null);
    const scannerId = "html5qr-code-full-region";

    useEffect(() => {
        // Explicitly support common 1D barcodes
        const formatsToSupport = [
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.QR_CODE
        ];

        const html5QrCode = new Html5Qrcode(scannerId, { formatsToSupport });

        const startScanning = async () => {
            try {
                await html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        // qrbox: { width: 300, height: 150 }, // Let it use full frame
                        // aspectRatio: 1.0, 
                        experimentalFeatures: {
                            useBarCodeDetectorIfSupported: true
                        }
                    },
                    (decodedText, decodedResult) => {
                        html5QrCode.stop().then(() => {
                            onScan(decodedText);
                        });
                    },
                    (errorMessage) => {
                        // ignore scanning errors logs
                    }
                );
            } catch (err) {
                setError("Camera permission denied or camera not supported.");
                console.error(err);
            }
        };

        startScanning();

        return () => {
            if (html5QrCode.isScanning) {
                html5QrCode.stop().catch(err => console.error("Failed to stop scanner", err));
            }
            html5QrCode.clear();
        };
    }, [onScan]);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in">
            <div className="bg-card w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative">
                {/* Header */}
                <div className="bg-muted px-4 py-3 flex justify-between items-center border-b border-border">
                    <h3 className="font-bold flex items-center gap-2">
                        <Camera className="w-5 h-5 text-primary" />
                        Scan Barcode
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-black/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scanner Area */}
                <div className="bg-black relative min-h-[300px] flex items-center justify-center overflow-hidden">
                    {!error ? (
                        <>
                            <div id={scannerId} className="w-full h-full"></div>
                            {/* Visual Guide Overlay */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="w-[300px] h-[150px] border-2 border-primary/50 rounded-lg relative">
                                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary -mt-1 -ml-1"></div>
                                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary -mt-1 -mr-1"></div>
                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary -mb-1 -ml-1"></div>
                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary -mb-1 -mr-1"></div>
                                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500/50"></div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-white text-center p-6 bg-destructive/10">
                            <p className="mb-4">{error}</p>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-white text-black rounded-lg font-medium"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-4 text-center text-sm text-muted-foreground bg-card border-t border-border">
                    Align barcode within the frame
                </div>
            </div>
        </div>
    );
};

export default BarcodeScanner;

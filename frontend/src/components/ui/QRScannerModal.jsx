import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useTranslation } from 'react-i18next';

export function QRScannerModal({ onScan, onClose }) {
  const { t } = useTranslation();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { 
      fps: 10, 
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    }, false);
    
    scanner.render((decodedText) => {
      onScan(decodedText);
      scanner.clear();
      onClose();
    }, (error) => {
      // Handle or ignore frame errors silently
    });

    return () => {
      try {
        scanner.clear();
      } catch (e) {
        console.error(e);
      }
    };
  }, [onScan, onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#091327] rounded-xl border border-primary/20 w-full max-w-md overflow-hidden relative shadow-2xl">
        <div className="p-4 border-b border-primary/20 flex justify-between items-center bg-surface-container/50">
          <h3 className="font-title-sm text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">qr_code_scanner</span> 
            {t('complaint.qr_scan', 'Scan QR Code')}
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div id="reader" className="w-full bg-black min-h-[300px]"></div>
        <div className="p-4 text-center text-xs text-on-surface-variant font-mono-data">
          Position the QR code within the frame to scan automatically.
        </div>
      </div>
    </div>
  );
}

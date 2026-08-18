import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useTranslation } from 'react-i18next';

export function QRScannerModal({ onScan, onClose }) {
  const { t } = useTranslation();
  const scannerRef = useRef(null);
  const onScanRef = useRef(onScan);
  const onCloseRef = useRef(onClose);

  // Keep refs up to date without triggering effect re-run
  useEffect(() => {
    onScanRef.current = onScan;
    onCloseRef.current = onClose;
  }, [onScan, onClose]);

  useEffect(() => {
    let isMounted = true;
    let scannerInstance = null;

    // Small delay to ensure modal DOM container is fully rendered and styled in layout tree
    const timer = setTimeout(() => {
      if (!isMounted) return;

      try {
        scannerInstance = new Html5QrcodeScanner(
          "reader",
          { 
            fps: 10, 
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              const qrboxSize = Math.floor(minEdge * 0.70);
              return { width: Math.max(200, qrboxSize), height: Math.max(200, qrboxSize) };
            },
            aspectRatio: 1.0,
            rememberLastUsedCamera: true,
            supportedScanTypes: [0, 1] // Camera stream and Image File upload
          },
          /* verbose= */ false
        );

        scannerRef.current = scannerInstance;

        scannerInstance.render(
          (decodedText) => {
            if (onScanRef.current) onScanRef.current(decodedText);
            if (scannerInstance) {
              scannerInstance.clear().catch(console.error);
            }
            if (onCloseRef.current) onCloseRef.current();
          },
          (error) => {
            // Ignore scan frame error ticks
          }
        );
      } catch (err) {
        console.error("QR Scanner Init Error:", err);
      }
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch(() => {});
        } catch (e) {
          // ignore cleanup error
        }
      }
    };
  }, []); // Run ONCE on mount

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#091327] rounded-xl border border-primary/30 w-full max-w-md overflow-hidden relative shadow-2xl flex flex-col">
        <div className="p-4 border-b border-primary/20 flex justify-between items-center bg-surface-container/50">
          <h3 className="font-title-sm text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">qr_code_scanner</span> 
            {t('complaint.qr_scan', 'Scan QR Code')}
          </h3>
          <button 
            onClick={onClose} 
            className="text-on-surface-variant hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-4 flex-1 flex flex-col items-center justify-center min-h-[320px]">
          <div 
            id="reader" 
            className="w-full bg-black/80 rounded-lg overflow-hidden border border-white/10 text-white [&_a]:text-sky-400 [&_button]:!bg-primary/80 [&_button]:!text-white [&_button]:!px-3 [&_button]:!py-1.5 [&_button]:!rounded-md [&_button]:!text-xs [&_button]:!font-bold [&_button]:hover:!bg-primary [&_select]:!bg-slate-800 [&_select]:!text-white [&_select]:!border-slate-700 [&_select]:!rounded-md [&_select]:!p-1.5 [&_select]:!text-xs"
          ></div>
        </div>
        <div className="p-3 text-center text-xs text-on-surface-variant font-mono-data border-t border-white/5 bg-slate-900/40">
          Point camera at QR code or select a QR image to auto-fill complaint details.
        </div>
      </div>
    </div>
  );
}

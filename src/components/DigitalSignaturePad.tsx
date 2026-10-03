import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Upload, Eraser, Check, ShieldCheck, RefreshCw, Stamp } from 'lucide-react';

interface Props {
  directorSignature: string;
  onSaveDirectorSignature: (dataUrl: string) => void;
  instituteStamp: string;
  onSaveInstituteStamp: (dataUrl: string) => void;
  directorName: string;
}

export const DigitalSignaturePad: React.FC<Props> = ({
  directorSignature,
  onSaveDirectorSignature,
  instituteStamp,
  onSaveInstituteStamp,
  directorName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [inkColor, setInkColor] = useState('#0f2942');
  const [penWidth, setPenWidth] = useState(2.8);
  const [hasDrawn, setHasDrawn] = useState(false);
  const signatureFileInputRef = useRef<HTMLInputElement>(null);
  const stampFileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = penWidth;
  }, [inkColor, penWidth]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSaveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSaveDirectorSignature(dataUrl);
    alert('Digital Signature saved successfully!');
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          onSaveDirectorSignature(evt.target.result as string);
          alert('Signature image uploaded successfully!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          onSaveInstituteStamp(evt.target.result as string);
          alert('Official Stamp uploaded successfully!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1: DIGITAL SIGNATURE (DRAW OR UPLOAD) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <PenTool className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Director Digital Signature ({directorName})
              </h3>
              <p className="text-xs text-slate-500">
                Draw digitally on screen or upload a transparent signature image (PNG/SVG)
              </p>
            </div>
          </div>
          <input
            ref={signatureFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleSignatureUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => signatureFileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            <Upload className="w-3.5 h-3.5" /> Upload Signature File
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Drawing Pad */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold">Sign inside the box below:</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px]">Ink:</span>
                <button
                  type="button"
                  onClick={() => setInkColor('#0f2942')}
                  className={`w-4 h-4 rounded-full bg-[#0f2942] border ${inkColor === '#0f2942' ? 'ring-2 ring-blue-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setInkColor('#1e40af')}
                  className={`w-4 h-4 rounded-full bg-[#1e40af] border ${inkColor === '#1e40af' ? 'ring-2 ring-blue-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setInkColor('#000000')}
                  className={`w-4 h-4 rounded-full bg-black border ${inkColor === '#000000' ? 'ring-2 ring-blue-500' : ''}`}
                />
              </div>
            </div>

            <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden shadow-inner flex justify-center">
              <canvas
                ref={canvasRef}
                width={420}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="cursor-crosshair bg-white w-full max-w-[420px] h-[160px] touch-none"
              />
              <div className="absolute bottom-2 right-2 pointer-events-none text-[9px] text-slate-400 font-mono">
                Director Signature Pad
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={clearCanvas}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded font-medium"
              >
                <Eraser className="w-3.5 h-3.5" /> Clear Canvas
              </button>

              <button
                type="button"
                disabled={!hasDrawn}
                onClick={handleSaveDrawing}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0f2942] text-white text-xs font-semibold rounded-lg hover:bg-[#1a3d60] transition-colors disabled:opacity-40"
              >
                <Check className="w-3.5 h-3.5" /> Apply Drawn Signature
              </button>
            </div>
          </div>

          {/* Active Signature Preview */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              Currently Active Signature on Credentials:
            </span>
            <div className="h-28 border border-slate-300 rounded-lg bg-white p-3 flex items-center justify-center shadow-xs">
              {directorSignature ? (
                <img
                  src={directorSignature}
                  alt="Director Active Signature"
                  className="max-h-20 object-contain"
                />
              ) : (
                <span className="text-xs text-slate-400">No signature set</span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 font-mono text-center">
              Signatory: {directorName} (MCA, Data Science) • Automatically embeds on Certificate &amp; Marksheet
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: OFFICIAL STAMP / SEAL (UPLOAD & PREVIEW) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Stamp className="w-5 h-5 text-blue-700" />
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Official Institutional Seal &amp; Stamp
              </h3>
              <p className="text-xs text-slate-500">
                Circular institutional stamp applied with date and verification authority
              </p>
            </div>
          </div>
          <input
            ref={stampFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleStampUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => stampFileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e3a8a] text-white text-xs font-semibold rounded-lg hover:bg-blue-900 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" /> Upload Custom Seal / Stamp
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-1 flex flex-col items-center justify-center p-4 bg-slate-50 border rounded-xl">
            <img
              src={instituteStamp || '/stamp-official.svg'}
              alt="Official Institute Seal"
              className="w-32 h-32 object-contain drop-shadow-md"
            />
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-2">
              Active Official Seal
            </span>
          </div>

          <div className="md:col-span-2 space-y-3 text-xs text-slate-600">
            <h4 className="font-bold text-slate-800 text-sm">Seal Placement &amp; Rendering Properties</h4>
            <p className="leading-relaxed">
              The official seal is positioned at the lower center/right of both the certificate parchment and the marksheet transcript.
              You can upload your own physical stamp photo or transparent seal SVG, or use the generated Advance Institute of Digital Technology verified exam authority seal.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => onSaveInstituteStamp('/stamp-official.svg')}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium"
              >
                Reset to Default Blue Stamp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

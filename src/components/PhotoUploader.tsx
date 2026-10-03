import React, { useRef, useState } from 'react';
import { Upload, Camera, X, Check, Image as ImageIcon } from 'lucide-react';

interface Props {
  photoUrl: string;
  onChange: (base64OrUrl: string) => void;
  label?: string;
  required?: boolean;
}

export const PhotoUploader: React.FC<Props> = ({
  photoUrl,
  onChange,
  label = 'Student Passport Photograph',
  required = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const samplePhotos = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=face',
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onChange(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
        <span className="text-[10px] text-slate-500 font-mono">Passport format</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
        {/* Photo Preview Box */}
        <div className="relative group shrink-0">
          <div className="w-24 h-28 border-2 border-[#d4af37] bg-white rounded-md overflow-hidden shadow-sm flex items-center justify-center">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Student Passport"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-2 text-slate-400">
                <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                <span className="text-[9px] block">No Photo</span>
              </div>
            )}
          </div>
          {photoUrl && (
            <button
              type="button"
              onClick={() => onChange('')}
              title="Remove photo"
              className="absolute -top-1.5 -right-1.5 p-1 bg-red-600 text-white rounded-full shadow hover:bg-red-700 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Upload Drop Zone & Controls */}
        <div className="flex-1 w-full space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-700">
              <Camera className="w-4 h-4 text-blue-700" />
              <span>Click to Upload / Drag &amp; Drop Student Photo</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              JPG, PNG, or WEBP (Displays on Certificate &amp; Marksheet)
            </p>
          </div>

          {/* Quick Preset Selector for Easy Testing */}
          <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
            <span className="text-[10px] uppercase font-semibold">Or Pick Sample:</span>
            <div className="flex gap-1.5">
              {samplePhotos.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChange(sample)}
                  className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all ${
                    photoUrl === sample ? 'border-amber-500 scale-110 shadow-xs' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={sample} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

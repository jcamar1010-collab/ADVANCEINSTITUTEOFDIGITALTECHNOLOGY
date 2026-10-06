import React, { useRef, useState } from 'react';
import { Camera, X, Image as ImageIcon, User, Upload } from 'lucide-react';

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
        {/* Photo Preview Box - Shows Photo Icon when no photo is uploaded */}
        <div className="relative group shrink-0">
          <div className="w-24 h-28 border-2 border-dashed border-slate-300 bg-white rounded-lg overflow-hidden shadow-xs flex items-center justify-center">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Uploaded Passport"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-2 text-slate-400 flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-1 text-slate-400">
                  <User className="w-6 h-6 stroke-[1.5]" />
                </div>
                <span className="text-[10px] font-medium text-slate-500 block">Photo Icon</span>
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
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-700">
              <Camera className="w-5 h-5 text-blue-700" />
              <span>Click to Upload / Drag &amp; Drop Student Photo</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Supports JPG, PNG, or WEBP (Prints on official Marksheet &amp; Certificate)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useCallback } from 'react';
import { Upload, Music, Image, CheckCircle, AlertCircle, X } from 'lucide-react';

interface FileUploadProps {
  type: 'audio' | 'image';
  onUploaded: (url: string) => void;
  currentUrl?: string;
  onUploadStart?: () => void;
  onDurationDetected?: (duration: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ type, onUploaded, currentUrl, onUploadStart, onDurationDetected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptTypes = type === 'audio'
    ? '.mp3,.wav,.ogg,.flac,audio/*'
    : '.jpg,.jpeg,.png,.webp,.gif,image/*';

  const maxSizeMB = type === 'audio' ? 50 : 10;
  const Icon = type === 'audio' ? Music : Image;

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setUploadedName(null);

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`El archivo supera los ${maxSizeMB}MB`);
      return;
    }

    onUploadStart?.();
    setProgress(0);

    try {
      const { api } = await import('../services/api');

      if (type === 'audio') {
        // Leer la duracion del archivo
        if (onDurationDetected) {
          const audioEl = new Audio();
          audioEl.src = URL.createObjectURL(file);
          audioEl.addEventListener('loadedmetadata', () => {
            const totalSec = Math.floor(audioEl.duration);
            const min = Math.floor(totalSec / 60);
            const sec = totalSec % 60;
            onDurationDetected(`${min}:${sec < 10 ? '0' : ''}${sec}`);
            URL.revokeObjectURL(audioEl.src);
          });
        }
        const result = await api.files.uploadAudio(file, (p) => setProgress(p));
        onUploaded(result.url);
        setUploadedName(file.name);
      } else {
        const result = await api.files.uploadImage(file);
        onUploaded(result.url);
        setUploadedName(file.name);
      }
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error subiendo archivo');
      setProgress(null);
    }
  }, [type, maxSizeMB, onUploaded, onUploadStart]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearUpload = () => {
    setUploadedName(null);
    setProgress(null);
    setError(null);
    onUploaded('');
    if (inputRef.current) inputRef.current.value = '';
  };

  // Si ya se subio el archivo, mostrar confirmacion
  if (uploadedName && progress === 100) {
    return (
      <div className="flex items-center space-x-3 bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3">
        <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-green-400 text-sm font-medium truncate">{uploadedName}</p>
          <p className="text-green-500/60 text-xs">Subido correctamente</p>
        </div>
        <button onClick={clearUpload} className="text-slate-400 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${isDragging
            ? 'border-primary bg-primary/10 scale-[1.02]'
            : 'border-slate-700 hover:border-slate-500 bg-slate-900/50'
          }
          ${error ? 'border-red-500/50' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptTypes}
          onChange={handleInputChange}
          className="hidden"
        />

        {progress !== null && progress < 100 ? (
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
              <Upload size={24} className="text-primary animate-bounce" />
            </div>
            <p className="text-slate-300 text-sm">Subiendo... {progress}%</p>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center">
              <Icon size={24} className={isDragging ? 'text-primary' : 'text-slate-400'} />
            </div>
            <p className="text-slate-300 text-sm">
              {isDragging ? 'Suelta el archivo aquí' : 'Arrastra un archivo o haz click para seleccionar'}
            </p>
            <p className="text-slate-500 text-xs">
              {type === 'audio' ? 'MP3, WAV, OGG, FLAC' : 'JPG, PNG, WebP'} — Máx. {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center space-x-2 mt-2 text-red-400 text-sm">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {currentUrl && !uploadedName && (
        <p className="text-slate-500 text-xs mt-2 truncate">Actual: {currentUrl}</p>
      )}
    </div>
  );
};

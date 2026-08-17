import React, { useState, useRef } from 'react';
import { Upload, Film, Image as ImageIcon, CheckCircle2, X, AlertCircle, Link as LinkIcon, RefreshCw, Eye } from 'lucide-react';
import { compressImageFile, processVideoFile, readFileAsDataURL, formatFileSize } from '../utils/mediaUpload';

interface MediaUploadZoneProps {
  id?: string;
  label: string;
  value: string;
  onChange: (url: string, metadata?: { duration?: string; thumbnail?: string }) => void;
  accept?: 'image' | 'video' | 'any';
  helperText?: string;
  required?: boolean;
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto';
  onThumbnailExtracted?: (thumbUrl: string) => void;
  onDurationExtracted?: (duration: string) => void;
}

export const MediaUploadZone: React.FC<MediaUploadZoneProps> = ({
  id,
  label,
  value,
  onChange,
  accept = 'image',
  helperText,
  required = false,
  aspectRatio = 'auto',
  onThumbnailExtracted,
  onDurationExtracted
}) => {
  const [mode, setMode] = useState<'gallery' | 'url'>(value && (value.startsWith('http://') || value.startsWith('https://')) ? 'url' : 'gallery');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string; type: string } | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptMime =
    accept === 'image'
      ? 'image/jpeg,image/png,image/webp,image/gif,image/jpg'
      : accept === 'video'
      ? 'video/mp4,video/webm,video/quicktime,video/mov'
      : 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime';

  const isVideo = (url: string) => {
    if (!url) return false;
    if (url.startsWith('data:video/')) return true;
    return url.match(/\.(mp4|webm|mov|m4v)(\?.*)?$/i) !== null;
  };

  const handleFile = async (file: File) => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const isVideoFile = file.type.startsWith('video/');
      const isImageFile = file.type.startsWith('image/');

      setFileDetails({
        name: file.name,
        size: formatFileSize(file.size),
        type: isVideoFile ? 'Video' : 'Photo'
      });

      if (isImageFile) {
        // Compress image to manageable size while preserving clarity
        const compressedDataUrl = await compressImageFile(file, 1600, 1600, 0.88);
        onChange(compressedDataUrl);
      } else if (isVideoFile) {
        // Process video, extract duration and frame
        const videoDataUrl = await readFileAsDataURL(file);
        onChange(videoDataUrl);

        try {
          const meta = await processVideoFile(file);
          if (meta.durationFormatted && onDurationExtracted) {
            onDurationExtracted(meta.durationFormatted);
          }
          if (meta.thumbnailDataUrl && onThumbnailExtracted) {
            onThumbnailExtracted(meta.thumbnailDataUrl);
          }
        } catch (e) {
          console.warn('Could not extract video metadata', e);
        }
      } else {
        const rawData = await readFileAsDataURL(file);
        onChange(rawData);
      }
    } catch (err: any) {
      alert('Error reading file: ' + (err.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setFileDetails(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5" id={id}>
      <div className="flex items-center justify-between">
        <label className="font-bold text-purple-950 text-xs flex items-center gap-1.5">
          {accept === 'video' ? <Film className="w-3.5 h-3.5 text-pink-600" /> : <ImageIcon className="w-3.5 h-3.5 text-pink-600" />}
          <span>{label}</span>
          {required && <span className="text-pink-600 font-black">*</span>}
        </label>

        {/* Mode switcher (Gallery vs URL) */}
        <div className="flex items-center bg-purple-100/70 p-0.5 rounded-xl border border-purple-200/60 text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setMode('gallery')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              mode === 'gallery'
                ? 'bg-pink-600 text-white shadow-xs font-black'
                : 'text-purple-900/70 hover:text-purple-950'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Gallery / Device</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              mode === 'url'
                ? 'bg-pink-600 text-white shadow-xs font-black'
                : 'text-purple-900/70 hover:text-purple-950'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>Web URL</span>
          </button>
        </div>
      </div>

      {mode === 'url' ? (
        /* Direct Web URL Mode */
        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://example.com/media.jpg or video.mp4"
              required={required}
              className="w-full bg-white/90 border border-purple-200 rounded-2xl px-3.5 py-2.5 text-xs text-purple-950 font-mono shadow-sm focus:outline-none focus:border-pink-500 pr-10"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-purple-400 hover:text-purple-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {value && (
            <div className="flex items-center gap-3 p-2 bg-purple-50/80 rounded-xl border border-purple-100">
              <div className="w-12 h-12 rounded-lg bg-black overflow-hidden shrink-0">
                {isVideo(value) ? (
                  <video src={value} className="w-full h-full object-cover" />
                ) : (
                  <img src={value} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold text-purple-950 truncate block">URL Linked Media</span>
                <span className="text-[10px] text-purple-900/60 truncate block">{value}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Gallery / Device Upload Mode */
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptMime}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          {!value ? (
            /* Upload Drop Area */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-5 transition-all text-center cursor-pointer group ${
                isDragging
                  ? 'border-pink-500 bg-pink-50/80 scale-[0.99]'
                  : 'border-purple-200/90 hover:border-pink-400 bg-white/70 hover:bg-pink-50/30'
              }`}
            >
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center py-4 space-y-2">
                  <RefreshCw className="w-7 h-7 text-pink-600 animate-spin" />
                  <span className="text-xs font-black text-purple-950">Processing Media from Gallery...</span>
                  <span className="text-[10px] text-purple-900/60">Optimizing & generating thumbnail</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-2 space-y-2">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform">
                    {accept === 'video' ? <Film className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-xs font-black text-purple-950">
                      Click to choose from <span className="text-pink-600 underline">Gallery / Device</span>
                    </p>
                    <p className="text-[10px] text-purple-900/60 mt-0.5">
                      {accept === 'video'
                        ? 'Supports MP4, WebM, MOV • Auto-extracts poster & duration'
                        : accept === 'image'
                        ? 'Supports JPG, PNG, WEBP, GIF • High-def clarity'
                        : 'Supports Photos & Videos directly from storage'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-xl bg-purple-100 group-hover:bg-pink-100 text-purple-950 text-[11px] font-black border border-purple-200 transition-colors"
                  >
                    📁 Browse Files / Gallery
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Uploaded Preview State */
            <div className="relative rounded-2xl border border-purple-200 bg-white/90 p-3 flex items-center gap-3 shadow-xs">
              <div
                onClick={() => setShowPreviewModal(true)}
                className={`relative rounded-xl overflow-hidden bg-black shrink-0 cursor-pointer group shadow-sm ${
                  aspectRatio === 'banner'
                    ? 'w-24 h-14'
                    : aspectRatio === 'square'
                    ? 'w-14 h-14'
                    : 'w-16 h-16'
                }`}
              >
                {isVideo(value) ? (
                  <video src={value} className="w-full h-full object-cover" />
                ) : (
                  <img src={value} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                  <Eye className="w-4 h-4" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-purple-950 truncate">
                    {fileDetails?.name || (isVideo(value) ? 'Uploaded Video File' : 'Uploaded Photo File')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-purple-900/60 font-medium mt-0.5">
                  <span>{fileDetails?.size || 'Ready'}</span>
                  <span>•</span>
                  <span className="capitalize">{isVideo(value) ? 'Video Reel' : 'Photo'}</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] font-bold text-pink-600 hover:text-pink-700 underline"
                  >
                    Change File
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="text-[10px] font-bold text-purple-700 hover:text-purple-900"
                  >
                    View Full Preview
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemove}
                title="Remove uploaded file"
                className="p-2 rounded-xl bg-purple-50 hover:bg-rose-100 text-purple-400 hover:text-rose-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {helperText && (
        <p className="text-[10px] text-purple-900/60 font-medium pl-1">
          {helperText}
        </p>
      )}

      {/* Media Full Preview Modal */}
      {showPreviewModal && value && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-white">
              <span className="text-xs font-bold font-mono truncate max-w-[280px]">
                {fileDetails?.name || 'Media Preview'}
              </span>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center max-h-[70vh]">
              {isVideo(value) ? (
                <video src={value} controls autoPlay className="w-full h-full max-h-[60vh] object-contain" />
              ) : (
                <img src={value} alt="Preview" className="w-full h-full max-h-[60vh] object-contain" referrerPolicy="no-referrer" />
              )}
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

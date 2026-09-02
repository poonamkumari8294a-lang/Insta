import React, { useState, useRef, useEffect } from 'react';
import {
  Film,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Link as LinkIcon,
  RefreshCw,
  Eye,
  Crop,
  CloudUpload,
  FileText,
  AlertCircle
} from 'lucide-react';
import {
  compressImageToBlob,
  shouldCompressImage,
  formatFileSize
} from '../utils/mediaUpload';
import {
  uploadFileToStorage,
  uploadDataUrlToStorage,
  getCloudinaryVideoThumbnailUrl,
  isCloudinaryUrl
} from '../services/storage';
import { ImageCropperModal, CropAspectRatio } from './ImageCropperModal';

interface MediaUploadZoneProps {
  id?: string;
  label: string;
  value: string;
  onChange: (url: string, metadata?: { duration?: string; thumbnail?: string; publicId?: string; cloudinaryPublicId?: string; resourceType?: string; resource_type?: string; format?: string }) => void;
  accept?: 'image' | 'video' | 'document' | 'any';
  helperText?: string;
  required?: boolean;
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto';
  onThumbnailExtracted?: (thumbUrl: string) => void;
  onDurationExtracted?: (duration: string) => void;
  enableCrop?: boolean;
  storageFolder?: 'website-media' | 'photos' | 'videos' | 'thumbnails' | 'documents' | 'settings' | string;
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
  onDurationExtracted,
  enableCrop = true,
  storageFolder = 'website-media'
}) => {
  const [mode, setMode] = useState<'gallery' | 'url'>(
    value && (value.startsWith('http://') || value.startsWith('https://')) && !isCloudinaryUrl(value) && !value.startsWith('data:') ? 'url' : 'gallery'
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string; type: string } | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  // Local instant preview object URL
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  // Image Cropper States
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);
  const [showCropperModal, setShowCropperModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up any temporary local object URL when unmounting
  useEffect(() => {
    return () => {
      if (localPreviewUrl && localPreviewUrl.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(localPreviewUrl);
        } catch (_) {}
      }
    };
  }, [localPreviewUrl]);

  const acceptMime =
    accept === 'image'
      ? 'image/jpeg,image/png,image/webp,image/gif,image/jpg'
      : accept === 'video'
      ? 'video/mp4,video/webm,video/quicktime,video/mov'
      : accept === 'document'
      ? 'application/pdf,image/jpeg,image/png'
      : 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,application/pdf';

  const isVideo = (url: string) => {
    if (!url) return false;
    if (url.startsWith('data:video/')) return true;
    return url.match(/\.(mp4|webm|mov|m4v|avi|mkv|3gp)(\?.*)?$/i) !== null || url.includes('/video/upload/');
  };

  const isPdf = (url: string) => {
    if (!url) return false;
    if (url.startsWith('data:application/pdf')) return true;
    return url.match(/\.pdf(\?.*)?$/i) !== null;
  };

  const getInitialCropAspect = (): CropAspectRatio => {
    if (aspectRatio === 'square') return '1:1';
    if (aspectRatio === 'banner' || aspectRatio === 'video') return '16:9';
    return 'free';
  };

  const determinedFolder = storageFolder || (accept === 'video' ? 'videos' : accept === 'document' ? 'documents' : 'photos');

  const [lastFailedFile, setLastFailedFile] = useState<File | null>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    const selectionTime = performance.now();
    setLastFailedFile(file);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    const isVideoFile = file.type.startsWith('video/');
    const isImageFile = file.type.startsWith('image/');
    const isPdfFile = file.type === 'application/pdf';

    // Create instant local zero-copy Object URL for immediate preview
    if (localPreviewUrl && localPreviewUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(localPreviewUrl);
      } catch (_) {}
    }
    const tempObjUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(tempObjUrl);

    setFileDetails({
      name: file.name,
      size: formatFileSize(file.size),
      type: isVideoFile ? 'Video' : isPdfFile ? 'PDF Document' : 'Photo',
    });

    try {
      if (isImageFile) {
        setUploadStatus('Uploading to Cloudinary...');
        // Direct file upload to Cloudinary (No unnecessary compression, 100% original quality)
        const uploadResult = await uploadFileToStorage(
          file,
          'website-media',
          `img_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
          (pct, statusText) => {
            setUploadProgress(pct);
            setUploadStatus(statusText);
          },
          {
            selectionTime,
            preprocessDurationMs: 0
          }
        );

        setUploadProgress(100);
        setUploadStatus('✅ Upload complete!');
        setLastFailedFile(null);
        onChange(uploadResult.downloadUrl, {
          publicId: uploadResult.publicId,
          cloudinaryPublicId: uploadResult.cloudinaryPublicId,
          resourceType: 'image',
          resource_type: 'image',
          format: uploadResult.format
        });

      } else if (isVideoFile) {
        // High-Speed Direct Video Stream:
        // 1. Upload original browser File immediately (0ms start delay, zero Base64, zero re-encoding)
        // 2. Derive video poster instantly from Cloudinary URL transformation
        setUploadStatus('Uploading to Cloudinary...');

        const uploadResult = await uploadFileToStorage(
          file,
          'website-media',
          `video_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
          (pct, statusText) => {
            setUploadProgress(pct);
            setUploadStatus(statusText);
          },
          {
            selectionTime,
            preprocessDurationMs: 0
          }
        );

        // Derive high-quality poster thumbnail dynamically from Cloudinary URL in 0ms
        const autoThumbnail = uploadResult.thumbnailUrl || getCloudinaryVideoThumbnailUrl(uploadResult.downloadUrl);
        if (autoThumbnail && onThumbnailExtracted) {
          onThumbnailExtracted(autoThumbnail);
        }

        const videoDuration = uploadResult.durationFormatted || '0:30';
        if (onDurationExtracted) {
          onDurationExtracted(videoDuration);
        }

        setUploadProgress(100);
        setUploadStatus('✅ Video upload complete!');
        setLastFailedFile(null);
        onChange(uploadResult.downloadUrl, {
          thumbnail: autoThumbnail,
          duration: videoDuration,
          publicId: uploadResult.publicId,
          cloudinaryPublicId: uploadResult.cloudinaryPublicId,
          resourceType: 'video',
          resource_type: 'video',
          format: uploadResult.format
        });

      } else {
        // Document / PDF / other
        setUploadStatus('Uploading to Cloudinary...');
        const uploadResult = await uploadFileToStorage(
          file,
          'website-media',
          `doc_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
          (pct, statusText) => {
            setUploadProgress(pct);
            setUploadStatus(statusText);
          },
          {
            selectionTime,
            preprocessDurationMs: 0
          }
        );

        setUploadProgress(100);
        setUploadStatus('✅ Upload complete!');
        setLastFailedFile(null);
        onChange(uploadResult.downloadUrl);
      }
    } catch (err: any) {
      console.error('[Cloudinary Upload Error]', err);
      const errMsg = err.message || 'Cloudinary upload failed. Please try again.';
      setUploadError(errMsg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCropComplete = async (croppedDataUrl: string) => {
    setShowCropperModal(false);
    setRawImageForCrop(null);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('Uploading cropped image to Cloudinary...');
    setUploadError(null);

    try {
      const uploadResult = await uploadDataUrlToStorage(
        croppedDataUrl,
        determinedFolder,
        `crop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.webp`,
        (pct, statusText) => {
          setUploadProgress(pct);
          setUploadStatus(statusText || `Saving (${pct}%)...`);
        }
      );
      setUploadProgress(100);
      onChange(uploadResult.downloadUrl);
    } catch (err: any) {
      console.error('[Crop Upload Error]', err);
      setUploadError(err.message || 'Cropped image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualCropOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!value || isVideo(value) || isPdf(value)) return;
    setRawImageForCrop(value);
    setShowCropperModal(true);
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
    if (localPreviewUrl && localPreviewUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(localPreviewUrl);
      } catch (_) {}
      setLocalPreviewUrl(null);
    }
    onChange('');
    setFileDetails(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayMediaUrl = value || localPreviewUrl;

  return (
    <div className="space-y-1.5" id={id}>
      <div className="flex items-center justify-between">
        <label className="font-bold text-purple-950 text-xs flex items-center gap-1.5">
          {accept === 'video' ? (
            <Film className="w-3.5 h-3.5 text-pink-600" />
          ) : accept === 'document' ? (
            <FileText className="w-3.5 h-3.5 text-pink-600" />
          ) : (
            <ImageIcon className="w-3.5 h-3.5 text-pink-600" />
          )}
          <span>{label}</span>
          {required && <span className="text-pink-600 font-black">*</span>}
        </label>

        {/* Mode switcher (Gallery vs URL) */}
        <div className="flex items-center bg-purple-100/70 p-0.5 rounded-xl border border-purple-200/60 text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setMode('gallery')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              mode === 'gallery'
                ? 'bg-pink-600 text-white shadow-xs font-black'
                : 'text-purple-900/70 hover:text-purple-950'
            }`}
          >
            <CloudUpload className="w-3 h-3" />
            <span>Cloudinary Direct</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
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
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-purple-400 hover:text-purple-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {value && (
            <div className="flex items-center justify-between p-2.5 bg-purple-50/80 rounded-2xl border border-purple-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-black overflow-hidden shrink-0 border border-purple-200">
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

              {!isVideo(value) && !isPdf(value) && enableCrop && (
                <button
                  type="button"
                  onClick={handleManualCropOpen}
                  className="px-3 py-1.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-700 text-[11px] font-black border border-pink-200 flex items-center gap-1 shadow-xs transition-colors cursor-pointer shrink-0 ml-2"
                >
                  <Crop className="w-3.5 h-3.5" />
                  <span>Crop</span>
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Cloud Storage Gallery / Device Upload Mode */
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

          {uploadError && (
            <div className="mb-2 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-rose-700 text-xs">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <div>
                  <span className="font-bold">अपलोड समस्या: </span>
                  <span className="break-words">{uploadError}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                {lastFailedFile && (
                  <button
                    type="button"
                    onClick={() => handleFile(lastFailedFile)}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[11px] shadow-xs cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>पुनः प्रयास करें (Retry)</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setUploadError(null)}
                  className="text-rose-500 hover:text-rose-800 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {!value || isUploading ? (
            /* Upload Drop Area & Real-Time Progress */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-5 transition-all text-center group ${
                isUploading
                  ? 'border-pink-500 bg-pink-50/50 cursor-wait'
                  : isDragging
                  ? 'border-pink-500 bg-pink-50/80 scale-[0.99] cursor-pointer'
                  : 'border-purple-200/90 hover:border-pink-400 bg-white/70 hover:bg-pink-50/30 cursor-pointer'
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center justify-center py-3 space-y-3">
                  <div className="relative">
                    <CloudUpload className="w-9 h-9 text-pink-600 animate-pulse" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>

                  <div className="w-full max-w-sm space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-black text-purple-950">
                      <span className="truncate max-w-[240px] text-left">{uploadStatus}</span>
                      <span className="text-pink-600 font-mono text-sm ml-2 font-black">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-purple-100 rounded-full overflow-hidden border border-purple-200">
                      <div
                        className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-150 shadow-sm"
                        style={{ width: `${Math.max(2, uploadProgress)}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-purple-900/60 font-medium">
                    Direct Unsigned Stream to Cloudinary CDN • High Speed
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-2 space-y-2">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform">
                    {accept === 'video' ? (
                      <Film className="w-5 h-5" />
                    ) : accept === 'document' ? (
                      <FileText className="w-5 h-5" />
                    ) : (
                      <CloudUpload className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-black text-purple-950">
                      Click to choose from <span className="text-pink-600 underline">Gallery / Device</span>
                    </p>
                    <p className="text-[10px] text-purple-900/60 mt-0.5">
                      {accept === 'video'
                        ? 'Supports MP4, WebM, MOV • Instant direct upload • Auto Cloudinary Poster'
                        : accept === 'image'
                        ? 'Supports JPG, PNG, WEBP • Zero-delay native upload for normal photos'
                        : 'Supports Photos, Videos & Documents • Permanent Cloud CDN Storage'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded-xl bg-purple-100 group-hover:bg-pink-100 text-purple-950 text-[11px] font-black border border-purple-200 transition-colors"
                    >
                      📁 Browse & Upload
                    </button>
                    {accept !== 'video' && accept !== 'document' && enableCrop && (
                      <span className="px-2.5 py-1 rounded-xl bg-pink-50 text-pink-600 text-[10px] font-bold border border-pink-100 flex items-center gap-1">
                        <Crop className="w-3 h-3" />
                        <span>Auto-Crop Ready</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Uploaded Preview State with Direct Crop & Cloud Storage Status */
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
                {isVideo(displayMediaUrl || '') ? (
                  <video src={displayMediaUrl || ''} className="w-full h-full object-cover" />
                ) : isPdf(displayMediaUrl || '') ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-rose-50 text-rose-600 p-1">
                    <FileText className="w-6 h-6" />
                    <span className="text-[9px] font-black">PDF</span>
                  </div>
                ) : (
                  <img src={displayMediaUrl || ''} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                  <Eye className="w-4 h-4" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-purple-950 truncate">
                    {fileDetails?.name || (isVideo(value) ? 'Cloudinary Video Reel' : isPdf(value) ? 'Cloudinary PDF Document' : 'Cloudinary Photo')}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-purple-900/60 font-medium mt-0.5">
                  <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px] flex items-center gap-0.5">
                    <CloudUpload className="w-2.5 h-2.5" />
                    <span>Cloudinary CDN Synced</span>
                  </span>
                  <span>•</span>
                  <span className="capitalize">{isVideo(value) ? 'Video Reel' : isPdf(value) ? 'PDF' : 'Photo'}</span>
                </div>
                <div className="flex items-center gap-2.5 mt-1.5">
                  {!isVideo(value) && !isPdf(value) && enableCrop && (
                    <button
                      type="button"
                      onClick={handleManualCropOpen}
                      className="px-2.5 py-1 rounded-lg bg-pink-100 hover:bg-pink-200 text-pink-700 text-[10px] font-black border border-pink-200 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Crop className="w-3 h-3" />
                      <span>✂️ क्रॉप / एडजस्ट करें</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] font-bold text-pink-600 hover:text-pink-700 underline cursor-pointer"
                  >
                    Change File
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="text-[10px] font-bold text-purple-700 hover:text-purple-900 cursor-pointer"
                  >
                    Preview
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemove}
                title="Remove uploaded file"
                className="p-2 rounded-xl bg-purple-50 hover:bg-rose-100 text-purple-400 hover:text-rose-600 transition-colors cursor-pointer"
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
      {showPreviewModal && displayMediaUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-white">
              <span className="text-xs font-bold font-mono truncate max-w-[280px]">
                {fileDetails?.name || 'Media Preview'}
              </span>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center max-h-[70vh]">
              {isVideo(displayMediaUrl) ? (
                <video src={displayMediaUrl} controls autoPlay className="w-full h-full max-h-[60vh] object-contain" />
              ) : isPdf(displayMediaUrl) ? (
                <div className="p-8 text-center text-white space-y-3">
                  <FileText className="w-16 h-16 text-pink-500 mx-auto" />
                  <p className="text-xs font-bold">PDF Document Cloud Ready</p>
                  <a
                    href={displayMediaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block px-4 py-2 rounded-xl bg-pink-600 text-white text-xs font-bold"
                  >
                    Open PDF in New Tab
                  </a>
                </div>
              ) : (
                <img src={displayMediaUrl} alt="Preview" className="w-full h-full max-h-[60vh] object-contain" referrerPolicy="no-referrer" />
              )}
            </div>

            <div className="flex items-center justify-between">
              {!isVideo(displayMediaUrl) && !isPdf(displayMediaUrl) && enableCrop ? (
                <button
                  type="button"
                  onClick={(e) => {
                    setShowPreviewModal(false);
                    handleManualCropOpen(e);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-700 text-xs font-black border border-pink-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <Crop className="w-3.5 h-3.5" />
                  <span>क्रॉप टूल खोलें (Crop Image)</span>
                </button>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Image Cropper Modal */}
      {showCropperModal && rawImageForCrop && (
        <ImageCropperModal
          imageSrc={rawImageForCrop}
          isOpen={showCropperModal}
          onClose={() => {
            setShowCropperModal(false);
            setRawImageForCrop(null);
          }}
          onCropComplete={handleCropComplete}
          title={`क्रॉप करें: ${label}`}
          initialAspect={getInitialCropAspect()}
          showCircularMask={aspectRatio === 'square'}
        />
      )}
    </div>
  );
};

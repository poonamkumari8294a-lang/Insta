import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Crop,
  Plus,
  Star,
  Trash2,
  Sparkles,
  Layers
} from 'lucide-react';
import { compressImageFile, readFileAsDataURL, formatFileSize } from '../utils/mediaUpload';
import { ImageCropperModal } from './ImageCropperModal';

interface MultiPhotoUploadZoneProps {
  id?: string;
  label: string;
  photos: string[];
  onChange: (photos: string[]) => void;
  onCoverChange?: (coverUrl: string) => void;
  currentCover?: string;
  helperText?: string;
  required?: boolean;
}

export const MultiPhotoUploadZone: React.FC<MultiPhotoUploadZoneProps> = ({
  id,
  label,
  photos = [],
  onChange,
  onCoverChange,
  currentCover,
  helperText,
  required = false,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Cropper State for single item in the gallery
  const [cropTargetIndex, setCropTargetIndex] = useState<number | null>(null);
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);
  const [showCropperModal, setShowCropperModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);

    const newPhotoUrls: string[] = [];
    const total = files.length;

    try {
      for (let i = 0; i < total; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        setProcessingProgress(`फोटो प्रोसेस हो रही है (${i + 1}/${total})...`);
        const compressed = await compressImageFile(file, 850, 850, 0.74);
        newPhotoUrls.push(compressed);
      }

      if (newPhotoUrls.length > 0) {
        const updatedList = [...photos, ...newPhotoUrls];
        onChange(updatedList);

        // If no cover set yet, set the first photo as cover
        if (!currentCover && onCoverChange && updatedList.length > 0) {
          onCoverChange(updatedList[0]);
        }
      }
    } catch (err: any) {
      alert('Error uploading photos: ' + (err.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
      setProcessingProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (indexToRemove: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const removedUrl = photos[indexToRemove];
    const updated = photos.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);

    // If removed photo was current cover, reset cover to first item
    if (removedUrl === currentCover && onCoverChange) {
      onCoverChange(updated.length > 0 ? updated[0] : '');
    }
  };

  const handleSetCover = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCoverChange) {
      onCoverChange(url);
    }
  };

  const handleOpenCropForPhoto = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCropTargetIndex(index);
    setRawImageForCrop(photos[index]);
    setShowCropperModal(true);
  };

  const handleCropComplete = (croppedDataUrl: string) => {
    if (cropTargetIndex !== null && cropTargetIndex >= 0 && cropTargetIndex < photos.length) {
      const updated = [...photos];
      const oldUrl = updated[cropTargetIndex];
      updated[cropTargetIndex] = croppedDataUrl;
      onChange(updated);

      if (oldUrl === currentCover && onCoverChange) {
        onCoverChange(croppedDataUrl);
      }
    }
    setShowCropperModal(false);
    setCropTargetIndex(null);
    setRawImageForCrop(null);
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
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-2.5" id={id}>
      <div className="flex items-center justify-between">
        <label className="font-bold text-purple-950 text-xs flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-pink-600" />
          <span>{label}</span>
          {required && <span className="text-pink-600 font-black">*</span>}
        </label>

        {photos.length > 0 && (
          <span className="text-[11px] font-black bg-pink-100 text-pink-700 border border-pink-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
            <Sparkles className="w-3 h-3 text-pink-600" />
            <span>{photos.length} Photos Selected</span>
          </span>
        )}
      </div>

      {helperText && (
        <p className="text-[11px] text-purple-900/70 font-medium">
          {helperText}
        </p>
      )}

      {/* Hidden Multi-file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,image/jpg"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
        }}
        className="hidden"
      />

      {/* Drop / Multi-select Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-4 transition-all duration-200 cursor-pointer text-center select-none ${
          isDragging
            ? 'border-pink-500 bg-pink-50/80 scale-[1.01]'
            : 'border-purple-200/80 bg-white/70 hover:bg-pink-50/40 hover:border-pink-300'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-1.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 text-pink-600 flex items-center justify-center shadow-xs">
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-pink-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
          </div>

          <div>
            <p className="text-xs font-black text-purple-950 flex items-center justify-center gap-1.5">
              <span>{isProcessing ? processingProgress : '📸 एक साथ कई फोटो चुनें (Select Multiple Photos)'}</span>
            </p>
            <p className="text-[11px] text-purple-900/60 mt-0.5">
              गैलरी से 1 से लेकर 20+ फ़ोटो एक साथ सेलेक्ट करें या ड्रैग करें
            </p>
          </div>

          <button
            type="button"
            className="mt-1 px-4 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-[11px] font-black shadow-md shadow-pink-500/20 flex items-center gap-1.5 pointer-events-none"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>फ़ोटो जोड़ें (+ Add Photos)</span>
          </button>
        </div>
      </div>

      {/* Photo Grid Preview & Management */}
      {photos.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-purple-950">
            <span>फोटो सूची ({photos.length}) - कवर फोटो और क्रॉप सेट करें:</span>
            <button
              type="button"
              onClick={() => {
                if (confirm('क्या आप सभी फ़ोटो हटाना चाहते हैं?')) {
                  onChange([]);
                  if (onCoverChange) onCoverChange('');
                }
              }}
              className="text-rose-600 hover:text-rose-700 text-[10px] underline cursor-pointer"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-[300px] overflow-y-auto p-1.5 bg-purple-50/50 rounded-2xl border border-purple-100">
            {photos.map((photoUrl, idx) => {
              const isCover = currentCover === photoUrl || (!currentCover && idx === 0);
              return (
                <div
                  key={idx}
                  className={`relative group aspect-square rounded-xl overflow-hidden border-2 shadow-xs transition-all ${
                    isCover
                      ? 'border-pink-500 ring-2 ring-pink-400/40'
                      : 'border-white hover:border-purple-300'
                  }`}
                >
                  <img
                    src={photoUrl}
                    alt={`Item ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Photo Index / Cover Badge */}
                  <div className="absolute top-1 left-1">
                    {isCover ? (
                      <span className="px-1.5 py-0.5 rounded-md bg-pink-600 text-white font-black text-[9px] shadow-sm flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-white" />
                        <span>Cover</span>
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-md bg-black/60 text-white font-bold text-[9px] backdrop-blur-xs">
                        #{idx + 1}
                      </span>
                    )}
                  </div>

                  {/* Action Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1 select-none">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleRemovePhoto(idx, e)}
                        className="p-1 rounded-md bg-rose-600 text-white hover:bg-rose-500 transition-colors shadow-xs"
                        title="हटाएं (Remove)"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleOpenCropForPhoto(idx, e)}
                        className="w-full py-0.5 rounded-md bg-white/90 hover:bg-white text-purple-950 font-bold text-[9px] flex items-center justify-center gap-1 shadow-xs"
                      >
                        <Crop className="w-2.5 h-2.5 text-pink-600" />
                        <span>क्रॉप</span>
                      </button>

                      {!isCover && onCoverChange && (
                        <button
                          type="button"
                          onClick={(e) => handleSetCover(photoUrl, e)}
                          className="w-full py-0.5 rounded-md bg-pink-600 hover:bg-pink-500 text-white font-bold text-[9px] flex items-center justify-center gap-1 shadow-xs"
                        >
                          <Star className="w-2.5 h-2.5" />
                          <span>कवर बनाएं</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add More Photos Button in Grid */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-purple-300 hover:border-pink-500 bg-white/60 hover:bg-pink-50/60 flex flex-col items-center justify-center text-purple-900 hover:text-pink-600 gap-1 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span className="text-[10px] font-black">+ और जोड़ें</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive Crop Modal for selected photo */}
      <ImageCropperModal
        isOpen={showCropperModal}
        imageSrc={rawImageForCrop}
        title={`क्रॉप फोटो #${(cropTargetIndex ?? 0) + 1}`}
        onCropComplete={handleCropComplete}
        onClose={() => {
          setShowCropperModal(false);
          setCropTargetIndex(null);
          setRawImageForCrop(null);
        }}
      />
    </div>
  );
};

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { 
  Crop, 
  RotateCw, 
  FlipHorizontal, 
  ZoomIn, 
  ZoomOut, 
  Check, 
  X, 
  Maximize2, 
  Circle, 
  Square, 
  Smartphone, 
  Tv, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { getCroppedImg, Area } from '../utils/cropImage';

export type CropAspectRatio = '1:1' | '4:5' | '9:16' | '16:9' | 'free';

interface ImageCropperModalProps {
  imageSrc: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
  title?: string;
  initialAspect?: CropAspectRatio;
  lockAspect?: boolean;
  showCircularMask?: boolean;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  imageSrc,
  isOpen,
  onClose,
  onCropComplete,
  title = 'फोटो क्रॉप और एडजस्ट करें (Crop & Adjust Photo)',
  initialAspect = 'free',
  lockAspect = false,
  showCircularMask = false,
}) => {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [flip, setFlip] = useState<{ horizontal: boolean; vertical: boolean }>({
    horizontal: false,
    vertical: false,
  });
  const [aspectType, setAspectType] = useState<CropAspectRatio>(initialAspect);
  const [isCircle, setIsCircle] = useState<boolean>(showCircularMask);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const getNumericAspect = (type: CropAspectRatio): number | undefined => {
    switch (type) {
      case '1:1':
        return 1;
      case '4:5':
        return 4 / 5;
      case '9:16':
        return 9 / 16;
      case '16:9':
        return 16 / 9;
      case 'free':
      default:
        return undefined;
    }
  };

  const onCropChange = useCallback((newCrop: { x: number; y: number }) => {
    setCrop(newCrop);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onCropAreaChange = useCallback(
    (_croppedArea: Area, croppedAreaPixelsResult: Area) => {
      setCroppedAreaPixels(croppedAreaPixelsResult);
    },
    []
  );

  const handleApplyCrop = async () => {
    if (!croppedAreaPixels || !imageSrc) return;
    try {
      setIsSaving(true);
      const croppedData = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        flip,
        1080,
        1080,
        0.82
      );
      onCropComplete(croppedData);
      onClose();
    } catch (err: any) {
      console.error('Failed to crop image', err);
      alert('क्रॉप करने में विफल: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRotate90 = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFlipHorizontal = () => {
    setFlip((prev) => ({ ...prev, horizontal: !prev.horizontal }));
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlip({ horizontal: false, vertical: false });
    setAspectType(initialAspect);
    setIsCircle(showCircularMask);
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-2.5 sm:p-4 select-none animate-in fade-in duration-200 overflow-y-auto">
      {/* Top Header Bar */}
      <div className="w-full max-w-3xl flex items-center justify-between py-2.5 px-3.5 bg-zinc-900/95 rounded-2xl border border-zinc-800 shadow-xl text-white z-20 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400">
            <Crop className="w-4 sm:w-5 h-4 sm:h-5" />
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-white tracking-wide flex items-center gap-1.5">
              <span>{title}</span>
            </h3>
            <p className="text-[10px] sm:text-[11px] text-zinc-400">
              फोटो को खींचकर (drag), ज़ूम और रोटेट करके सेट करें
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Header Apply Button (Visible directly on mobile without scrolling) */}
          <button
            type="button"
            disabled={isSaving}
            onClick={handleApplyCrop}
            className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-[11px] sm:text-xs font-black shadow-md shadow-pink-600/30 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
          >
            {isSaving ? (
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>{isSaving ? 'Saving...' : '✂️ क्रॉप करें (Done)'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 sm:p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="बंद करें (Cancel)"
          >
            <X className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Main Cropper Stage */}
      <div className="relative w-full max-w-3xl flex-1 my-2 sm:my-3 bg-zinc-950 rounded-2xl sm:rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl min-h-[240px] sm:min-h-[380px] max-h-[50vh] sm:max-h-[60vh]">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={getNumericAspect(aspectType)}
          cropShape={isCircle ? 'round' : 'rect'}
          showGrid={true}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropAreaChange}
          transform={[
            `translate(${crop.x}px, ${crop.y}px)`,
            `rotate(${rotation}deg)`,
            `scale(${flip.horizontal ? -zoom : zoom}, ${flip.vertical ? -zoom : zoom})`,
          ].join(' ')}
          classes={{
            containerClassName: 'w-full h-full relative',
            mediaClassName: 'max-w-none',
          }}
        />

        {/* Aspect Badge floating indicator */}
        <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-bold text-zinc-300 border border-white/10 flex items-center gap-1 pointer-events-none">
          <Sparkles className="w-3 h-3 text-pink-400" />
          <span>Aspect: {aspectType.toUpperCase()}</span>
          {isCircle && <span className="text-pink-400">(Circular)</span>}
        </div>

        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-bold text-pink-300 border border-pink-500/30 pointer-events-none flex items-center gap-1.5">
          <span>👆 फोटो को हिलाएं / Pinch or Drag to position</span>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="w-full max-w-3xl bg-zinc-900/95 rounded-2xl border border-zinc-800 p-2.5 sm:p-4 text-white shadow-2xl space-y-2.5 z-20 shrink-0">
        {/* Aspect Ratio Selector Chips */}
        {!lockAspect && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[11px] font-bold text-zinc-400 mr-1 shrink-0">
              आकार (Ratio):
            </span>
            <button
              type="button"
              onClick={() => {
                setAspectType('free');
                setIsCircle(false);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                aspectType === 'free' && !isCircle
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Free (कस्टम)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAspectType('1:1');
                setIsCircle(false);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                aspectType === '1:1' && !isCircle
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              <span>1:1 (Square)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAspectType('4:5');
                setIsCircle(false);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                aspectType === '4:5' && !isCircle
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              }`}
            >
              <span>4:5 (Portrait)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAspectType('9:16');
                setIsCircle(false);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                aspectType === '9:16' && !isCircle
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>9:16 (Story)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAspectType('16:9');
                setIsCircle(false);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                aspectType === '16:9' && !isCircle
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>16:9 (Banner)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAspectType('1:1');
                setIsCircle(true);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                isCircle
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              }`}
            >
              <Circle className="w-3.5 h-3.5" />
              <span>Circle (DP/Avatar)</span>
            </button>
          </div>
        )}

        {/* Sliders and Transform Tools */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-zinc-800/80">
          {/* Zoom Slider */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between text-[11px] font-bold text-zinc-400 mb-0.5">
                <span>ज़ूम (Zoom)</span>
                <span className="font-mono text-zinc-300">{zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={1}
                max={3.5}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3.5, z + 0.2))}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Action Buttons (Rotate, Flip, Reset) */}
          <div className="flex items-center justify-between sm:justify-end gap-1.5">
            <button
              type="button"
              onClick={handleRotate90}
              className="flex-1 sm:flex-initial px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="90 डिग्री घुमाएँ (Rotate 90°)"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rotate 90°</span>
            </button>

            <button
              type="button"
              onClick={handleFlipHorizontal}
              className="flex-1 sm:flex-initial px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="मिरर / फ्लिप करें (Flip)"
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
              <span>Flip</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-[11px] font-bold transition-colors cursor-pointer"
              title="रीसेट (Reset to Default)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Action Bottom Buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 border-t border-zinc-800/80">
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer text-center"
          >
            रद्द करें (Cancel)
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleApplyCrop}
            className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-black shadow-lg shadow-pink-600/30 flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
          >
            {isSaving ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>क्रॉप हो रहा है...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>✂️ क्रॉप और सेव करें (Apply)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

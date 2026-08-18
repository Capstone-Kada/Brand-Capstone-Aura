import React, { useRef, useState } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Modal } from '../../components/ui/UIComponents';

interface AvatarCropModalProps {
  imageSrc: string;
  isOpen: boolean;
  onClose: () => void;
  onCropped: (file: File) => void;
}

const PREVIEW_SIZE = 220; // px — matches the circular mask
const OUTPUT_SIZE = 320; // px — exported square resolution

/**
 * Drag-to-reposition + zoom-slider crop modal for the avatar upload flow.
 * Same clamp/canvas-crop math as a plain-JS reference implementation the
 * product spec pointed at, adapted to this app's Modal component/Tailwind style.
 */
export const AvatarCropModal: React.FC<AvatarCropModalProps> = ({ imageSrc, isOpen, onClose, onCropped }) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [imgDim, setImgDim] = useState({ w: 0, h: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  const clampOffset = (x: number, y: number, currentZoom: number) => {
    if (!imgDim.w) return { x, y };
    const baseScale = Math.max(PREVIEW_SIZE / imgDim.w, PREVIEW_SIZE / imgDim.h);
    const w0 = imgDim.w * baseScale;
    const h0 = imgDim.h * baseScale;
    const maxX = Math.max(0, (w0 * currentZoom - PREVIEW_SIZE) / 2);
    const maxY = Math.max(0, (h0 * currentZoom - PREVIEW_SIZE) / 2);
    return { x: Math.min(Math.max(x, -maxX), maxX), y: Math.min(Math.max(y, -maxY), maxY) };
  };

  const onDragStart = (clientX: number, clientY: number) => {
    isDragging.current = true;
    dragStart.current = { x: clientX - offset.x, y: clientY - offset.y };
  };
  const onDragMove = (clientX: number, clientY: number) => {
    if (!isDragging.current) return;
    setOffset(clampOffset(clientX - dragStart.current.x, clientY - dragStart.current.y, zoom));
  };
  const onDragEnd = () => {
    isDragging.current = false;
  };

  const handleZoomChange = (z: number) => {
    setZoom(z);
    setOffset((prev) => clampOffset(prev.x, prev.y, z));
  };

  const handleClose = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setImgDim({ w: 0, h: 0 });
    onClose();
  };

  const handleApply = () => {
    const img = imgRef.current;
    if (!img || !imgDim.w) return;
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    // Sync canvas coordinates with the CSS transform used for the on-screen preview.
    ctx.translate(
      OUTPUT_SIZE / 2 + offset.x * (OUTPUT_SIZE / PREVIEW_SIZE),
      OUTPUT_SIZE / 2 + offset.y * (OUTPUT_SIZE / PREVIEW_SIZE),
    );
    const coverScale = Math.max(OUTPUT_SIZE / img.naturalWidth, OUTPUT_SIZE / img.naturalHeight);
    ctx.scale(coverScale * zoom, coverScale * zoom);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCropped(file);
        handleClose();
      },
      'image/jpeg',
      0.92,
    );
  };

  const previewScale = imgDim.w ? Math.max(PREVIEW_SIZE / imgDim.w, PREVIEW_SIZE / imgDim.h) : 0;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Sesuaikan Foto Profil" maxWidth="sm">
      <div className="space-y-5">
        <div className="flex justify-center">
          <div
            className="relative w-full h-[280px] rounded-2xl overflow-hidden bg-zinc-100 cursor-grab active:cursor-grabbing touch-none select-none"
            onMouseDown={(e) => {
              e.preventDefault();
              onDragStart(e.clientX, e.clientY);
            }}
            onMouseMove={(e) => onDragMove(e.clientX, e.clientY)}
            onMouseUp={onDragEnd}
            onMouseLeave={onDragEnd}
            onTouchStart={(e) => onDragStart(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchMove={(e) => onDragMove(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchEnd={onDragEnd}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Preview"
              onLoad={(e) => setImgDim({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
              className="absolute top-1/2 left-1/2 pointer-events-none"
              style={{
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                width: imgDim.w ? imgDim.w * previewScale : 'auto',
                height: imgDim.h ? imgDim.h * previewScale : 'auto',
                transformOrigin: 'center center',
              }}
            />
            {/* Dark mask + circular crop window */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none border-2 border-white/85"
              style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE, boxShadow: '0 0 0 9999px rgba(15,23,42,0.65)' }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 px-1">
          <ZoomOut className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="range"
            min={1}
            max={4}
            step={0.05}
            value={zoom}
            onChange={(e) => handleZoomChange(Number.parseFloat(e.target.value))}
            className="flex-1 accent-[#F26CA7] cursor-pointer"
          />
          <ZoomIn className="w-4 h-4 text-zinc-400 shrink-0" />
        </div>

        <p className="text-center text-[11px] text-zinc-400">Geser foto untuk memposisikan, gunakan slider untuk zoom.</p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-sm font-bold text-zinc-700 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-2.5 rounded-xl bg-[#F26CA7] hover:bg-[#e85a98] text-sm font-bold text-white transition-colors"
          >
            Terapkan
          </button>
        </div>
      </div>
    </Modal>
  );
};

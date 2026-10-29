import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Upload, X, Plus, AlertCircle, Loader2 } from 'lucide-react';

interface ImageAttachmentUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  multiple?: boolean;
  label?: string;
  maxImages?: number;
  description?: string;
}

// Client-side helper to compress gallery images using canvas to prevent exceeding Firestore doc limits
export const compressImageFile = (file: File, maxDim = 1200, quality = 0.75): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Initial conversion to optimized JPEG data URL
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Adaptive compression if size is still too large (> 350KB base64)
        if (dataUrl.length > 350000) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.60);
        }
        if (dataUrl.length > 350000) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.45);
        }

        resolve(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const ImageAttachmentUploader: React.FC<ImageAttachmentUploaderProps> = ({
  images,
  onChange,
  multiple = true,
  label = 'Product Garment Photos',
  maxImages = 8,
  description = 'Attach high-resolution photos directly from your phone gallery or computer.'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setUploadError('');

    try {
      const fileList = Array.from(files);
      const compressedList: string[] = [];

      for (const file of fileList) {
        if (!file.type.startsWith('image/')) {
          setUploadError(`"${file.name}" is not a valid image file.`);
          continue;
        }
        const dataUrl = await compressImageFile(file);
        compressedList.push(dataUrl);
      }

      if (multiple) {
        const combined = [...images, ...compressedList].slice(0, maxImages);
        onChange(combined);
      } else {
        if (compressedList.length > 0) {
          onChange([compressedList[0]]);
        }
      }
    } catch (err: any) {
      console.error('Error attaching image from gallery:', err);
      setUploadError('Failed to process image attachment: ' + (err.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-3">
      {/* Hidden Native File Input (Launches Device Gallery / Photos on Mobile) */}
      <input
        ref={fileInputRef}
        id="image-file-upload-input"
        name="imageUploadFile"
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center justify-between">
        <div>
          <label className="block text-white font-medium text-xs">
            {label} {multiple && `(${images.length}/${maxImages})`}
          </label>
          {description && (
            <p className="text-[11px] text-[#71717a] mt-0.5">{description}</p>
          )}
        </div>

        {/* Attach Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing || (multiple && images.length >= maxImages)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1f1f2e] hover:bg-[#2b2b3d] text-[#d4af37] border border-[#d4af37]/50 rounded-xs text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d4af37]" />
              <span>Attaching...</span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Attach from Gallery</span>
            </>
          )}
        </button>
      </div>

      {uploadError && (
        <div className="p-2.5 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Gallery Photo Previews */}
      {images.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-1">
          {images.map((imgSrc, index) => (
            <div 
              key={index}
              className="group relative aspect-3/4 rounded-xs overflow-hidden bg-[#181822] border border-[#272738] shadow-md"
            >
              <img 
                src={imgSrc} 
                alt={`Attached preview ${index + 1}`} 
                className="w-full h-full object-cover"
              />
              
              {/* Primary / Cover Tag */}
              {index === 0 && (
                <span className="absolute top-1 left-1 bg-[#d4af37] text-black text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded-xs shadow-xs">
                  Cover
                </span>
              )}

              {/* Remove Photo Button */}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 p-1 bg-red-950/90 hover:bg-red-700 text-white rounded-full transition-colors opacity-90 group-hover:opacity-100 cursor-pointer shadow-md"
                title="Remove photo"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Add more button if limit not reached */}
          {multiple && images.length < maxImages && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-3/4 border-2 border-dashed border-[#272738] hover:border-[#d4af37]/60 rounded-xs flex flex-col items-center justify-center gap-1.5 text-[#71717a] hover:text-[#d4af37] transition-colors bg-[#101016] cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span className="text-[10px] font-mono uppercase">Add Photo</span>
            </button>
          )}
        </div>
      ) : (
        /* Empty State: Big Tapable Gallery Attachment Dropzone */
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="p-6 border-2 border-dashed border-[#272738] hover:border-[#d4af37]/60 rounded-xs bg-[#121218] flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group text-center"
        >
          <div className="w-12 h-12 rounded-full bg-[#181824] border border-[#272738] flex items-center justify-center group-hover:border-[#d4af37]/50 text-[#a1a1aa] group-hover:text-[#d4af37] transition-colors">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white group-hover:text-[#d4af37] transition-colors">
              Tap here to attach picture from Gallery
            </p>
            <p className="text-[11px] text-[#71717a] mt-0.5">
              Direct upload from Android/iPhone Photos or Computer
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useRef } from 'react';
import { UploadIcon } from './Icons';

interface ImageUploaderProps {
  title: string;
  description: string;
  previewUrl: string | null;
  onImageSelect: (file: File | null) => void;
  onPreviewClick?: (url: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ title, description, previewUrl, onImageSelect, onPreviewClick }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        onImageSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      event.stopPropagation();
  };

  return (
    <div>
      <label
        htmlFor={`file-upload-${title.replace(/\s+/g, '-')}`}
        className="relative block w-full h-32 rounded-lg border-2 border-dashed border-gray-600 hover:border-indigo-500 cursor-pointer transition-colors duration-300"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {previewUrl ? (
          <>
            <img 
              src={previewUrl} 
              alt={`${title} preview`} 
              className="w-full h-full object-cover rounded-md"
              onClick={(e) => {
                e.preventDefault();
                onPreviewClick?.(previewUrl);
              }}
            />
             <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onImageSelect(null);
                    if(inputRef.current) inputRef.current.value = '';
                }}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                aria-label="Remove image"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
          </>

        ) : (
          <div className="flex items-center justify-center w-full h-full px-4">
            <div className="flex items-center gap-4 text-gray-400">
                <div className="flex-shrink-0 bg-gray-700 p-2 rounded-full">
                    <UploadIcon className="w-6 h-6 text-indigo-400"/>
                </div>
                <div className="text-left">
                    <p className="font-semibold text-gray-300">{title}</p>
                    <p className="text-xs">{description}</p>
                </div>
            </div>
          </div>
        )}
        <input
          id={`file-upload-${title.replace(/\s+/g, '-')}`}
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};
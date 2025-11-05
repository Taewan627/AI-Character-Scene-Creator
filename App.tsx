
import React, { useState, useCallback, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { DownloadIcon, SparklesIcon } from './components/Icons';
import { generateSynthesizedImage } from './services/geminiService';
import type { ImageState } from './types';

const hairstyleOptions = [
    { value: 'default', label: 'Default (Goddess Hair)' },
    { value: 'ponytail', label: 'Ponytail' },
    { value: 'short_bob', label: 'Short Bob' },
    { value: 'long_straight', label: 'Long Straight' },
    { value: 'braid', label: 'Braid' },
    { value: 'bun', label: 'Bun' },
    { value: 'pixie_cut', label: 'Pixie Cut' },
    { value: 'hime_cut', label: 'Hime Cut' },
    { value: 'twin_tails', label: 'Twin-tails' },
    { value: 'half_up', label: 'Half-up' },
];


const App: React.FC = () => {
  const [images, setImages] = useState<ImageState>({
    mainCharacter: null,
    clothingReference: null,
    subCharacter: null,
  });
  const [movieEra, setMovieEra] = useState<string>('default');
  const [timeOfDay, setTimeOfDay] = useState<string>('default');
  const [crowdOption, setCrowdOption] = useState<string>('default');
  const [mainCharacterAction, setMainCharacterAction] = useState<string>('default');
  const [mainCharacterHairstyle, setMainCharacterHairstyle] = useState<string>('default');
  const [cameraZoom, setCameraZoom] = useState<string>('default');
  const [cameraAngle, setCameraAngle] = useState<string>('default');
  const [cameraPrompt, setCameraPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('default');
  const [colorGrade, setColorGrade] = useState<string>('default');
  const [filmEffect, setFilmEffect] = useState<string>('default');
  const [backgroundDescription, setBackgroundDescription] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const subCharDependentActions = ['facing_sub'];
    if (!images.subCharacter && subCharDependentActions.includes(mainCharacterAction)) {
      setMainCharacterAction('default');
    }
  }, [images.subCharacter, mainCharacterAction]);

  const handleImageUpload = useCallback((type: keyof ImageState, file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => ({ ...prev, [type]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setImages(prev => ({ ...prev, [type]: null }));
    }
  }, []);

  const handleGenerate = async () => {
    if (!images.mainCharacter || !images.clothingReference) {
      setError("Please upload the Main Character and Clothing Reference images.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateSynthesizedImage(
        images.mainCharacter,
        images.clothingReference,
        images.subCharacter,
        movieEra,
        timeOfDay,
        crowdOption,
        backgroundDescription,
        mainCharacterAction,
        cameraZoom,
        cameraAngle,
        colorGrade,
        filmEffect,
        mainCharacterHairstyle,
        cameraPrompt,
        aspectRatio
      );
      setGeneratedImage(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during image generation.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (format: 'png' | 'jpeg') => {
    if (!generatedImage) return;

    const getTimestamp = () => {
      const now = new Date();
      return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    };

    const timestamp = getTimestamp();
    const filename = `synthesized_${timestamp}.${format === 'jpeg' ? 'jpg' : 'png'}`;
    const pngDataUrl = `data:image/png;base64,${generatedImage}`;

    const triggerDownload = (href: string) => {
        const link = document.createElement('a');
        link.href = href;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (format === 'png') {
        triggerDownload(pngDataUrl);
    } else if (format === 'jpeg') {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.9);
                triggerDownload(jpegDataUrl);
            } else {
                setError("Failed to create canvas context for JPG conversion.");
            }
        };
        img.onerror = () => {
            setError("Failed to load image for JPG conversion.");
        };
        img.src = pngDataUrl;
    }
  };
  
  const canGenerate = images.mainCharacter && images.clothingReference && !isLoading;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-6xl mx-auto relative">
        <header className="text-center mb-8 pt-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-600">
            AI Character Scene Creator
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Combine images into one masterpiece with Gemini.
          </p>
        </header>

        <main className="flex flex-col lg:flex-row gap-8">
          {/* Input Section */}
          <div className="lg:w-1/2 w-full flex flex-col gap-6 p-6 bg-gray-800/50 rounded-2xl border border-gray-700 shadow-lg">
            <h2 className="text-2xl font-bold text-center text-indigo-400">Upload Your Images</h2>
            <ImageUploader
              title="Main Character"
              description="The person or character to be featured."
              previewUrl={images.mainCharacter}
              onImageSelect={(file) => handleImageUpload('mainCharacter', file)}
              onPreviewClick={setModalImageUrl}
            />
            <ImageUploader
              title="Clothing Reference"
              description="The outfit you want the main character to wear."
              previewUrl={images.clothingReference}
              onImageSelect={(file) => handleImageUpload('clothingReference', file)}
              onPreviewClick={setModalImageUrl}
            />
            <ImageUploader
              title="Sub Character"
              description="Optional: A character to look at the main one."
              previewUrl={images.subCharacter}
              onImageSelect={(file) => handleImageUpload('subCharacter', file)}
              onPreviewClick={setModalImageUrl}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
               <div className="flex flex-col gap-2">
                <label htmlFor="hairstyle-select" className="font-semibold text-gray-300">
                  Main Character Hairstyle
                </label>
                <select
                  id="hairstyle-select"
                  value={mainCharacterHairstyle}
                  onChange={(e) => setMainCharacterHairstyle(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  {hairstyleOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
               <div className="flex flex-col gap-2">
                <label htmlFor="action-select" className="font-semibold text-gray-300">
                  Main Character Action
                </label>
                <select
                  id="action-select"
                  value={mainCharacterAction}
                  onChange={(e) => setMainCharacterAction(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="default">Default Pose</option>
                  <option value="walking">Walking</option>
                  <option value="running">Running</option>
                  <option value="kneeling">Kneeling</option>
                  <option value="sitting_ground">Sitting on Ground</option>
                  <option value="fallen_down">Fallen Down (Pained)</option>
                  <option value="sleeping_in_chair">Sleeping in Chair (Head back)</option>
                  <option value="facing_sub" disabled={!images.subCharacter}>Facing Sub-character</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                  <label htmlFor="zoom-select" className="font-semibold text-gray-300">
                    Camera Zoom
                  </label>
                  <select
                    id="zoom-select"
                    value={cameraZoom}
                    onChange={(e) => setCameraZoom(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    <option value="default">Default Zoom</option>
                    <option value="full_body">Full Body Shot</option>
                    <option value="upper_body">Upper Body Shot</option>
                    <option value="bust">Bust Shot</option>
                    <option value="close_up">Close-up Shot</option>
                    <option value="extreme_close_up">Extreme Close-up (Face)</option>
                  </select>
                </div>
                 <div className="flex flex-col gap-2">
                  <label htmlFor="angle-select" className="font-semibold text-gray-300">
                    Camera Angle
                  </label>
                  <select
                    id="angle-select"
                    value={cameraAngle}
                    onChange={(e) => setCameraAngle(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    <option value="default">Default Angle</option>
                    <option value="high_angle">High Angle</option>
                    <option value="face_highlight">Face Highlight</option>
                    <option value="low_angle">Low Angle</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="aspect-ratio-select" className="font-semibold text-gray-300">
                    Aspect Ratio
                  </label>
                  <select
                    id="aspect-ratio-select"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    <option value="default">Default (Square 1:1)</option>
                    <option value="portrait">Portrait (9:16)</option>
                    <option value="landscape">Landscape (16:9)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2 md:col-span-3">
                    <label htmlFor="camera-prompt" className="font-semibold text-gray-300">
                        Camera Prompt (Overrides Zoom/Angle)
                    </label>
                    <textarea
                        id="camera-prompt"
                        value={cameraPrompt}
                        onChange={(e) => setCameraPrompt(e.target.value)}
                        placeholder="e.g., dynamic shot from a low angle, tracking the character's movement"
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors h-20 resize-none"
                        rows={2}
                    />
                </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="movie-era-select" className="font-semibold text-gray-300">
                  Movie Style
                </label>
                <select
                  id="movie-era-select"
                  value={movieEra}
                  onChange={(e) => setMovieEra(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="default">Default Style</option>
                  <option value="1950s">50s Movie Style</option>
                  <option value="1960s">60s Movie Style</option>
                  <option value="1970s">70s Movie Style</option>
                  <option value="1980s">80s Movie Style</option>
                  <option value="1990s">90s Movie Style</option>
                  <option value="2000s">2000s Movie Style</option>
                  <option value="2010s">2010s Movie Style</option>
                  <option value="2020s">2020s Movie Style</option>
                </select>
              </div>
               <div className="flex flex-col gap-2">
                <label htmlFor="time-of-day-select" className="font-semibold text-gray-300">
                  Time of Day
                </label>
                <select
                  id="time-of-day-select"
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="default">Default</option>
                  <option value="day">Day</option>
                  <option value="night">Night</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="crowd-option-select" className="font-semibold text-gray-300">
                  Background Crowd
                </label>
                <select
                  id="crowd-option-select"
                  value={crowdOption}
                  onChange={(e) => setCrowdOption(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="default">Default</option>
                  <option value="with_crowd">With Crowd</option>
                  <option value="without_crowd">Without Crowd</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="color-grade-select" className="font-semibold text-gray-300">
                  Color Grading
                </label>
                <select
                  id="color-grade-select"
                  value={colorGrade}
                  onChange={(e) => setColorGrade(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="default">Default</option>
                  <option value="cool_blue">Cool (Cyan Tint)</option>
                  <option value="warm_sepia">Warm (Sepia Tone)</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="film-effect-select" className="font-semibold text-gray-300">
                  Film Effect
                </label>
                <select
                  id="film-effect-select"
                  value={filmEffect}
                  onChange={(e) => setFilmEffect(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="default">None</option>
                  <option value="vhs">VHS Style</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:col-span-3">
              <label htmlFor="background-desc" className="font-semibold text-gray-300">
                Background Description (Optional)
              </label>
              <textarea
                id="background-desc"
                value={backgroundDescription}
                onChange={(e) => setBackgroundDescription(e.target.value)}
                placeholder="e.g., a futuristic cityscape at night with neon signs"
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors h-20 resize-none"
                rows={2}
              />
            </div>
             <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full flex items-center justify-center gap-3 text-lg font-semibold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transform hover:scale-105 shadow-indigo-500/30 shadow-lg"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  합성 중...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-6 h-6" />
                  Synthesize Image
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="lg:w-1/2 w-full flex flex-col items-center justify-center p-6 bg-gray-800/50 rounded-2xl border border-gray-700 shadow-lg min-h-[400px] lg:min-h-0">
            <h2 className="text-2xl font-bold text-center text-purple-400 mb-4">Generated Image</h2>
            <div className="w-full h-full aspect-square bg-gray-900/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
              {isLoading && (
                <div className="text-center text-gray-400">
                  <svg className="animate-spin mx-auto h-10 w-10 text-indigo-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="font-semibold">AI가 마법을 부리고 있습니다...</p>
                  <p className="text-sm">잠시만 기다려 주세요.</p>
                </div>
              )}
              {error && (
                <div className="text-center text-red-400 p-4">
                  <p className="font-bold">생성 실패</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}
              {!isLoading && !error && generatedImage && (
                <img src={`data:image/png;base64,${generatedImage}`} alt="Synthesized result" className="object-contain w-full h-full rounded-md" />
              )}
               {!isLoading && !error && !generatedImage && (
                <p className="text-gray-500 p-4 text-center">합성된 이미지가 여기에 표시됩니다.</p>
              )}
            </div>
            {generatedImage && !isLoading && (
              <div className="mt-6 w-full flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => handleDownload('png')}
                  className="flex-1 flex items-center justify-center gap-3 text-lg font-semibold py-3 px-6 rounded-lg transition-colors duration-300 ease-in-out bg-green-600 text-white hover:bg-green-500"
                >
                  <DownloadIcon className="w-6 h-6" />
                  Download PNG
                </button>
                <button
                  onClick={() => handleDownload('jpeg')}
                  className="flex-1 flex items-center justify-center gap-3 text-lg font-semibold py-3 px-6 rounded-lg transition-colors duration-300 ease-in-out bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  <DownloadIcon className="w-6 h-6" />
                  Download JPG
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
       {modalImageUrl && (
        <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 cursor-zoom-out"
            onClick={() => setModalImageUrl(null)}
        >
            <img
                src={modalImageUrl}
                alt="Enlarged preview"
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()} 
            />
            <button
                className="absolute top-4 right-4 text-white rounded-full bg-black/50 p-2 hover:bg-black/80 transition-opacity"
                aria-label="Close image preview"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
        </div>
      )}
    </div>
  );
};

export default App;
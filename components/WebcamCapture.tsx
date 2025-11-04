import React, { useRef, useEffect, useState } from 'react';
import { CameraIcon } from './icons';

interface WebcamCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const start = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (!mounted) return;
        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          // mute to allow autoplay in some browsers
          videoRef.current.muted = true;
          try {
            await videoRef.current.play();
            setIsVideoReady(true);
            setError(null);
          } catch (playErr) {
            // play may fail silently depending on browser autoplay policy; rely on canplay event
            console.warn('Video play failed:', playErr);
          }
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
        setError('Could not access the camera. Please check permissions and try again.');

        // fallback to any camera if environment facing is not available
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (!mounted) return;
          streamRef.current = mediaStream;
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.muted = true;
            try {
              await videoRef.current.play();
              setIsVideoReady(true);
              setError(null);
            } catch (_) {
              // ignore
            }
          }
        } catch (fallbackErr) {
          console.error('Fallback camera access failed:', fallbackErr);
          setError('Could not access any camera. Please ensure it is not in use by another application.');
        }
      }
    };

    start();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // mark video ready when it can play
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handler = () => setIsVideoReady(true);
    video.addEventListener('canplay', handler);
    return () => video.removeEventListener('canplay', handler);
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth || video.clientWidth;
    const height = video.videoHeight || video.clientHeight;
    if (width === 0 || height === 0) {
      setError('Video not ready to capture. Please wait a moment and try again.');
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        onClose();
      } else {
        setError('Failed to capture image.');
      }
    }, 'image/jpeg');
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col items-center">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Webcam Capture</h2>
      {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</p>}
      <div className="w-full max-w-md border-2 border-gray-300 rounded-lg overflow-hidden relative bg-black">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto" />
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="mt-6 flex gap-4">
        <button
          onClick={handleCapture}
          disabled={!isVideoReady || !!error}
          className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <CameraIcon />
          Capture
        </button>
        <button
          onClick={() => {
            // stop stream immediately when closing
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((t) => t.stop());
              streamRef.current = null;
            }
            onClose();
          }}
          className="px-6 py-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FaceCapturePage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    // Auto-start camera when component mounts
    startCamera();
    
    // Cleanup on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      setCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please check your permissions and allow camera access.');
      setCameraActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current && cameraActive) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      const imageData = canvasRef.current.toDataURL('image/jpeg');
      setCapturedImage(imageData);
      
      // Stop camera
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
        setCameraActive(false);
      }
    } else {
      setError('Camera is not active. Please refresh and try again.');
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleSubmit = async () => {
    if (!capturedImage) {
      setError('Please capture a photo first');
      return;
    }

    setUploading(true);
    
    const blob = await (await fetch(capturedImage)).blob();
    const formData = new FormData();
    formData.append('faceImage', blob, 'face.jpg');

    // Add userId from registration step
    const tempUserId = localStorage.getItem('tempUserId');
    if (tempUserId) {
      formData.append('userId', tempUserId);
    }

    try {
      const response = await fetch('/api/auth/upload-face', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        router.push('/register/success');
      } else {
        const data = await response.json();
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/zenzap-logo-icon.png" alt="ZENZAP" className="h-8 w-8" />
            <span className="text-white font-bold">ZENZAP</span>
            <span className="text-orange-400 text-xs">by ZEUSTECH</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-2xl">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
            <div>
              <h1 className="text-xl font-bold text-white">Face Capture</h1>
              <p className="text-gray-300 text-sm">Step 3 of 3</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mb-6">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          </div>

          <div className="space-y-6">
            {!capturedImage ? (
              <div>
                <div className="relative bg-black/30 rounded-lg overflow-hidden min-h-[300px] flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ minHeight: '300px' }}
                  />
                  {!cameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                      <button
                        onClick={startCamera}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition"
                      >
                        📷 Start Camera
                      </button>
                    </div>
                  )}
                </div>
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                
                <button
                  onClick={captureImage}
                  disabled={!cameraActive}
                  className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                >
                  Capture Photo
                </button>
              </div>
            ) : (
              <div>
                <img src={capturedImage} alt="Captured face" className="w-full rounded-lg" />
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={retakePhoto}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-lg transition"
                  >
                    Retake Photo
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={uploading}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {uploading ? 'Submitting...' : 'Complete Registration'}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">🔒 Why we need this</h3>
              <p className="text-gray-400 text-sm">Your face photo is used to verify your identity and prevent account takeover. This data is encrypted and only visible to our verification team.</p>
            </div>

            <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/30">
              <div className="flex gap-3">
                <div className="text-2xl">🛡️</div>
                <div>
                  <h3 className="text-white font-semibold">Protecting your business</h3>
                  <p className="text-gray-300 text-sm">Face verification prevents unauthorized access and ensures only verified business owners use our platform.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function IDUploadPage() {
  const router = useRouter();
  const [idFile, setIdFile] = useState<File | null>(null);
  const [registrationData, setRegistrationData] = useState<any>({});

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('registrationData') || '{}');
    setRegistrationData(data);
  }, []);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (PNG, JPG, JPEG)');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setIdFile(file);
      setIdPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!idFile) {
      setError('Please select an ID/Passport image to upload');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('idDocument', idFile);

    // Add userId from registration step
    const tempUserId = localStorage.getItem('tempUserId');
    if (tempUserId) {
      formData.append('userId', tempUserId);
    }

    try {
      const response = await fetch('/api/auth/upload-id', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        router.push('/register/face-capture');
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
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
            <div>
              <h1 className="text-xl font-bold text-white">ID / Passport Verification</h1>
              <p className="text-gray-300 text-sm">Step 2 of 3</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
              {idPreview ? (
                <div>
                  <img src={idPreview} alt="ID Preview" className="max-h-64 mx-auto rounded-lg mb-4" />
                  <button
                    onClick={() => {
                      setIdFile(null);
                      setIdPreview(null);
                    }}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove and re-upload
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="id-upload"
                  />
                  <label htmlFor="id-upload" className="cursor-pointer">
                    <div className="text-5xl mb-3">📄</div>
                    <p className="text-white">Click to upload ID/Passport</p>
                    <p className="text-gray-400 text-sm mt-2">PNG, JPG, JPEG (Max 5MB)</p>
                  </label>
                </>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Why we need this</h3>
              <p className="text-gray-400 text-sm">We verify your identity to prevent fraud and ensure only legitimate businesses use our platform. Your document is encrypted and securely stored.</p>
            </div>

            <div className="bg-white/5 rounded-lg p-4 mt-6">
              <div className="flex gap-3">
                <div className="text-2xl">🔒</div>
                <div>
                  <h3 className="text-white font-semibold">Your security is our priority</h3>
                  <p className="text-gray-400 text-sm">All documents are encrypted and only accessible to our verification team. We never share your personal information with third parties.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-4">
              <Link
                href="/register"
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-lg transition text-center"
              >
                Back
              </Link>
              <button
                onClick={handleSubmit}
                disabled={!idFile || uploading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Continue →'}
              </button>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6 flex justify-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <div className="w-3 h-3 bg-white/30 rounded-full"></div>
          <div className="w-3 h-3 bg-white/30 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
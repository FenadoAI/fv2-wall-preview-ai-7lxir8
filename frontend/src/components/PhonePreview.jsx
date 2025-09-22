import React from 'react';
import { Loader2 } from 'lucide-react';

export const PhonePreview = ({ phoneType, wallpaperUrl, isLoading }) => {
  const getPhoneFrame = () => {
    const baseClasses = "relative mx-auto";
    const screenClasses = "absolute overflow-hidden bg-black flex items-center justify-center";

    switch (phoneType) {
      case 'iphone':
        return {
          frameClass: `${baseClasses} w-64 h-[520px]`,
          frameStyle: {
            background: 'linear-gradient(145deg, #e2e8f0, #cbd5e1)',
            borderRadius: '36px',
            border: '8px solid #1e293b',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          },
          screenClass: `${screenClasses} top-6 left-6 right-6 bottom-6`,
          screenStyle: {
            borderRadius: '28px',
          },
          notchClass: "absolute top-2 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-10",
        };
      case 'android':
        return {
          frameClass: `${baseClasses} w-64 h-[520px]`,
          frameStyle: {
            background: 'linear-gradient(145deg, #374151, #1f2937)',
            borderRadius: '24px',
            border: '6px solid #111827',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          },
          screenClass: `${screenClasses} top-4 left-4 right-4 bottom-4`,
          screenStyle: {
            borderRadius: '18px',
          },
          notchClass: null,
        };
      case 'pixel':
        return {
          frameClass: `${baseClasses} w-64 h-[520px]`,
          frameStyle: {
            background: 'linear-gradient(145deg, #f3f4f6, #d1d5db)',
            borderRadius: '32px',
            border: '7px solid #374151',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          },
          screenClass: `${screenClasses} top-5 left-5 right-5 bottom-5`,
          screenStyle: {
            borderRadius: '25px',
          },
          notchClass: "absolute top-1 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-black rounded-full z-10",
        };
      default:
        return {
          frameClass: `${baseClasses} w-64 h-[520px]`,
          frameStyle: {
            background: 'linear-gradient(145deg, #e2e8f0, #cbd5e1)',
            borderRadius: '36px',
            border: '8px solid #1e293b',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          },
          screenClass: `${screenClasses} top-6 left-6 right-6 bottom-6`,
          screenStyle: {
            borderRadius: '28px',
          },
          notchClass: "absolute top-2 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-10",
        };
    }
  };

  const phoneConfig = getPhoneFrame();

  return (
    <div className="flex justify-center py-8">
      <div className={phoneConfig.frameClass} style={phoneConfig.frameStyle}>
        {/* Notch or camera cutout */}
        {phoneConfig.notchClass && (
          <div className={phoneConfig.notchClass}></div>
        )}

        {/* Screen */}
        <div className={phoneConfig.screenClass} style={phoneConfig.screenStyle}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center text-white">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p className="text-sm opacity-75">Generating...</p>
            </div>
          ) : wallpaperUrl ? (
            <img
              src={wallpaperUrl}
              alt="Generated wallpaper"
              className="w-full h-full object-cover"
              style={{ borderRadius: phoneConfig.screenStyle.borderRadius }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 p-4 text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-sm">Your wallpaper preview will appear here</p>
            </div>
          )}
        </div>

        {/* Home indicator (for iPhone) */}
        {phoneType === 'iphone' && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full opacity-50"></div>
        )}

        {/* Power button */}
        <div
          className="absolute bg-gray-600 rounded"
          style={{
            right: '-4px',
            top: phoneType === 'iphone' ? '100px' : '80px',
            width: '4px',
            height: phoneType === 'android' ? '40px' : '60px',
          }}
        ></div>

        {/* Volume buttons */}
        <div
          className="absolute bg-gray-600 rounded"
          style={{
            left: '-4px',
            top: phoneType === 'iphone' ? '120px' : '100px',
            width: '4px',
            height: '30px',
          }}
        ></div>
        <div
          className="absolute bg-gray-600 rounded"
          style={{
            left: '-4px',
            top: phoneType === 'iphone' ? '160px' : '140px',
            width: '4px',
            height: '30px',
          }}
        ></div>
      </div>
    </div>
  );
};
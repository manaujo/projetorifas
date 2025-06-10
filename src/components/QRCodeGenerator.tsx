import React from 'react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  value,
  size = 200,
  className = ''
}) => {
  // Using QR Server API for QR code generation
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;

  return (
    <div className={`flex justify-center ${className}`}>
      <img
        src={qrCodeUrl}
        alt="QR Code"
        className="border border-gray-200 rounded-lg"
        width={size}
        height={size}
      />
    </div>
  );
};
import React from 'react';
import { X, Copy, Facebook, Share2 } from 'lucide-react';
import { Button } from './ui/Button';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, url, title }) => {
  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      // You can add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-display font-semibold text-lg text-gray-900">
            Compartilhar
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex flex-col space-y-3">
            {'share' in navigator && (
              <Button
                fullWidth
                variant="outline"
                leftIcon={<Share2 size={18} />}
                onClick={handleNativeShare}
              >
                Compartilhar
              </Button>
            )}
            
            <Button
              fullWidth
              variant="outline"
              leftIcon={
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
                  alt="WhatsApp"
                  className="w-5 h-5"
                />
              }
              onClick={handleWhatsAppShare}
            >
              WhatsApp
            </Button>
            
            <Button
              fullWidth
              variant="outline"
              leftIcon={<Facebook size={18} className="text-[#1877F2]" />}
              onClick={handleFacebookShare}
            >
              Facebook
            </Button>
            
            <Button
              fullWidth
              variant="outline"
              leftIcon={<Copy size={18} />}
              onClick={handleCopyLink}
            >
              Copiar Link
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
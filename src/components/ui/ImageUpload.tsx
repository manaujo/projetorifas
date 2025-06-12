import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';
import { toast } from 'react-hot-toast';
import { UploadService } from '../../services/api/uploadService';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  label?: string;
  error?: string;
  type: 'rifa' | 'campanha';
  userId: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  currentImage,
  label = "Imagem",
  error,
  type,
  userId
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar arquivo
    const validation = UploadService.validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Arquivo inválido');
      return;
    }

    try {
      setIsUploading(true);

      // Upload da imagem
      let imageUrl: string;
      if (type === 'rifa') {
        imageUrl = await UploadService.uploadRifaImage(file, userId);
      } else {
        imageUrl = await UploadService.uploadCampanhaImage(file, userId);
      }

      setPreview(imageUrl);
      onImageUploaded(imageUrl);
      toast.success('Imagem carregada com sucesso!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao carregar imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (preview && preview !== currentImage) {
      try {
        const bucket = type === 'rifa' ? 'rifas_fotos' : 'campanhas_fotos';
        await UploadService.deleteImage(preview, bucket);
      } catch (error) {
        console.error('Erro ao deletar imagem:', error);
      }
    }

    setPreview(null);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="space-y-4">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={isUploading}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Clique para fazer upload da imagem
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, WebP até 5MB
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<Upload size={16} />}
            onClick={() => fileInputRef.current?.click()}
            isLoading={isUploading}
            disabled={isUploading}
          >
            {preview ? 'Trocar Imagem' : 'Selecionar Imagem'}
          </Button>
        </div>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
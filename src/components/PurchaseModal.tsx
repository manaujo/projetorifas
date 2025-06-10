import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Copy, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { toast } from 'react-hot-toast';

const purchaseSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string()
    .min(11, 'CPF deve ter 11 dígitos')
    .max(14, 'CPF inválido')
    .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, 'CPF inválido'),
  phone: z.string()
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato: (11) 99999-9999'),
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNumbers: number[];
  totalPrice: number;
  pixKey: string;
  itemTitle: string;
  onConfirmPurchase: (buyerInfo: { name: string; cpf: string; phone: string }) => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  selectedNumbers,
  totalPrice,
  pixKey,
  itemTitle,
  onConfirmPurchase,
}) => {
  const [step, setStep] = useState<'form' | 'payment'>('form');
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
  });

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const onSubmit = (data: PurchaseFormData) => {
    setStep('payment');
  };

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      toast.success('Chave PIX copiada!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Erro ao copiar chave PIX');
    }
  };

  const handleConfirmPayment = () => {
    const formData = new FormData(document.querySelector('form') as HTMLFormElement);
    const buyerInfo = {
      name: formData.get('name') as string,
      cpf: formData.get('cpf') as string,
      phone: formData.get('phone') as string,
    };
    
    onConfirmPurchase(buyerInfo);
    handleClose();
  };

  const handleClose = () => {
    setStep('form');
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="font-display font-semibold text-lg text-gray-900">
            {step === 'form' ? 'Finalizar Compra' : 'Pagamento via PIX'}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">{itemTitle}</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Números selecionados:</span>
                  <span className="font-medium">{selectedNumbers.length}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {selectedNumbers.slice(0, 10).map(num => (
                    <span key={num} className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs">
                      {num}
                    </span>
                  ))}
                  {selectedNumbers.length > 10 && (
                    <span className="text-xs text-gray-500">
                      +{selectedNumbers.length - 10} mais
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className="font-bold text-lg text-primary-600">
                    R$ {totalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Nome completo"
                placeholder="Seu nome completo"
                error={errors.name?.message}
                {...register('name')}
              />

              <Input
                label="CPF"
                placeholder="000.000.000-00"
                error={errors.cpf?.message}
                {...register('cpf', {
                  onChange: (e) => {
                    e.target.value = formatCPF(e.target.value);
                  }
                })}
              />

              <Input
                label="Telefone"
                placeholder="(11) 99999-9999"
                error={errors.phone?.message}
                {...register('phone', {
                  onChange: (e) => {
                    e.target.value = formatPhone(e.target.value);
                  }
                })}
              />
            </div>

            <div className="mt-6 flex space-x-3">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button type="submit" fullWidth>
                Continuar
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/PIX_logo.svg/512px-PIX_logo.svg.png" 
                  alt="PIX" 
                  className="w-8 h-8"
                />
              </div>
              <h4 className="font-semibold text-lg text-gray-900 mb-2">
                Pagamento via PIX
              </h4>
              <p className="text-gray-600 text-sm">
                Copie a chave PIX abaixo e faça o pagamento no seu banco
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Valor a pagar:</span>
                <span className="font-bold text-xl text-primary-600">
                  R$ {totalPrice.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chave PIX:
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={pixKey}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
                />
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="px-4 py-2 bg-primary-500 text-white rounded-r-md hover:bg-primary-600 transition-colors flex items-center"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-6">
              <h5 className="font-medium text-warning-800 mb-2">Instruções:</h5>
              <ol className="text-sm text-warning-700 space-y-1">
                <li>1. Copie a chave PIX acima</li>
                <li>2. Abra o app do seu banco</li>
                <li>3. Escolha a opção PIX</li>
                <li>4. Cole a chave e faça o pagamento</li>
                <li>5. Guarde o comprovante</li>
              </ol>
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                fullWidth
                onClick={handleConfirmPayment}
              >
                Confirmar Pagamento
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Copy, Check, CreditCard } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { QRCodeGenerator } from './QRCodeGenerator';
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
  isCombo?: boolean;
  comboInfo?: {
    baseValue: number;
    numbersPerValue: number;
  };
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  selectedNumbers,
  totalPrice,
  pixKey,
  itemTitle,
  onConfirmPurchase,
  isCombo = false,
  comboInfo,
}) => {
  const [step, setStep] = useState<'form' | 'payment'>('form');
  const [copied, setCopied] = useState(false);
  const [buyerData, setBuyerData] = useState<PurchaseFormData | null>(null);

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
    setBuyerData(data);
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
    if (buyerData) {
      onConfirmPurchase(buyerData);
      handleClose();
    }
  };

  const handleClose = () => {
    setStep('form');
    setBuyerData(null);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  // Generate PIX payload for QR Code
  const pixPayload = `00020126580014br.gov.bcb.pix0136${pixKey}52040000530398654${totalPrice.toFixed(2).padStart(10, '0')}5802BR5925${itemTitle.substring(0, 25)}6009SAO PAULO62070503***6304`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
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
              <div className="bg-gradient-to-r from-primary-50 to-gold-50 p-4 rounded-xl border border-primary-200">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Bilhetes selecionados:</span>
                    <span className="font-medium text-primary-600">{selectedNumbers.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Valor por bilhete:</span>
                    <span className="font-medium">R$ {(totalPrice / selectedNumbers.length).toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="border-t border-primary-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total a pagar:</span>
                      <span className="font-bold text-xl text-primary-600">
                        R$ {totalPrice.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
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
                <CreditCard className="w-8 h-8 text-primary-500" />
              </div>
              <h4 className="font-semibold text-lg text-gray-900 mb-2">
                Pagamento via PIX
              </h4>
              <p className="text-gray-600 text-sm">
                Escaneie o QR Code ou copie a chave PIX para fazer o pagamento
              </p>
            </div>

            <div className="bg-gradient-to-r from-primary-50 to-gold-50 p-4 rounded-xl mb-6 border border-primary-200">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600">Valor a pagar:</div>
                  <div className="text-2xl font-bold text-primary-600">
                    R$ {totalPrice.toFixed(2).replace('.', ',')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Bilhetes:</div>
                  <div className="text-xl font-bold text-gray-900">
                    {selectedNumbers.length}
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="mb-6">
              <QRCodeGenerator value={pixPayload} size={200} className="mb-4" />
              <p className="text-center text-sm text-gray-600">
                Escaneie o QR Code com o app do seu banco
              </p>
            </div>

            {/* PIX Key */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ou copie a chave PIX:
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

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <h5 className="font-medium text-blue-800 mb-2">📋 Instruções de Pagamento:</h5>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Abra o app do seu banco</li>
                <li>Escolha a opção PIX</li>
                <li>Escaneie o QR Code ou cole a chave PIX</li>
                <li>Confirme o valor: R$ {totalPrice.toFixed(2).replace('.', ',')}</li>
                <li>Finalize o pagamento</li>
                <li>Guarde o comprovante</li>
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
                className="bg-success-500 hover:bg-success-600"
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
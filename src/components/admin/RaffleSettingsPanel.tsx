import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { 
  Settings, 
  Save, 
  DollarSign, 
  Hash, 
  Calendar, 
  Shield,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { RaffleSettings } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { getRaffleSettings, updateRaffleSettings, getUserRaffleIds } from '../../services/purchaseService';

const settingsSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  description: z.string().min(20, 'Descrição deve ter pelo menos 20 caracteres'),
  price: z.number().min(0.01, 'Preço deve ser maior que 0'),
  maxTicketsPerPurchase: z.number().min(1, 'Mínimo 1 bilhete').max(100, 'Máximo 100 bilhetes'),
  autoApprove: z.boolean(),
  pixKey: z.string().min(1, 'Chave PIX é obrigatória'),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface RaffleSettingsPanelProps {
  userId: string;
}

export const RaffleSettingsPanel: React.FC<RaffleSettingsPanelProps> = ({ userId }) => {
  const [selectedRaffleId, setSelectedRaffleId] = useState<string>('');
  const [raffleIds, setRaffleIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    const fetchRaffleIds = async () => {
      try {
        const ids = await getUserRaffleIds(userId);
        setRaffleIds(ids);
        if (ids.length > 0) {
          setSelectedRaffleId(ids[0]);
        }
      } catch (error) {
        console.error('Failed to fetch raffle IDs:', error);
        toast.error('Erro ao carregar rifas');
      }
    };

    fetchRaffleIds();
  }, [userId]);

  useEffect(() => {
    if (selectedRaffleId) {
      loadRaffleSettings();
    }
  }, [selectedRaffleId]);

  const loadRaffleSettings = async () => {
    if (!selectedRaffleId) return;

    setIsLoading(true);
    try {
      const settings = await getRaffleSettings(selectedRaffleId);
      if (settings) {
        reset({
          title: settings.title,
          description: settings.description,
          price: settings.price,
          maxTicketsPerPurchase: settings.maxTicketsPerPurchase,
          autoApprove: settings.autoApprove,
          pixKey: settings.pixKey || '',
        });
      }
    } catch (error) {
      console.error('Failed to load raffle settings:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SettingsFormData) => {
    if (!selectedRaffleId) return;

    setIsSaving(true);
    try {
      await updateRaffleSettings(selectedRaffleId, data);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  if (raffleIds.length === 0) {
    return (
      <div className="text-center py-12">
        <Settings size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma rifa encontrada
        </h3>
        <p className="text-gray-600">
          Você precisa criar uma rifa antes de configurá-la.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Raffle Selector */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <h3 className="font-display font-semibold text-lg text-gray-900 mb-4 flex items-center">
          <Settings className="mr-2" size={20} />
          Configurações da Rifa
        </h3>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecionar Rifa
          </label>
          <select
            value={selectedRaffleId}
            onChange={(e) => setSelectedRaffleId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {raffleIds.map((id) => (
              <option key={id} value={id}>
                Rifa {id.slice(-8)}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Settings */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                <Hash className="mr-2" size={16} />
                Informações Básicas
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Título da Rifa"
                  error={errors.title?.message}
                  {...register('title')}
                />

                <Input
                  type="number"
                  step="0.01"
                  label="Preço por Bilhete (R$)"
                  error={errors.price?.message}
                  {...register('price', { valueAsNumber: true })}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  className={`w-full px-4 py-2 border rounded-md shadow-sm text-sm
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                    ${errors.description ? 'border-error-500' : 'border-gray-300'}`}
                  rows={3}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>

            {/* Purchase Settings */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                <Shield className="mr-2" size={16} />
                Configurações de Compra
              </h4>
              
              <div className="space-y-4">
                <Input
                  type="number"
                  label="Máximo de Bilhetes por Compra"
                  error={errors.maxTicketsPerPurchase?.message}
                  {...register('maxTicketsPerPurchase', { valueAsNumber: true })}
                />

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoApprove"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    {...register('autoApprove')}
                  />
                  <label htmlFor="autoApprove" className="ml-2 block text-sm text-gray-900">
                    <div className="flex items-center">
                      <Zap size={16} className="mr-1 text-primary-500" />
                      Aprovar compras automaticamente
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Quando ativado, as compras serão aprovadas automaticamente sem necessidade de revisão manual.
                    </p>
                  </label>
                </div>
              </div>
            </div>

            {/* Payment Settings */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                <DollarSign className="mr-2" size={16} />
                Configurações de Pagamento
              </h4>
              
              <Input
                label="Chave PIX"
                placeholder="Ex: seu@email.com, 11999999999 ou chave aleatória"
                error={errors.pixKey?.message}
                helperText="Esta chave será exibida aos compradores para pagamento"
                {...register('pixKey')}
              />
            </div>

            {/* Warning */}
            <div className="bg-warning-50 border border-warning-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-warning-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-warning-800">
                    Atenção
                  </h3>
                  <div className="mt-2 text-sm text-warning-700">
                    <p>
                      Algumas configurações podem afetar compras já realizadas. 
                      Certifique-se de revisar todas as alterações antes de salvar.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                leftIcon={<Save size={16} />}
                isLoading={isSaving}
                disabled={isSaving}
              >
                Salvar Configurações
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
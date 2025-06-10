import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Camera, DollarSign, Hash, AlertTriangle, Save, Eye, Megaphone, Gift } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { createCampaign } from '../services/campaignService';

const createCampaignSchema = z.object({
  title: z.string()
    .min(5, 'O título deve ter pelo menos 5 caracteres')
    .max(100, 'O título deve ter no máximo 100 caracteres'),
  description: z.string()
    .min(20, 'A descrição deve ter pelo menos 20 caracteres')
    .max(500, 'A descrição deve ter no máximo 500 caracteres'),
  ticketPrice: z.number()
    .min(1, 'O valor mínimo é R$ 1,00')
    .max(1000, 'O valor máximo é R$ 1.000,00'),
  totalTickets: z.number()
    .min(10, 'Mínimo de 10 bilhetes')
    .max(100000, 'Máximo de 100.000 bilhetes'),
  coverImage: z.string().url('URL da imagem inválida'),
  featured: z.boolean().default(false),
  mode: z.enum(['simple', 'combo']).default('simple'),
  comboBuy: z.number().optional(),
  comboGet: z.number().optional(),
  status: z.enum(['draft', 'active']).default('draft'),
});

type CreateCampaignFormData = z.infer<typeof createCampaignSchema>;

export const CreateCampaignPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateCampaignFormData>({
    resolver: zodResolver(createCampaignSchema),
    mode: 'onChange',
    defaultValues: {
      status: 'draft',
      featured: false,
      mode: 'simple',
    }
  });

  const formValues = watch();
  const isComboMode = watch('mode') === 'combo';

  const onSubmit = async (data: CreateCampaignFormData) => {
    if (!user || user.role !== 'admin') {
      toast.error('Apenas administradores podem criar campanhas');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const campaignData = {
        title: data.title,
        description: data.description,
        coverImage: data.coverImage,
        totalTickets: data.totalTickets,
        ticketPrice: data.ticketPrice,
        featured: data.featured,
        status: 'active' as const,
        mode: data.mode,
        comboRules: data.mode === 'combo' && data.comboBuy && data.comboGet ? {
          buy: data.comboBuy,
          get: data.comboGet,
        } : undefined,
        createdBy: user.id,
      };

      const newCampaign = await createCampaign(campaignData);
      toast.success('Campanha criada com sucesso!');
      navigate(`/campanhas/${newCampaign.id}`);
    } catch (error) {
      toast.error('Erro ao criar campanha. Tente novamente.');
      console.error('Failed to create campaign:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsDraft = async () => {
    if (!user || user.role !== 'admin') {
      toast.error('Apenas administradores podem criar campanhas');
      return;
    }

    const formData = watch();
    try {
      setIsSubmitting(true);
      
      const campaignData = {
        title: formData.title,
        description: formData.description,
        coverImage: formData.coverImage,
        totalTickets: formData.totalTickets,
        ticketPrice: formData.ticketPrice,
        featured: formData.featured,
        status: 'draft' as const,
        mode: formData.mode,
        comboRules: formData.mode === 'combo' && formData.comboBuy && formData.comboGet ? {
          buy: formData.comboBuy,
          get: formData.comboGet,
        } : undefined,
        createdBy: user.id,
      };

      const newCampaign = await createCampaign(campaignData);
      toast.success('Rascunho salvo com sucesso!');
      navigate(`/campanhas/${newCampaign.id}`);
    } catch (error) {
      toast.error('Erro ao salvar rascunho. Tente novamente.');
      console.error('Failed to save draft:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-lg shadow-card p-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-warning-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Acesso Restrito
              </h2>
              <p className="text-gray-600 mb-4">
                Apenas administradores podem criar campanhas.
              </p>
              <Button onClick={() => navigate('/campanhas')}>
                Ver Campanhas Disponíveis
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center mb-6">
              <Megaphone className="text-primary-500 mr-3" size={32} />
              <div>
                <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-900">
                  Criar Nova Campanha
                </h1>
                <p className="text-gray-600">
                  Configure uma campanha promocional com múltiplos prêmios
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-card p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h2 className="font-display font-semibold text-xl text-gray-900 mb-4 flex items-center">
                    <Camera className="mr-2" size={20} />
                    Informações Básicas
                  </h2>
                  
                  <div className="space-y-4">
                    <Input
                      label="Título da Campanha"
                      placeholder="Ex: Mega Campanha de Natal"
                      error={errors.title?.message}
                      {...register('title')}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição
                      </label>
                      <textarea
                        className={`w-full px-4 py-2 border rounded-md shadow-sm text-sm
                          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                          ${errors.description ? 'border-error-500' : 'border-gray-300'}`}
                        rows={4}
                        placeholder="Descreva os detalhes da sua campanha..."
                        {...register('description')}
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-error-500">
                          {errors.description.message}
                        </p>
                      )}
                    </div>

                    <Input
                      label="URL da Imagem de Capa"
                      placeholder="https://exemplo.com/imagem.jpg"
                      error={errors.coverImage?.message}
                      {...register('coverImage')}
                    />
                  </div>
                </div>

                {/* Campaign Settings */}
                <div>
                  <h2 className="font-display font-semibold text-xl text-gray-900 mb-4 flex items-center">
                    <DollarSign className="mr-2" size={20} />
                    Configurações da Campanha
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                      type="number"
                      label="Valor por Bilhete (R$)"
                      placeholder="10.00"
                      error={errors.ticketPrice?.message}
                      {...register('ticketPrice', { valueAsNumber: true })}
                    />

                    <Input
                      type="number"
                      label="Quantidade de Bilhetes"
                      placeholder="1000"
                      error={errors.totalTickets?.message}
                      {...register('totalTickets', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Modo da Campanha
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            value="simple"
                            className="mr-3"
                            {...register('mode')}
                          />
                          <div>
                            <div className="font-medium">Simples</div>
                            <div className="text-sm text-gray-500">Compra individual de bilhetes</div>
                          </div>
                        </label>
                        <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            value="combo"
                            className="mr-3"
                            {...register('mode')}
                          />
                          <div>
                            <div className="font-medium">Combo</div>
                            <div className="text-sm text-gray-500">Compre X e ganhe Y bilhetes</div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {isComboMode && (
                      <div className="bg-primary-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-3">Configurações do Combo</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            type="number"
                            label="Compre (quantidade)"
                            placeholder="5"
                            error={errors.comboBuy?.message}
                            {...register('comboBuy', { valueAsNumber: true })}
                          />
                          <Input
                            type="number"
                            label="Ganhe (quantidade)"
                            placeholder="1"
                            error={errors.comboGet?.message}
                            {...register('comboGet', { valueAsNumber: true })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Options */}
                <div>
                  <h2 className="font-display font-semibold text-xl text-gray-900 mb-4 flex items-center">
                    <Gift className="mr-2" size={20} />
                    Opções Adicionais
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="featured"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        {...register('featured')}
                      />
                      <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                        Destacar esta campanha na página inicial
                      </label>
                    </div>
                  </div>
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
                          Após criar a campanha, alguns dados não poderão ser alterados, como o número de bilhetes e o valor.
                          Verifique todas as informações antes de prosseguir.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    leftIcon={<Eye size={16} />}
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    {previewMode ? 'Editar' : 'Pré-visualizar'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    leftIcon={<Save size={16} />}
                    onClick={handleSaveAsDraft}
                    disabled={isSubmitting}
                  >
                    Salvar Rascunho
                  </Button>
                  
                  <Button
                    type="submit"
                    leftIcon={<Megaphone size={16} />}
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Criar Campanha
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};
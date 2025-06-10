import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Camera, DollarSign, Hash, AlertTriangle, Save, Eye, Megaphone, Gift, Plus, Trash2, CreditCard, Target, Percent } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ImageUpload } from '../components/ui/ImageUpload';
import { useAuth } from '../contexts/AuthContext';
import { hasActivePlan } from '../services/authService';
import { createCampaign } from '../services/campaignService';

const prizeSchema = z.object({
  title: z.string().min(3, 'Título do prêmio deve ter pelo menos 3 caracteres'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  imageUrl: z.string().optional(),
  type: z.enum(['main', 'biggest_buyer', 'winning_ticket']),
});

const promotionSchema = z.object({
  quantity: z.number().min(1, 'Quantidade deve ser maior que 0'),
  price: z.number().min(0.01, 'Preço deve ser maior que 0'),
});

const createCampaignSchema = z.object({
  title: z.string()
    .min(5, 'O título deve ter pelo menos 5 caracteres')
    .max(100, 'O título deve ter no máximo 100 caracteres'),
  description: z.string()
    .min(20, 'A descrição deve ter pelo menos 20 caracteres')
    .max(500, 'A descrição deve ter no máximo 500 caracteres'),
  ticketPrice: z.number()
    .min(0.01, 'O valor mínimo é R$ 0,01')
    .max(1000, 'O valor máximo é R$ 1.000,00'),
  totalTickets: z.number()
    .min(10, 'Mínimo de 10 bilhetes')
    .max(1000000, 'Máximo de 1.000.000 bilhetes'),
  coverImage: z.string().min(1, 'Imagem é obrigatória'),
  pixKey: z.string()
    .min(1, 'Chave PIX é obrigatória')
    .max(77, 'Chave PIX inválida'),
  featured: z.boolean().default(false),
  mode: z.enum(['simple', 'combo']).default('simple'),
  comboBaseValue: z.number().optional(),
  comboNumbersPerValue: z.number().optional(),
  winningTicket: z.string()
    .min(6, 'Bilhete premiado deve ter 6 dígitos')
    .max(6, 'Bilhete premiado deve ter 6 dígitos')
    .regex(/^\d{6}$/, 'Bilhete premiado deve conter apenas números'),
  prizes: z.array(prizeSchema).min(1, 'Adicione pelo menos um prêmio'),
  promotions: z.array(promotionSchema).optional(),
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
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateCampaignFormData>({
    resolver: zodResolver(createCampaignSchema),
    mode: 'onChange',
    defaultValues: {
      featured: false,
      mode: 'simple',
      coverImage: '',
      winningTicket: '',
      prizes: [{ 
        title: '', 
        description: '', 
        imageUrl: '', 
        type: 'main' 
      }],
      promotions: [
        { quantity: 10, price: 0 },
        { quantity: 20, price: 0 },
        { quantity: 50, price: 0 },
      ],
    }
  });

  const { fields: prizeFields, append: appendPrize, remove: removePrize } = useFieldArray({
    control,
    name: 'prizes',
  });

  const { fields: promotionFields, append: appendPromotion, remove: removePromotion } = useFieldArray({
    control,
    name: 'promotions',
  });

  const formValues = watch();
  const isComboMode = watch('mode') === 'combo';

  // Check if user has permission to create campaigns
  if (!user || (!hasActivePlan(user) && user.role !== 'admin')) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-lg shadow-card p-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-warning-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Plano Necessário
              </h2>
              <p className="text-gray-600 mb-4">
                Para criar campanhas, você precisa de um plano ativo.
              </p>
              <div className="space-y-3">
                <Button onClick={() => navigate('/precos')} fullWidth>
                  Ver Planos
                </Button>
                <Button variant="outline" onClick={() => navigate('/campanhas')} fullWidth>
                  Ver Campanhas Disponíveis
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const generateRandomTicket = () => {
    const randomTicket = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    setValue('winningTicket', randomTicket);
  };

  const calculatePromotionSavings = (quantity: number, price: number) => {
    const regularPrice = quantity * (formValues.ticketPrice || 0);
    return regularPrice - price;
  };

  const onSubmit = async (data: CreateCampaignFormData) => {
    try {
      setIsSubmitting(true);
      
      console.log('Dados da campanha:', data); // Debug
      
      const campaignData = {
        title: data.title,
        description: data.description,
        coverImage: data.coverImage,
        totalTickets: data.totalTickets,
        ticketPrice: data.ticketPrice,
        featured: data.featured,
        status: 'active' as const,
        mode: data.mode,
        comboRules: data.mode === 'combo' && data.comboBaseValue && data.comboNumbersPerValue ? {
          baseValue: data.comboBaseValue,
          numbersPerValue: data.comboNumbersPerValue,
        } : undefined,
        prizes: data.prizes.map((prize, index) => ({
          id: `prize-${index + 1}`,
          title: prize.title,
          description: prize.description,
          imageUrl: prize.imageUrl || '',
          position: index + 1,
          type: prize.type,
        })),
        promotions: data.promotions?.map((promo, index) => ({
          id: `promo-${index + 1}`,
          quantity: promo.quantity,
          price: promo.price,
        })) || [],
        winningTicket: data.winningTicket,
        createdBy: user.id,
        pixKey: data.pixKey,
      };

      console.log('Payload final:', campaignData); // Debug

      const newCampaign = await createCampaign(campaignData);
      
      console.log('Campanha criada:', newCampaign); // Debug
      
      toast.success('Campanha criada com sucesso!');
      navigate(`/campanhas/${newCampaign.id}`);
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
      toast.error('Erro ao criar campanha. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsDraft = async () => {
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
        comboRules: formData.mode === 'combo' && formData.comboBaseValue && formData.comboNumbersPerValue ? {
          baseValue: formData.comboBaseValue,
          numbersPerValue: formData.comboNumbersPerValue,
        } : undefined,
        prizes: formData.prizes.map((prize, index) => ({
          id: `prize-${index + 1}`,
          title: prize.title,
          description: prize.description,
          imageUrl: prize.imageUrl || '',
          position: index + 1,
          type: prize.type,
        })),
        promotions: formData.promotions?.map((promo, index) => ({
          id: `promo-${index + 1}`,
          quantity: promo.quantity,
          price: promo.price,
        })) || [],
        winningTicket: formData.winningTicket,
        createdBy: user.id,
        pixKey: formData.pixKey,
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
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
                  Configure uma campanha promocional com múltiplos prêmios e promoções
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-card p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information */}
                <div>
                  <h2 className="font-display font-semibold text-xl text-gray-900 mb-4 flex items-center">
                    <Camera className="mr-2" size={20} />
                    Informações Básicas
                  </h2>
                  
                  <div className="space-y-4">
                    <Input
                      label="Título da Campanha"
                      placeholder="Ex: VW T‑CROSS TSI COMFORTLINE 2022 OU R$ 115.000,00 NO PIX"
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

                    <ImageUpload
                      label="Imagem de Capa"
                      onImageUploaded={(url) => setValue('coverImage', url)}
                      currentImage={formValues.coverImage}
                      error={errors.coverImage?.message}
                    />
                  </div>
                </div>

                {/* Campaign Settings */}
                <div>
                  <h2 className="font-display font-semibold text-xl text-gray-900 mb-4 flex items-center">
                    <DollarSign className="mr-2" size={20} />
                    Configurações da Campanha
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Input
                      type="number"
                      step="0.01"
                      label="Valor por Bilhete (R$)"
                      placeholder="2.50"
                      error={errors.ticketPrice?.message}
                      {...register('ticketPrice', { valueAsNumber: true })}
                    />

                    <Input
                      type="number"
                      label="Quantidade de Bilhetes"
                      placeholder="100000"
                      error={errors.totalTickets?.message}
                      {...register('totalTickets', { valueAsNumber: true })}
                    />
                  </div>

                  {/* Winning Ticket */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bilhete Premiado
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="000000"
                        maxLength={6}
                        error={errors.winningTicket?.message}
                        {...register('winningTicket')}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateRandomTicket}
                        leftIcon={<Target size={16} />}
                      >
                        Gerar Aleatório
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Número de 6 dígitos que será o bilhete premiado especial
                    </p>
                  </div>
                </div>

                {/* Promotions Section */}
                <div>
                  <h2 className="font-display font-semibold text-xl text-gray-900 mb-4 flex items-center">
                    <Percent className="mr-2" size={20} />
                    Promoções de Bilhetes
                  </h2>
                  
                  <div className="space-y-4">
                    {promotionFields.map((field, index) => (
                      <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-900">Promoção {index + 1}</h4>
                          {promotionFields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removePromotion(index)}
                              leftIcon={<Trash2 size={16} />}
                            >
                              Remover
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Input
                            type="number"
                            label="Quantidade de Bilhetes"
                            placeholder="10"
                            error={errors.promotions?.[index]?.quantity?.message}
                            {...register(`promotions.${index}.quantity`, { valueAsNumber: true })}
                          />
                          
                          <Input
                            type="number"
                            step="0.01"
                            label="Preço Total (R$)"
                            placeholder="19.50"
                            error={errors.promotions?.[index]?.price?.message}
                            {...register(`promotions.${index}.price`, { valueAsNumber: true })}
                          />

                          <div className="flex items-end">
                            <div className="text-sm">
                              <div className="text-gray-600">Economia:</div>
                              <div className="font-bold text-success-600">
                                R$ {calculatePromotionSavings(
                                  formValues.promotions?.[index]?.quantity || 0,
                                  formValues.promotions?.[index]?.price || 0
                                ).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      leftIcon={<Plus size={16} />}
                      onClick={() => appendPromotion({ quantity: 0, price: 0 })}
                    >
                      Adicionar Promoção
                    </Button>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h2 className="font-display font-semibold text-xl text-gray-900 mb-4 flex items-center">
                    <CreditCard className="mr-2" size={20} />
                    Informações de Pagamento
                  </h2>
                  
                  <Input
                    label="Chave PIX"
                    placeholder="Ex: seu@email.com, 11999999999 ou chave aleatória"
                    error={errors.pixKey?.message}
                    helperText="Esta chave será exibida aos compradores para pagamento"
                    {...register('pixKey')}
                  />
                </div>

                {/* Prizes Section */}
                <div>
                  <h2 className="font-display font-semibold text-xl text-gray-900 mb-4 flex items-center">
                    <Gift className="mr-2" size={20} />
                    Prêmios da Campanha
                  </h2>
                  
                  <div className="space-y-4">
                    {prizeFields.map((field, index) => (
                      <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-900">
                            {index === 0 ? '1º Prêmio (Principal)' : 
                             index === 1 ? '2º Prêmio (Maior Comprador)' : 
                             `${index + 1}º Prêmio`}
                          </h4>
                          {prizeFields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removePrize(index)}
                              leftIcon={<Trash2 size={16} />}
                            >
                              Remover
                            </Button>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              label="Título do Prêmio"
                              placeholder="Ex: VW T-Cross 2022 OU R$ 115.000,00 no PIX"
                              error={errors.prizes?.[index]?.title?.message}
                              {...register(`prizes.${index}.title`)}
                            />
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo do Prêmio
                              </label>
                              <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                {...register(`prizes.${index}.type`)}
                              >
                                <option value="main">Prêmio Principal</option>
                                <option value="biggest_buyer">Maior Comprador</option>
                                <option value="winning_ticket">Bilhete Premiado</option>
                              </select>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Descrição do Prêmio
                            </label>
                            <textarea
                              className={`w-full px-4 py-2 border rounded-md shadow-sm text-sm
                                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                                ${errors.prizes?.[index]?.description ? 'border-error-500' : 'border-gray-300'}`}
                              rows={3}
                              placeholder="Descreva o prêmio em detalhes..."
                              {...register(`prizes.${index}.description`)}
                            />
                            {errors.prizes?.[index]?.description && (
                              <p className="mt-1 text-sm text-error-500">
                                {errors.prizes[index]?.description?.message}
                              </p>
                            )}
                          </div>

                          <ImageUpload
                            label="Imagem do Prêmio (opcional)"
                            onImageUploaded={(url) => setValue(`prizes.${index}.imageUrl`, url)}
                            currentImage={formValues.prizes?.[index]?.imageUrl}
                            error={errors.prizes?.[index]?.imageUrl?.message}
                          />
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      leftIcon={<Plus size={16} />}
                      onClick={() => appendPrize({ 
                        title: '', 
                        description: '', 
                        imageUrl: '', 
                        type: 'main' 
                      })}
                    >
                      Adicionar Prêmio
                    </Button>
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
                          Após criar a campanha, alguns dados não poderão ser alterados, como o número de bilhetes, valor e bilhete premiado.
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
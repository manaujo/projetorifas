import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Camera, Calendar, DollarSign, Hash, AlertTriangle, Save, Eye, CreditCard } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ImageUpload } from '../components/ui/ImageUpload';
import { useAuth } from '../contexts/AuthContext';
import { createRaffle } from '../services/raffleService';

const createRaffleSchema = z.object({
  title: z.string()
    .min(5, 'O título deve ter pelo menos 5 caracteres')
    .max(100, 'O título deve ter no máximo 100 caracteres'),
  description: z.string()
    .min(20, 'A descrição deve ter pelo menos 20 caracteres')
    .max(500, 'A descrição deve ter no máximo 500 caracteres'),
  price: z.number()
    .min(1, 'O valor mínimo é R$ 1,00')
    .max(1000, 'O valor máximo é R$ 1.000,00'),
  totalNumbers: z.number()
    .min(10, 'Mínimo de 10 números')
    .max(10000, 'Máximo de 10.000 números'),
  drawDate: z.string()
    .refine((date) => new Date(date) > new Date(), {
      message: 'A data do sorteio deve ser no futuro',
    }),
  isCharity: z.boolean().default(false),
  imageUrl: z.string().min(1, 'Imagem é obrigatória'),
  pixKey: z.string()
    .min(1, 'Chave PIX é obrigatória')
    .max(77, 'Chave PIX inválida'),
  status: z.enum(['draft', 'active']).default('draft'),
});

type CreateRaffleFormData = z.infer<typeof createRaffleSchema>;

export const CreateRafflePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateRaffleFormData>({
    resolver: zodResolver(createRaffleSchema),
    mode: 'onChange',
    defaultValues: {
      status: 'draft',
      isCharity: false,
      imageUrl: '',
    }
  });

  const formValues = watch();

  const onSubmit = async (data: CreateRaffleFormData) => {
    if (!user) return;

    try {
      setIsSubmitting(true);
      const newRaffle = await createRaffle({
        ...data,
        createdBy: user.id,
        status: 'active', // Always create as active
      });

      toast.success('Rifa criada com sucesso!');
      navigate(`/rifas/${newRaffle.id}`);
    } catch (error) {
      toast.error('Erro ao criar rifa. Tente novamente.');
      console.error('Failed to create raffle:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsDraft = async () => {
    if (!user) return;

    const formData = watch();
    try {
      setIsSubmitting(true);
      const newRaffle = await createRaffle({
        ...formData,
        createdBy: user.id,
        status: 'draft',
      });

      toast.success('Rascunho salvo com sucesso!');
      navigate(`/rifas/${newRaffle.id}`);
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
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-900 mb-2">
              Criar Nova Rifa
            </h1>
            <p className="text-gray-600 mb-8">
              Preencha os dados abaixo para criar sua campanha
            </p>

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
                      label="Título da Rifa"
                      placeholder="Ex: iPhone 15 Pro Max"
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
                        placeholder="Descreva os detalhes da sua rifa..."
                        {...register('description')}
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-error-500">
                          {errors.description.message}
                        </p>
                      )}
                    </div>

                    <ImageUpload
                      label="Imagem da Rifa"
                      onImageUploaded={(url) => setValue('imageUrl', url)}
                      currentImage={formValues.imageUrl}
                      error={errors.imageUrl?.message}
                    />
                  </div>
                </div>

                {/* Pricing and Numbers */}
                <div>
                  <h2 className="font-display font-semibold text-xl text-gray-900 mb-4 flex items-center">
                    <DollarSign className="mr-2" size={20} />
                    Preços e Números
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="number"
                      label="Valor por Número (R$)"
                      placeholder="10.00"
                      error={errors.price?.message}
                      {...register('price', { valueAsNumber: true })}
                    />

                    <Input
                      type="number"
                      label="Quantidade de Números"
                      placeholder="100"
                      error={errors.totalNumbers?.message}
                      {...register('totalNumbers', { valueAsNumber: true })}
                    />
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

                {/* Schedule */}
                <div>
                  <h2 className="font-display font-semibold text-xl text-gray-900 mb-4 flex items-center">
                    <Calendar className="mr-2" size={20} />
                    Agendamento
                  </h2>
                  
                  <Input
                    type="datetime-local"
                    label="Data do Sorteio"
                    error={errors.drawDate?.message}
                    {...register('drawDate')}
                  />
                </div>

                {/* Additional Options */}
                <div>
                  <h2 className="font-display font-semibold text-xl text-gray-900 mb-4">
                    Opções Adicionais
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isCharity"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        {...register('isCharity')}
                      />
                      <label htmlFor="isCharity" className="ml-2 block text-sm text-gray-900">
                        Esta é uma rifa beneficente
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
                          Após criar a rifa, alguns dados não poderão ser alterados, como o número de bilhetes e o valor.
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
                    leftIcon={<Save size={16} />}
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Criar Rifa
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
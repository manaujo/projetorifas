import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Camera, DollarSign, Hash, AlertTriangle, Save, Eye, CreditCard } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ImageUpload } from '../components/ui/ImageUpload';
import { useAuth } from '../contexts/AuthContext';
import { RifaService } from '../services/api/rifaService';
import { UserService } from '../services/api/userService';

const createRaffleSchema = z.object({
  titulo: z.string()
    .min(5, 'O título deve ter pelo menos 5 caracteres')
    .max(100, 'O título deve ter no máximo 100 caracteres'),
  descricao: z.string()
    .min(20, 'A descrição deve ter pelo menos 20 caracteres')
    .max(500, 'A descrição deve ter no máximo 500 caracteres'),
  valor_bilhete: z.number()
    .min(1, 'O valor mínimo é R$ 1,00')
    .max(1000, 'O valor máximo é R$ 1.000,00'),
  quantidade_bilhetes: z.number()
    .min(10, 'Mínimo de 10 bilhetes')
    .max(1000000, 'Máximo de 1.000.000 bilhetes'),
  chave_pix: z.string()
    .min(1, 'Chave PIX é obrigatória')
    .max(77, 'Chave PIX inválida'),
  imagem_url: z.string().min(1, 'Imagem é obrigatória'),
});

type CreateRaffleFormData = z.infer<typeof createRaffleSchema>;

export const CreateRafflePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, hasPlan } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [planLimits, setPlanLimits] = useState<any>(null);
  
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
      imagem_url: '',
      chave_pix: profile?.chave_pix || '',
    }
  });

  const formValues = watch();

  // Verificar se o usuário pode criar rifas
  React.useEffect(() => {
    const checkLimits = async () => {
      if (user) {
        try {
          const limits = await UserService.checkPlanLimits(user.id);
          setPlanLimits(limits);
          
          if (!limits.canCreateRifa) {
            toast.error('Você atingiu o limite de rifas do seu plano');
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Erro ao verificar limites:', error);
        }
      }
    };

    if (user && hasPlan) {
      checkLimits();
    }
  }, [user, hasPlan, navigate]);

  // Verificar se o usuário tem plano
  if (!user || !hasPlan) {
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
                Para criar rifas, você precisa de um plano ativo.
              </p>
              <div className="space-y-3">
                <Button onClick={() => navigate('/precos')} fullWidth>
                  Ver Planos
                </Button>
                <Button variant="outline" onClick={() => navigate('/rifas')} fullWidth>
                  Ver Rifas Disponíveis
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const onSubmit = async (data: CreateRaffleFormData) => {
    if (!user) return;

    try {
      setIsSubmitting(true);
      
      const newRaffle = await RifaService.createRifa({
        ...data,
        criador_id: user.id,
        status: 'ativa',
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-900 mb-2">
                Criar Nova Rifa
              </h1>
              <p className="text-gray-600">
                Preencha os dados abaixo para criar sua rifa
              </p>
              
              {planLimits && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Plano {profile?.plano}:</strong> {planLimits.rifasRestantes} rifas restantes, 
                    máximo {planLimits.maxBilhetes.toLocaleString()} bilhetes por rifa
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-card p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Informações Básicas */}
                <div>
                  <h2 className="font-display font-semibold text-xl text-gray-900 mb-4 flex items-center">
                    <Camera className="mr-2" size={20} />
                    Informações Básicas
                  </h2>
                  
                  <div className="space-y-4">
                    <Input
                      label="Título da Rifa"
                      placeholder="Ex: iPhone 15 Pro Max"
                      error={errors.titulo?.message}
                      {...register('titulo')}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição
                      </label>
                      <textarea
                        className={`w-full px-4 py-2 border rounded-md shadow-sm text-sm
                          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                          ${errors.descricao ? 'border-error-500' : 'border-gray-300'}`}
                        rows={4}
                        placeholder="Descreva os detalhes da sua rifa..."
                        {...register('descricao')}
                      />
                      {errors.descricao && (
                        <p className="mt-1 text-sm text-error-500">
                          {errors.descricao.message}
                        </p>
                      )}
                    </div>

                    {user && (
                      <ImageUpload
                        label="Imagem da Rifa"
                        onImageUploaded={(url) => setValue('imagem_url', url)}
                        currentImage={formValues.imagem_url}
                        error={errors.imagem_url?.message}
                        type="rifa"
                        userId={user.id}
                      />
                    )}
                  </div>
                </div>

                {/* Configurações */}
                <div>
                  <h2 className="font-display font-semibold text-xl text-gray-900 mb-4 flex items-center">
                    <DollarSign className="mr-2" size={20} />
                    Configurações
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="number"
                      step="0.01"
                      label="Valor por Bilhete (R$)"
                      placeholder="10.00"
                      error={errors.valor_bilhete?.message}
                      {...register('valor_bilhete', { valueAsNumber: true })}
                    />

                    <Input
                      type="number"
                      label="Quantidade de Bilhetes"
                      placeholder="100"
                      error={errors.quantidade_bilhetes?.message}
                      {...register('quantidade_bilhetes', { valueAsNumber: true })}
                      helperText={planLimits ? `Máximo: ${planLimits.maxBilhetes.toLocaleString()}` : undefined}
                    />
                  </div>
                </div>

                {/* Pagamento */}
                <div>
                  <h2 className="font-display font-semibold text-xl text-gray-900 mb-4 flex items-center">
                    <CreditCard className="mr-2" size={20} />
                    Informações de Pagamento
                  </h2>
                  
                  <Input
                    label="Chave PIX"
                    placeholder="Ex: seu@email.com, 11999999999 ou chave aleatória"
                    error={errors.chave_pix?.message}
                    helperText="Esta chave será exibida aos compradores para pagamento"
                    {...register('chave_pix')}
                  />
                </div>

                {/* Aviso */}
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

                {/* Ações */}
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancelar
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
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Camera, DollarSign, Hash, AlertTriangle, Save, Eye, Megaphone, CreditCard, Star } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ImageUpload } from '../components/ui/ImageUpload';
import { useAuth } from '../contexts/AuthContext';
import { CampanhaService } from '../services/api/campanhaService';
import { UserService } from '../services/api/userService';

const createCampaignSchema = z.object({
  titulo: z.string()
    .min(5, 'O título deve ter pelo menos 5 caracteres')
    .max(100, 'O título deve ter no máximo 100 caracteres'),
  descricao: z.string()
    .min(20, 'A descrição deve ter pelo menos 20 caracteres')
    .max(500, 'A descrição deve ter no máximo 500 caracteres'),
  preco_por_bilhete: z.number()
    .min(0.01, 'O valor mínimo é R$ 0,01')
    .max(1000, 'O valor máximo é R$ 1.000,00'),
  quantidade_bilhetes: z.number()
    .min(10, 'Mínimo de 10 bilhetes')
    .max(1000000, 'Máximo de 1.000.000 bilhetes'),
  modo: z.enum(['simples', 'combo']),
  combo_valor: z.number().optional(),
  combo_bilhetes: z.number().optional(),
  chave_pix: z.string()
    .min(1, 'Chave PIX é obrigatória')
    .max(77, 'Chave PIX inválida'),
  imagem_url: z.string().min(1, 'Imagem é obrigatória'),
  destaque: z.boolean().default(false),
}).refine((data) => {
  if (data.modo === 'combo') {
    return data.combo_valor && data.combo_bilhetes;
  }
  return true;
}, {
  message: 'Para modo combo, defina valor e quantidade de bilhetes',
  path: ['combo_valor'],
});

type CreateCampaignFormData = z.infer<typeof createCampaignSchema>;

export const CreateCampaignPage: React.FC = () => {
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
  } = useForm<CreateCampaignFormData>({
    resolver: zodResolver(createCampaignSchema),
    mode: 'onChange',
    defaultValues: {
      imagem_url: '',
      chave_pix: profile?.chave_pix || '',
      modo: 'simples',
      destaque: false,
    }
  });

  const formValues = watch();
  const isComboMode = watch('modo') === 'combo';

  // Verificar se o usuário pode criar campanhas
  React.useEffect(() => {
    const checkLimits = async () => {
      if (user) {
        try {
          const limits = await UserService.checkPlanLimits(user.id);
          setPlanLimits(limits);
          
          if (!limits.canCreateCampanha) {
            toast.error('Você atingiu o limite de campanhas do seu plano');
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

  const onSubmit = async (data: CreateCampaignFormData) => {
    if (!user) return;

    try {
      setIsSubmitting(true);
      
      const campanhaData = {
        titulo: data.titulo,
        descricao: data.descricao,
        preco_por_bilhete: data.preco_por_bilhete,
        quantidade_bilhetes: data.quantidade_bilhetes,
        modo: data.modo,
        regra_combo: data.modo === 'combo' ? {
          valor: data.combo_valor,
          bilhetes: data.combo_bilhetes,
        } : null,
        chave_pix: data.chave_pix,
        imagem_url: data.imagem_url,
        destaque: data.destaque,
        criador_id: user.id,
        status: 'ativa' as const,
      };

      const newCampaign = await CampanhaService.createCampanha(campanhaData);

      toast.success('Campanha criada com sucesso!');
      navigate(`/campanhas/${newCampaign.id}`);
    } catch (error) {
      toast.error('Erro ao criar campanha. Tente novamente.');
      console.error('Failed to create campaign:', error);
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
              <div className="flex items-center mb-4">
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
              
              {planLimits && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Plano {profile?.plano}:</strong> {planLimits.campanhasRestantes} campanhas restantes, 
                    máximo {planLimits.maxBilhetes.toLocaleString()} bilhetes por campanha
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
                      label="Título da Campanha"
                      placeholder="Ex: VW T‑CROSS TSI COMFORTLINE 2022 OU R$ 115.000,00 NO PIX"
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
                        placeholder="Descreva os detalhes da sua campanha..."
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
                        label="Imagem de Capa"
                        onImageUploaded={(url) => setValue('imagem_url', url)}
                        currentImage={formValues.imagem_url}
                        error={errors.imagem_url?.message}
                        type="campanha"
                        userId={user.id}
                      />
                    )}
                  </div>
                </div>

                {/* Configurações da Campanha */}
                <div>
                  <h2 className="font-display font-semibold text-xl text-gray-900 mb-4 flex items-center">
                    <DollarSign className="mr-2" size={20} />
                    Configurações da Campanha
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        type="number"
                        step="0.01"
                        label="Valor por Bilhete (R$)"
                        placeholder="2.50"
                        error={errors.preco_por_bilhete?.message}
                        {...register('preco_por_bilhete', { valueAsNumber: true })}
                      />

                      <Input
                        type="number"
                        label="Quantidade de Bilhetes"
                        placeholder="100000"
                        error={errors.quantidade_bilhetes?.message}
                        {...register('quantidade_bilhetes', { valueAsNumber: true })}
                        helperText={planLimits ? `Máximo: ${planLimits.maxBilhetes.toLocaleString()}` : undefined}
                      />
                    </div>

                    {/* Modo da Campanha */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Modo da Campanha
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            value="simples"
                            {...register('modo')}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium">Simples</div>
                            <div className="text-sm text-gray-500">Preço fixo por bilhete</div>
                          </div>
                        </label>
                        
                        <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            value="combo"
                            {...register('modo')}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium">Combo</div>
                            <div className="text-sm text-gray-500">Promoção especial</div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Configurações do Combo */}
                    {isComboMode && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Configurações do Combo</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            type="number"
                            step="0.01"
                            label="Valor do Combo (R$)"
                            placeholder="5.00"
                            error={errors.combo_valor?.message}
                            {...register('combo_valor', { valueAsNumber: true })}
                          />
                          
                          <Input
                            type="number"
                            label="Bilhetes no Combo"
                            placeholder="20"
                            error={errors.combo_bilhetes?.message}
                            {...register('combo_bilhetes', { valueAsNumber: true })}
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Ex: R$ 5,00 = 20 bilhetes (economia de {formValues.combo_bilhetes && formValues.combo_valor ? 
                            `R$ ${((formValues.combo_bilhetes * formValues.preco_por_bilhete) - formValues.combo_valor).toFixed(2)}` : 
                            'R$ 0,00'})
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Informações de Pagamento */}
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

                {/* Opções Adicionais */}
                <div>
                  <h2 className="font-display font-semibold text-xl text-gray-900 mb-4 flex items-center">
                    <Star className="mr-2" size={20} />
                    Opções Adicionais
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="destaque"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        {...register('destaque')}
                      />
                      <label htmlFor="destaque" className="ml-2 block text-sm text-gray-900">
                        Destacar esta campanha na página inicial
                      </label>
                    </div>
                  </div>
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
                          Após criar a campanha, alguns dados não poderão ser alterados, como o número de bilhetes e valor.
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
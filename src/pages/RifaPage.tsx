import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Ticket, User, Phone, CreditCard, ShoppingCart } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useRifaPublica } from '../hooks/useRifas';
import { formatCurrency } from '../lib/utils';
import toast from 'react-hot-toast';

const compraSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos'),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
});

type CompraFormData = z.infer<typeof compraSchema>;

export const RifaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { rifa, bilhetes, loading, comprarBilhetes } = useRifaPublica(id!);
  const [numerosSelecionados, setNumerosSelecionados] = useState<number[]>([]);
  const [showCompraForm, setShowCompraForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CompraFormData>({
    resolver: zodResolver(compraSchema),
  });

  const bilhetesDisponiveis = bilhetes.filter(b => b.status === 'disponivel');
  const bilhetesVendidos = bilhetes.filter(b => b.status === 'confirmado');

  const toggleNumero = (numero: number) => {
    const bilhete = bilhetes.find(b => b.numero === numero);
    if (bilhete?.status !== 'disponivel') return;

    setNumerosSelecionados(prev => 
      prev.includes(numero) 
        ? prev.filter(n => n !== numero)
        : [...prev, numero]
    );
  };

  const selecionarAleatorios = (quantidade: number) => {
    const disponiveisShuffled = [...bilhetesDisponiveis]
      .sort(() => Math.random() - 0.5)
      .slice(0, quantidade);
    
    setNumerosSelecionados(disponiveisShuffled.map(b => b.numero));
  };

  const onSubmit = async (data: CompraFormData) => {
    try {
      await comprarBilhetes(numerosSelecionados, data);
      toast.success('Compra realizada! Aguarde a validação do pagamento.');
      setNumerosSelecionados([]);
      setShowCompraForm(false);
      reset();
    } catch (error) {
      toast.error('Erro ao realizar compra');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-10 gap-2">
              {[...Array(50)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!rifa) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Rifa não encontrada</h1>
          </div>
        </div>
      </Layout>
    );
  }

  const totalSelecionado = numerosSelecionados.length * rifa.valor_bilhete;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Informações da Rifa */}
          <div className="lg:col-span-2">
            <Card>
              {rifa.imagem_url && (
                <img 
                  src={rifa.imagem_url} 
                  alt={rifa.nome}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{rifa.nome}</h1>
              <p className="text-gray-600 mb-6">{rifa.descricao}</p>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Valor por bilhete</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {formatCurrency(rifa.valor_bilhete)}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Bilhetes disponíveis</div>
                  <div className="text-2xl font-bold text-green-700">
                    {bilhetesDisponiveis.length}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 font-medium">Bilhetes vendidos</div>
                  <div className="text-2xl font-bold text-gray-700">
                    {bilhetesVendidos.length}
                  </div>
                </div>
              </div>

              {/* Seleção Rápida */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Seleção Rápida</h3>
                <div className="flex flex-wrap gap-2">
                  {[1, 5, 10, 20].map(quantidade => (
                    <Button
                      key={quantidade}
                      variant="outline"
                      size="sm"
                      onClick={() => selecionarAleatorios(quantidade)}
                      disabled={bilhetesDisponiveis.length < quantidade}
                    >
                      {quantidade} bilhete{quantidade > 1 ? 's' : ''}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Grid de Números */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Escolha seus números</h3>
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {bilhetes.map((bilhete) => {
                    const isSelected = numerosSelecionados.includes(bilhete.numero);
                    const isDisponivel = bilhete.status === 'disponivel';
                    
                    return (
                      <button
                        key={bilhete.id}
                        onClick={() => toggleNumero(bilhete.numero)}
                        disabled={!isDisponivel}
                        className={`
                          h-12 rounded-lg font-medium text-sm transition-colors
                          ${isSelected 
                            ? 'bg-blue-600 text-white' 
                            : isDisponivel
                              ? 'bg-white border-2 border-gray-200 hover:border-blue-300 text-gray-700'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }
                        `}
                      >
                        {bilhete.numero.toString().padStart(6, '0')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar de Compra */}
          <div>
            <Card className="sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Resumo da Compra</h3>
              
              {numerosSelecionados.length > 0 ? (
                <>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Bilhetes selecionados:</span>
                      <span className="font-medium">{numerosSelecionados.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valor por bilhete:</span>
                      <span className="font-medium">{formatCurrency(rifa.valor_bilhete)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-blue-600">{formatCurrency(totalSelecionado)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">Números selecionados:</div>
                    <div className="flex flex-wrap gap-1">
                      {numerosSelecionados.map(numero => (
                        <span key={numero} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {numero.toString().padStart(6, '0')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {!showCompraForm ? (
                    <Button 
                      className="w-full"
                      onClick={() => setShowCompraForm(true)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Finalizar Compra
                    </Button>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <Input
                        label="Nome completo"
                        placeholder="Seu nome completo"
                        error={errors.nome?.message}
                        {...register('nome')}
                      />
                      
                      <Input
                        label="CPF"
                        placeholder="000.000.000-00"
                        error={errors.cpf?.message}
                        {...register('cpf')}
                      />
                      
                      <Input
                        label="Telefone"
                        placeholder="(11) 99999-9999"
                        error={errors.telefone?.message}
                        {...register('telefone')}
                      />

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="text-sm text-yellow-800">
                          <strong>Chave PIX:</strong> {rifa.user_id}
                        </div>
                        <div className="text-xs text-yellow-600 mt-1">
                          Faça o pagamento e aguarde a validação manual
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowCompraForm(false)}
                          className="flex-1"
                        >
                          Voltar
                        </Button>
                        <Button type="submit" className="flex-1">
                          Confirmar
                        </Button>
                      </div>
                    </form>
                  )}
                </>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Ticket className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Selecione os números para continuar</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Campanha } from '../types';
import { useAuth } from './useAuth';

export const useCampanhas = () => {
  const { user } = useAuth();
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampanhas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('campanhas')
        .select(`
          *,
          rifas (
            id,
            nome,
            valor_bilhete,
            qtd_bilhetes,
            status,
            bilhetes (
              id,
              status
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const campanhasWithStats = data.map(campanha => ({
        ...campanha,
        total_bilhetes: campanha.rifas?.reduce((total: number, rifa: any) => total + rifa.qtd_bilhetes, 0) || 0,
        bilhetes_vendidos: campanha.rifas?.reduce((total: number, rifa: any) => 
          total + (rifa.bilhetes?.filter((b: any) => b.status === 'confirmado').length || 0), 0) || 0,
        total_arrecadado: campanha.rifas?.reduce((total: number, rifa: any) => 
          total + (rifa.bilhetes?.filter((b: any) => b.status === 'confirmado').length || 0) * rifa.valor_bilhete, 0) || 0,
      }));

      setCampanhas(campanhasWithStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar campanhas');
    } finally {
      setLoading(false);
    }
  };

  const createCampanha = async (campanhaData: Partial<Campanha>) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('campanhas')
        .insert({
          ...campanhaData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchCampanhas();
      return data;
    } catch (err) {
      throw err;
    }
  };

  const updateCampanha = async (id: string, updates: Partial<Campanha>) => {
    try {
      const { error } = await supabase
        .from('campanhas')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchCampanhas();
    } catch (err) {
      throw err;
    }
  };

  const deleteCampanha = async (id: string) => {
    try {
      const { error } = await supabase
        .from('campanhas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchCampanhas();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchCampanhas();
  }, []);

  return {
    campanhas,
    loading,
    error,
    fetchCampanhas,
    createCampanha,
    updateCampanha,
    deleteCampanha,
  };
};

export const useCampanhasPublicas = () => {
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampanhasPublicas = async () => {
      try {
        const { data, error } = await supabase
          .from('campanhas')
          .select(`
            *,
            rifas (
              id,
              nome,
              valor_bilhete,
              qtd_bilhetes,
              status,
              bilhetes (
                id,
                status
              )
            )
          `)
          .eq('status', 'ativa')
          .order('destaque', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) throw error;

        const campanhasWithStats = data.map(campanha => ({
          ...campanha,
          total_bilhetes: campanha.rifas?.reduce((total: number, rifa: any) => total + rifa.qtd_bilhetes, 0) || 0,
          bilhetes_vendidos: campanha.rifas?.reduce((total: number, rifa: any) => 
            total + (rifa.bilhetes?.filter((b: any) => b.status === 'confirmado').length || 0), 0) || 0,
        }));

        setCampanhas(campanhasWithStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar campanhas');
      } finally {
        setLoading(false);
      }
    };

    fetchCampanhasPublicas();
  }, []);

  return { campanhas, loading, error };
};
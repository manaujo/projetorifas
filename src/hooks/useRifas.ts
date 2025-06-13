import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Rifa, Bilhete } from '../types';
import { useAuth } from './useAuth';

export const useRifas = () => {
  const { user } = useAuth();
  const [rifas, setRifas] = useState<Rifa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRifas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rifas')
        .select(`
          *,
          bilhetes (
            id,
            numero,
            status,
            comprador_nome,
            cpf,
            telefone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rifasWithStats = data.map(rifa => ({
        ...rifa,
        bilhetes_vendidos: rifa.bilhetes?.filter((b: any) => b.status === 'confirmado').length || 0,
        total_arrecadado: (rifa.bilhetes?.filter((b: any) => b.status === 'confirmado').length || 0) * rifa.valor_bilhete,
      }));

      setRifas(rifasWithStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar rifas');
    } finally {
      setLoading(false);
    }
  };

  const createRifa = async (rifaData: Partial<Rifa>) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      // Generate random winning ticket number
      const bilhete_premiado = Math.floor(Math.random() * rifaData.qtd_bilhetes!) + 1;

      const { data: rifa, error } = await supabase
        .from('rifas')
        .insert({
          ...rifaData,
          user_id: user.id,
          bilhete_premiado,
        })
        .select()
        .single();

      if (error) throw error;

      // Create tickets with random numbers
      const bilhetes = [];
      const usedNumbers = new Set<number>();
      
      for (let i = 0; i < rifaData.qtd_bilhetes!; i++) {
        let numero;
        do {
          numero = Math.floor(Math.random() * 999999) + 1;
        } while (usedNumbers.has(numero));
        
        usedNumbers.add(numero);
        bilhetes.push({
          rifa_id: rifa.id,
          numero,
          status: 'disponivel',
        });
      }

      const { error: bilhetesError } = await supabase
        .from('bilhetes')
        .insert(bilhetes);

      if (bilhetesError) throw bilhetesError;

      await fetchRifas();
      return rifa;
    } catch (err) {
      throw err;
    }
  };

  const updateRifa = async (id: string, updates: Partial<Rifa>) => {
    try {
      const { error } = await supabase
        .from('rifas')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchRifas();
    } catch (err) {
      throw err;
    }
  };

  const deleteRifa = async (id: string) => {
    try {
      const { error } = await supabase
        .from('rifas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchRifas();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchRifas();
  }, []);

  return {
    rifas,
    loading,
    error,
    fetchRifas,
    createRifa,
    updateRifa,
    deleteRifa,
  };
};

export const useRifaPublica = (rifaId: string) => {
  const [rifa, setRifa] = useState<Rifa | null>(null);
  const [bilhetes, setBilhetes] = useState<Bilhete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRifa = async () => {
      try {
        const { data: rifaData, error: rifaError } = await supabase
          .from('rifas')
          .select('*')
          .eq('id', rifaId)
          .single();

        if (rifaError) throw rifaError;

        const { data: bilhetesData, error: bilhetesError } = await supabase
          .from('bilhetes')
          .select('*')
          .eq('rifa_id', rifaId)
          .order('numero');

        if (bilhetesError) throw bilhetesError;

        setRifa(rifaData);
        setBilhetes(bilhetesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar rifa');
      } finally {
        setLoading(false);
      }
    };

    if (rifaId) {
      fetchRifa();
    }
  }, [rifaId]);

  const comprarBilhetes = async (numerosSelecionados: number[], dadosComprador: {
    nome: string;
    cpf: string;
    telefone: string;
  }) => {
    try {
      // Update tickets with buyer info
      const { error } = await supabase
        .from('bilhetes')
        .update({
          comprador_nome: dadosComprador.nome,
          cpf: dadosComprador.cpf,
          telefone: dadosComprador.telefone,
          status: 'pendente',
        })
        .eq('rifa_id', rifaId)
        .in('numero', numerosSelecionados);

      if (error) throw error;

      // Refresh tickets
      const { data: bilhetesData } = await supabase
        .from('bilhetes')
        .select('*')
        .eq('rifa_id', rifaId)
        .order('numero');

      if (bilhetesData) {
        setBilhetes(bilhetesData);
      }
    } catch (err) {
      throw err;
    }
  };

  return {
    rifa,
    bilhetes,
    loading,
    error,
    comprarBilhetes,
  };
};
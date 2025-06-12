import { supabase } from '../../lib/supabase';

export class UploadService {
  // Upload de imagem para rifas
  static async uploadRifaImage(file: File, userId: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('rifas_fotos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('rifas_fotos')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem da rifa:', error);
      throw new Error('Erro ao fazer upload da imagem');
    }
  }

  // Upload de imagem para campanhas
  static async uploadCampanhaImage(file: File, userId: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('campanhas_fotos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('campanhas_fotos')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem da campanha:', error);
      throw new Error('Erro ao fazer upload da imagem');
    }
  }

  // Upload de comprovante de pagamento
  static async uploadComprovante(file: File, pagamentoId: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `comprovantes/${pagamentoId}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('rifas_fotos') // Usando o mesmo bucket
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('rifas_fotos')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload do comprovante:', error);
      throw new Error('Erro ao fazer upload do comprovante');
    }
  }

  // Deletar imagem
  static async deleteImage(url: string, bucket: 'rifas_fotos' | 'campanhas_fotos'): Promise<void> {
    try {
      // Extrair o path da URL
      const urlParts = url.split('/');
      const path = urlParts.slice(-2).join('/'); // userId/filename

      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      throw new Error('Erro ao deletar imagem');
    }
  }

  // Validar arquivo de imagem
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de arquivo não permitido. Use JPG, PNG ou WebP.'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Arquivo muito grande. Máximo 5MB.'
      };
    }

    return { valid: true };
  }
}
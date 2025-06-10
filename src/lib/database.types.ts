export interface Database {
  public: {
    Tables: {
      raffles: {
        Row: {
          id: string;
          title: string;
          description: string;
          price: number;
          total_numbers: number;
          image_url: string;
          draw_date: string;
          status: 'draft' | 'active' | 'completed' | 'cancelled';
          is_charity: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
          pix_key?: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          price: number;
          total_numbers: number;
          image_url: string;
          draw_date: string;
          status?: 'draft' | 'active' | 'completed' | 'cancelled';
          is_charity?: boolean;
          created_by: string;
          pix_key?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          price?: number;
          total_numbers?: number;
          image_url?: string;
          draw_date?: string;
          status?: 'draft' | 'active' | 'completed' | 'cancelled';
          is_charity?: boolean;
          created_by?: string;
          pix_key?: string;
        };
      };
      campaigns: {
        Row: {
          id: string;
          title: string;
          description: string;
          cover_image: string;
          total_tickets: number;
          ticket_price: number;
          featured: boolean;
          status: 'draft' | 'active' | 'paused' | 'completed';
          mode: 'simple' | 'combo';
          combo_rules: any;
          created_by: string;
          created_at: string;
          updated_at: string;
          pix_key?: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          cover_image: string;
          total_tickets: number;
          ticket_price: number;
          featured?: boolean;
          status?: 'draft' | 'active' | 'paused' | 'completed';
          mode?: 'simple' | 'combo';
          combo_rules?: any;
          created_by: string;
          pix_key?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          cover_image?: string;
          total_tickets?: number;
          ticket_price?: number;
          featured?: boolean;
          status?: 'draft' | 'active' | 'paused' | 'completed';
          mode?: 'simple' | 'combo';
          combo_rules?: any;
          created_by?: string;
          pix_key?: string;
        };
      };
    };
  };
}
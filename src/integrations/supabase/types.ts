export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_sessions: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bundle_items: {
        Row: {
          bundle_id: string
          id: string
          product_id: string
          quantity: number
        }
        Insert: {
          bundle_id: string
          id?: string
          product_id: string
          quantity?: number
        }
        Update: {
          bundle_id?: string
          id?: string
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "bundle_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      bundles: {
        Row: {
          bundle_price: number
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          bundle_price: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          bundle_price?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          product_id: string
          quantity: number
          session_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          product_id: string
          quantity?: number
          session_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          product_id?: string
          quantity?: number
          session_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          max_uses: number | null
          min_order: number
          updated_at: string
          used_count: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          description?: string | null
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          min_order?: number
          updated_at?: string
          used_count?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          min_order?: number
          updated_at?: string
          used_count?: number
        }
        Relationships: []
      }
      daily_stats: {
        Row: {
          avg_order_value: number | null
          created_at: string
          date: string
          id: string
          new_customers: number | null
          order_count: number | null
          returning_customers: number | null
          top_products: Json | null
          total_revenue: number | null
        }
        Insert: {
          avg_order_value?: number | null
          created_at?: string
          date: string
          id?: string
          new_customers?: number | null
          order_count?: number | null
          returning_customers?: number | null
          top_products?: Json | null
          total_revenue?: number | null
        }
        Update: {
          avg_order_value?: number | null
          created_at?: string
          date?: string
          id?: string
          new_customers?: number | null
          order_count?: number | null
          returning_customers?: number | null
          top_products?: Json | null
          total_revenue?: number | null
        }
        Relationships: []
      }
      flash_sale_items: {
        Row: {
          created_at: string
          flash_sale_id: string
          id: string
          product_id: string
          sale_price: number
          sold_count: number
          stock_limit: number
        }
        Insert: {
          created_at?: string
          flash_sale_id: string
          id?: string
          product_id: string
          sale_price: number
          sold_count?: number
          stock_limit?: number
        }
        Update: {
          created_at?: string
          flash_sale_id?: string
          id?: string
          product_id?: string
          sale_price?: number
          sold_count?: number
          stock_limit?: number
        }
        Relationships: [
          {
            foreignKeyName: "flash_sale_items_flash_sale_id_fkey"
            columns: ["flash_sale_id"]
            isOneToOne: false
            referencedRelation: "flash_sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flash_sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      flash_sales: {
        Row: {
          banner_url: string | null
          created_at: string
          description: string | null
          ends_at: string
          id: string
          is_active: boolean
          name: string
          starts_at: string
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          ends_at: string
          id?: string
          is_active?: boolean
          name: string
          starts_at: string
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string
          id?: string
          is_active?: boolean
          name?: string
          starts_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      gdrive_backups: {
        Row: {
          created_at: string
          created_by: string | null
          error: string | null
          file_id: string | null
          file_name: string
          file_url: string | null
          id: string
          row_counts: Json
          size_bytes: number | null
          status: string
          tables: Json
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          error?: string | null
          file_id?: string | null
          file_name: string
          file_url?: string | null
          id?: string
          row_counts?: Json
          size_bytes?: number | null
          status?: string
          tables?: Json
        }
        Update: {
          created_at?: string
          created_by?: string | null
          error?: string | null
          file_id?: string | null
          file_name?: string
          file_url?: string | null
          id?: string
          row_counts?: Json
          size_bytes?: number | null
          status?: string
          tables?: Json
        }
        Relationships: []
      }
      gdrive_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      gift_card_redemptions: {
        Row: {
          amount_used: number
          created_at: string
          gift_card_id: string
          id: string
          order_id: string | null
          user_id: string | null
        }
        Insert: {
          amount_used: number
          created_at?: string
          gift_card_id: string
          id?: string
          order_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount_used?: number
          created_at?: string
          gift_card_id?: string
          id?: string
          order_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gift_card_redemptions_gift_card_id_fkey"
            columns: ["gift_card_id"]
            isOneToOne: false
            referencedRelation: "gift_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_cards: {
        Row: {
          balance: number
          code: string
          created_at: string
          expires_at: string | null
          id: string
          initial_amount: number
          message: string | null
          recipient_email: string | null
          recipient_name: string | null
          sender_email: string | null
          sender_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          balance: number
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          initial_amount: number
          message?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          sender_email?: string | null
          sender_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          balance?: number
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          initial_amount?: number
          message?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          sender_email?: string | null
          sender_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          created_at: string
          id: string
          last_restocked_at: string | null
          low_stock_threshold: number | null
          product_id: string
          quantity: number
          reorder_point: number | null
          reorder_quantity: number | null
          reserved_quantity: number
          sales_velocity: number | null
          supplier_contact: string | null
          supplier_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_restocked_at?: string | null
          low_stock_threshold?: number | null
          product_id: string
          quantity?: number
          reorder_point?: number | null
          reorder_quantity?: number | null
          reserved_quantity?: number
          sales_velocity?: number | null
          supplier_contact?: string | null
          supplier_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_restocked_at?: string | null
          low_stock_threshold?: number | null
          product_id?: string
          quantity?: number
          reorder_point?: number | null
          reorder_quantity?: number | null
          reserved_quantity?: number
          sales_velocity?: number | null
          supplier_contact?: string | null
          supplier_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_accounts: {
        Row: {
          birthday: string | null
          created_at: string
          id: string
          lifetime_points: number
          points_balance: number
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          birthday?: string | null
          created_at?: string
          id?: string
          lifetime_points?: number
          points_balance?: number
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          birthday?: string | null
          created_at?: string
          id?: string
          lifetime_points?: number
          points_balance?: number
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          points: number
          reference_id: string | null
          source: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          points: number
          reference_id?: string | null
          source: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          reference_id?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      order_events: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          order_id: string
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          order_id: string
          status: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_image: string | null
          product_name: string
          quantity: number
          sku: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_image?: string | null
          product_name: string
          quantity?: number
          sku?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_image?: string | null
          product_name?: string
          quantity?: number
          sku?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          created_at: string
          currency: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          discount_amount: number | null
          id: string
          metadata: Json | null
          notes: string | null
          order_number: string
          payment_status: string
          shipping_address: Json | null
          shipping_amount: number | null
          status: string
          subtotal: number
          tax_amount: number | null
          total: number
          updated_at: string
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          discount_amount?: number | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_number: string
          payment_status?: string
          shipping_address?: Json | null
          shipping_amount?: number | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          total?: number
          updated_at?: string
        }
        Update: {
          billing_address?: Json | null
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          discount_amount?: number | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_number?: string
          payment_status?: string
          shipping_address?: Json | null
          shipping_amount?: number | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_cash_movements: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          id: string
          movement_type: string
          reason: string | null
          shift_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by: string
          id?: string
          movement_type: string
          reason?: string | null
          shift_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          id?: string
          movement_type?: string
          reason?: string | null
          shift_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_cash_movements_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "pos_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_payments: {
        Row: {
          amount: number
          change_amount: number
          created_at: string
          id: string
          method: string
          ref_no: string | null
          transaction_id: string
        }
        Insert: {
          amount: number
          change_amount?: number
          created_at?: string
          id?: string
          method: string
          ref_no?: string | null
          transaction_id: string
        }
        Update: {
          amount?: number
          change_amount?: number
          created_at?: string
          id?: string
          method?: string
          ref_no?: string | null
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_payments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "pos_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_refunds: {
        Row: {
          amount: number
          approved_by: string
          created_at: string
          id: string
          reason: string | null
          refund_no: string
          transaction_id: string
        }
        Insert: {
          amount: number
          approved_by: string
          created_at?: string
          id?: string
          reason?: string | null
          refund_no: string
          transaction_id: string
        }
        Update: {
          amount?: number
          approved_by?: string
          created_at?: string
          id?: string
          reason?: string | null
          refund_no?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_refunds_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "pos_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_shifts: {
        Row: {
          branch_id: string | null
          cashier_id: string
          closed_at: string | null
          closing_cash_actual: number | null
          closing_cash_expected: number | null
          created_at: string
          id: string
          notes: string | null
          opened_at: string
          opening_cash: number
          status: string
          updated_at: string
          variance: number | null
        }
        Insert: {
          branch_id?: string | null
          cashier_id: string
          closed_at?: string | null
          closing_cash_actual?: number | null
          closing_cash_expected?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          opened_at?: string
          opening_cash?: number
          status?: string
          updated_at?: string
          variance?: number | null
        }
        Update: {
          branch_id?: string | null
          cashier_id?: string
          closed_at?: string | null
          closing_cash_actual?: number | null
          closing_cash_expected?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          opened_at?: string
          opening_cash?: number
          status?: string
          updated_at?: string
          variance?: number | null
        }
        Relationships: []
      }
      pos_transaction_items: {
        Row: {
          created_at: string
          id: string
          line_discount: number
          line_total: number
          name_snapshot: string
          product_id: string | null
          qty: number
          transaction_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          line_discount?: number
          line_total: number
          name_snapshot: string
          product_id?: string | null
          qty: number
          transaction_id: string
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          line_discount?: number
          line_total?: number
          name_snapshot?: string
          product_id?: string | null
          qty?: number
          transaction_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "pos_transaction_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transaction_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "pos_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_transactions: {
        Row: {
          cashier_id: string
          created_at: string
          customer_id: string | null
          discount_total: number
          id: string
          notes: string | null
          receipt_no: string
          shift_id: string
          status: string
          subtotal: number
          total: number
          updated_at: string
          vat_amount: number
        }
        Insert: {
          cashier_id: string
          created_at?: string
          customer_id?: string | null
          discount_total?: number
          id?: string
          notes?: string | null
          receipt_no: string
          shift_id: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          vat_amount?: number
        }
        Update: {
          cashier_id?: string
          created_at?: string
          customer_id?: string | null
          discount_total?: number
          id?: string
          notes?: string | null
          receipt_no?: string
          shift_id?: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          vat_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "pos_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transactions_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "pos_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      product_recommendations: {
        Row: {
          algorithm: string
          product_id: string
          recommended_ids: Json
          updated_at: string
        }
        Insert: {
          algorithm?: string
          product_id: string
          recommended_ids?: Json
          updated_at?: string
        }
        Update: {
          algorithm?: string
          product_id?: string
          recommended_ids?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_recommendations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          ai_generated_data: Json | null
          barcode: string | null
          brand: string | null
          category: string | null
          compare_at_price: number | null
          cost_price: number | null
          created_at: string
          description: string | null
          description_html: string | null
          embedding: string | null
          id: string
          images: Json | null
          is_featured: boolean | null
          name: string
          price: number
          seo_description: string | null
          seo_title: string | null
          sku: string | null
          slug: string
          status: string
          subcategory: string | null
          tags: Json | null
          thumbnail_url: string | null
          updated_at: string
          weight: number | null
          weight_unit: string | null
        }
        Insert: {
          ai_generated_data?: Json | null
          barcode?: string | null
          brand?: string | null
          category?: string | null
          compare_at_price?: number | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          description_html?: string | null
          embedding?: string | null
          id?: string
          images?: Json | null
          is_featured?: boolean | null
          name: string
          price?: number
          seo_description?: string | null
          seo_title?: string | null
          sku?: string | null
          slug: string
          status?: string
          subcategory?: string | null
          tags?: Json | null
          thumbnail_url?: string | null
          updated_at?: string
          weight?: number | null
          weight_unit?: string | null
        }
        Update: {
          ai_generated_data?: Json | null
          barcode?: string | null
          brand?: string | null
          category?: string | null
          compare_at_price?: number | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          description_html?: string | null
          embedding?: string | null
          id?: string
          images?: Json | null
          is_featured?: boolean | null
          name?: string
          price?: number
          seo_description?: string | null
          seo_title?: string | null
          sku?: string | null
          slug?: string
          status?: string
          subcategory?: string | null
          tags?: Json | null
          thumbnail_url?: string | null
          updated_at?: string
          weight?: number | null
          weight_unit?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          preferences: Json | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          preferences?: Json | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          preferences?: Json | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          code: string
          completed_at: string | null
          created_at: string
          id: string
          referred_user_id: string | null
          referrer_id: string
          reward_points: number
          status: string
        }
        Insert: {
          code: string
          completed_at?: string | null
          created_at?: string
          id?: string
          referred_user_id?: string | null
          referrer_id: string
          reward_points?: number
          status?: string
        }
        Update: {
          code?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          referred_user_id?: string | null
          referrer_id?: string
          reward_points?: number
          status?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          ai_auto_reply: string | null
          ai_auto_reply_status: string | null
          ai_sentiment: string | null
          content: string | null
          created_at: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          helpful_count: number | null
          id: string
          is_verified_purchase: boolean | null
          moderation_reason: string | null
          product_id: string
          rating: number
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          ai_auto_reply?: string | null
          ai_auto_reply_status?: string | null
          ai_sentiment?: string | null
          content?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          moderation_reason?: string | null
          product_id: string
          rating: number
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          ai_auto_reply?: string | null
          ai_auto_reply_status?: string | null
          ai_sentiment?: string | null
          content?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          moderation_reason?: string | null
          product_id?: string
          rating?: number
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          notify_on_price_drop: boolean
          notify_on_restock: boolean
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notify_on_price_drop?: boolean
          notify_on_restock?: boolean
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notify_on_price_drop?: boolean
          notify_on_restock?: boolean
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_reviews: {
        Row: {
          content: string | null
          created_at: string | null
          customer_id: string | null
          helpful_count: number | null
          id: string | null
          is_verified_purchase: boolean | null
          product_id: string | null
          rating: number | null
          title: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          customer_id?: string | null
          helpful_count?: number | null
          id?: string | null
          is_verified_purchase?: boolean | null
          product_id?: string | null
          rating?: number | null
          title?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          customer_id?: string | null
          helpful_count?: number | null
          id?: string | null
          is_verified_purchase?: boolean | null
          product_id?: string | null
          rating?: number | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_sales_velocity: {
        Args: { p_product_id: string }
        Returns: number
      }
      generate_order_number: { Args: never; Returns: string }
      generate_pos_receipt_no: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_pos_staff: { Args: { _user_id: string }; Returns: boolean }
      pos_checkout: {
        Args: {
          _customer_id?: string
          _discount_total?: number
          _items: Json
          _notes?: string
          _payments: Json
          _vat_rate?: number
        }
        Returns: Json
      }
      pos_close_shift: {
        Args: { _actual_cash: number; _notes?: string; _shift_id: string }
        Returns: Json
      }
      search_products_by_embedding: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          category: string
          description: string
          id: string
          name: string
          price: number
          similarity: number
          thumbnail_url: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      app_role: "admin" | "moderator" | "cashier" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "cashier", "customer"],
    },
  },
} as const

import { supabase } from './supabaseClient';

export const userService = {
  getUsers: async (search = '') => {
    let query = supabase.from('users').select('*').order('created_at', { ascending: false });
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,department.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  updateUser: async (id, updates) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('user_id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  deleteUser: async (id) => {
    // Note: Depends on RLS policies and FK cascades. 
    // Usually deleting from auth.users via edge function is required to fully delete auth records.
    // For now we just delete from public.users
    const { error } = await supabase.from('users').delete().eq('user_id', id);
    if (error) throw error;
  },

  getUserHistory: async (userId) => {
    const { data, error } = await supabase
      .from('issues')
      .select(`
        *,
        books ( title )
      `)
      .eq('user_id', userId)
      .order('issue_date', { ascending: false });

    if (error) throw error;
    return data;
  }
};

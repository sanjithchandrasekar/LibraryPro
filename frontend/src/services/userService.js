import { supabase } from './supabaseClient';

// Columns returned for user listings — excludes sensitive password field
const USER_COLUMNS = 'user_id, name, email, phone, role, department, roll_no, dob, year, gender, created_at';

export const userService = {
  getUsers: async (search = '') => {
    let query = supabase
      .from('users')
      .select(USER_COLUMNS)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,department.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  addUser: async ({ name, email, phone, role, department }) => {
    // Manually register a user from the admin panel (no Supabase Auth account created)
    const { data, error } = await supabase
      .from('users')
      .insert([{
        name,
        email,
        phone: phone || null,
        role,
        department: department || null,
      }])
      .select(USER_COLUMNS)
      .single();

    if (error) throw error;
    return data;
  },

  updateUser: async (id, updates) => {
    // Strip out any fields that shouldn't be overwritten via the admin form
    const { password, user_id, created_at, ...safeUpdates } = updates;

    const { data, error } = await supabase
      .from('users')
      .update(safeUpdates)
      .eq('user_id', id)
      .select(USER_COLUMNS)
      .single();

    if (error) throw error;
    return data;
  },

  deleteUser: async (id) => {
    // Note: This only removes the public.users record.
    // The corresponding auth.users entry (if any) must be removed via a Supabase Edge Function.
    const { error } = await supabase.from('users').delete().eq('user_id', id);
    if (error) throw error;
  },

  getUserHistory: async (userId) => {
    const { data, error } = await supabase
      .from('issues')
      .select('*, books ( title )')
      .eq('user_id', userId)
      .order('issue_date', { ascending: false });

    if (error) throw error;
    return data;
  },
};

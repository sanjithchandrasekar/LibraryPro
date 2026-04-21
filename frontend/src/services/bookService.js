import { supabase } from './supabaseClient';

export const bookService = {
  getBooks: async (search = '', categoryId = null) => {
    let query = supabase.from('books').select(`*, categories ( category_name )`).order('created_at', { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%,isbn.ilike.%${search}%`);
    }
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  getCategories: async () => {
    const { data, error } = await supabase.from('categories').select('*').order('category_name', { ascending: true });
    if (error) throw error;
    return data;
  },

  addBook: async (book) => {
    const newBookReq = {
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category_id: parseInt(book.category_id),
      total_copies: parseInt(book.total_copies),
      available_copies: parseInt(book.total_copies), // initially available copies = total
    };
    const { data, error } = await supabase.from('books').insert([newBookReq]).select().single();
    if (error) throw error;
    return data;
  },

  updateBook: async (id, updates) => {
    // We need current book data first to properly adjust available copies ratio if total changes
    const { data: oldBook, error: fetchError } = await supabase.from('books').select('*').eq('book_id', id).single();
    if (fetchError) throw fetchError;

    const oldTotal = oldBook.total_copies;
    const oldAvail = oldBook.available_copies;
    const newTotal = updates.total_copies ? parseInt(updates.total_copies) : oldTotal;
    const issued = oldTotal - oldAvail;
    const newAvail = Math.max(0, newTotal - issued);

    const updatedData = {
      ...updates,
      category_id: updates.category_id ? parseInt(updates.category_id) : oldBook.category_id,
      total_copies: newTotal,
      available_copies: newAvail
    };

    const { data, error } = await supabase.from('books').update(updatedData).eq('book_id', id).select().single();
    if (error) throw error;
    return data;
  },

  deleteBook: async (id) => {
    const { error } = await supabase.from('books').delete().eq('book_id', id);
    if (error) throw error;
  },

  getBookStats: async () => {
    const { data, error } = await supabase.from('books').select('available_copies, total_copies');
    if (error) throw error;
    
    const availableBooks = data.reduce((sum, b) => sum + b.available_copies, 0);
    const totalCopies = data.reduce((sum, b) => sum + b.total_copies, 0);
    
    return { totalBooks: data.length, availableBooks, totalCopies };
  }
};

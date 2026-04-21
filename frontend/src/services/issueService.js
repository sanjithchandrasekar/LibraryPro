import { supabase } from './supabaseClient';
import { bookService } from './bookService';
import { addDays, format, differenceInDays } from 'date-fns';

export const issueService = {
  getIssues: async (status = null) => {
    let query = supabase
      .from('issues')
      .select(`
        *,
        users ( name ),
        books ( title )
      `)
      .order('issue_date', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  issueBook: async ({ userId, bookId }) => {
    // 1. Check Availability
    const { data: book, error: bookError } = await supabase.from('books').select('title, available_copies').eq('book_id', bookId).single();
    if (bookError || !book || book.available_copies <= 0) {
      throw new Error('Book Not Available — no copies left in stock.');
    }

    const issueDate = new Date();
    const dueDate = addDays(issueDate, 7);
    
    // 2. Insert Issue
    const newIssue = {
      user_id: userId,
      book_id: bookId,
      issue_date: format(issueDate, 'yyyy-MM-dd'),
      due_date: format(dueDate, 'yyyy-MM-dd'),
      status: 'Issued',
      fine_amount: 0
    };

    const { data, error } = await supabase.from('issues').insert([newIssue]).select().single();
    if (error) throw error;

    // 3. Decrement Book Copies
    await supabase.from('books').update({ available_copies: book.available_copies - 1 }).eq('book_id', bookId);

    return data;
  },

  returnBook: async (issueId) => {
    const { data: issue, error: fetchError } = await supabase.from('issues').select('*').eq('issue_id', issueId).single();
    if (fetchError || !issue) throw new Error('Issue record not found');

    const returnDate = new Date();
    const dueDate = new Date(issue.due_date);
    
    const diffDays = differenceInDays(returnDate, dueDate);
    const fine = diffDays > 0 ? diffDays * 10 : 0; 
    
    // 1. Update Issue
    const { error: updateError } = await supabase.from('issues').update({
      return_date: format(returnDate, 'yyyy-MM-dd'),
      status: 'Returned',
      fine_amount: fine
    }).eq('issue_id', issueId);
    
    if (updateError) throw updateError;
    
    // 2. Increment Book Copies
    const { data: book } = await supabase.from('books').select('available_copies, total_copies').eq('book_id', issue.book_id).single();
    if (book) {
      await supabase.from('books').update({
        available_copies: Math.min(book.available_copies + 1, book.total_copies)
      }).eq('book_id', issue.book_id);
    }
    
    return { fine };
  },

  renewBook: async (issueId) => {
    const { data: issue, error: fetchError } = await supabase.from('issues').select('*').eq('issue_id', issueId).single();
    if (fetchError || !issue) throw new Error('Issue record not found');
    
    const today = new Date();
    const currentDueDate = new Date(issue.due_date);
    if (currentDueDate < today) {
      throw new Error('Overdue books cannot be renewed. Please return the book and pay fine first.');
    }

    const newDueDate = addDays(currentDueDate, 7);
    
    const { data, error } = await supabase.from('issues').update({
      due_date: format(newDueDate, 'yyyy-MM-dd')
    }).eq('issue_id', issueId).select().single();
    
    if (error) throw error;
    return data;
  },

  getStats: async () => {
    const today = format(new Date(), 'yyyy-MM-dd');

    const { data: issuesData, error: issuesError } = await supabase.from('issues').select('status, due_date').eq('status', 'Issued');
    if (issuesError) throw issuesError;
    
    const overdue = issuesData.filter(i => new Date(i.due_date) < new Date(today));

    const { totalBooks, availableBooks } = await bookService.getBookStats();

    return {
      totalBooks,
      issuedBooks: issuesData.length,
      availableBooks,
      overdueBooks: overdue.length
    };
  },

  getWeeklyData: async () => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    const lastWeek = format(d, 'yyyy-MM-dd');

    const { data, error } = await supabase.from('issues').select('issue_date').gte('issue_date', lastWeek);
    if (error) throw error;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const datePointer = new Date();
      datePointer.setDate(datePointer.getDate() - i);
      const dateStr = format(datePointer, 'yyyy-MM-dd');
      const count = data.filter(issue => issue.issue_date === dateStr).length;
      result.push({ name: days[datePointer.getDay()], count });
    }
    return result;
  },

  getCategoryData: async () => {
    const { data, error } = await supabase.from('books').select('total_copies, categories ( category_name )');
    if (error) throw error;

    const catMap = {};
    data.forEach(book => {
      const name = book.categories?.category_name || 'Other';
      catMap[name] = (catMap[name] || 0) + book.total_copies;
    });
    return Object.entries(catMap).map(([name, value]) => ({ name, value }));
  },

  getUserHistory: async (userId) => {
    const { data, error } = await supabase.from('issues').select('*, books ( title )').eq('user_id', userId).order('issue_date', { ascending: false });
    if (error) throw error;
    return data;
  }
};

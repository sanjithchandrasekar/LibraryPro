// Mock data service - no Supabase connection required
// Replace these with real Supabase calls when ready to connect

export const mockCategories = [
  { category_id: 1, category_name: 'Computer Science' },
  { category_id: 2, category_name: 'Mathematics' },
  { category_id: 3, category_name: 'Physics' },
  { category_id: 4, category_name: 'Literature' },
  { category_id: 5, category_name: 'History' },
  { category_id: 6, category_name: 'Biology' },
];

export const mockBooks = [
  { book_id: 'b1', title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', category_id: 1, total_copies: 5, available_copies: 3, categories: { category_name: 'Computer Science' } },
  { book_id: 'b2', title: 'The Pragmatic Programmer', author: 'Andrew Hunt', isbn: '978-0201616224', category_id: 1, total_copies: 4, available_copies: 4, categories: { category_name: 'Computer Science' } },
  { book_id: 'b3', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '978-0262033848', category_id: 2, total_copies: 3, available_copies: 1, categories: { category_name: 'Mathematics' } },
  { book_id: 'b4', title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '978-0553380163', category_id: 3, total_copies: 6, available_copies: 5, categories: { category_name: 'Physics' } },
  { book_id: 'b5', title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '978-0061935466', category_id: 4, total_copies: 8, available_copies: 6, categories: { category_name: 'Literature' } },
  { book_id: 'b6', title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '978-0062316097', category_id: 5, total_copies: 5, available_copies: 0, categories: { category_name: 'History' } },
  { book_id: 'b7', title: 'Design Patterns', author: 'Gang of Four', isbn: '978-0201633610', category_id: 1, total_copies: 3, available_copies: 2, categories: { category_name: 'Computer Science' } },
  { book_id: 'b8', title: 'The Gene', author: 'Siddhartha Mukherjee', isbn: '978-1476733524', category_id: 6, total_copies: 4, available_copies: 3, categories: { category_name: 'Biology' } },
];

export const mockUsers = [
  { user_id: 'u1', name: 'Alice Johnson', email: 'alice@university.edu', phone: '+91 98765 43210', role: 'Student', department: 'Computer Science', created_at: '2025-01-15' },
  { user_id: 'u2', name: 'Bob Smith', email: 'bob@university.edu', phone: '+91 87654 32109', role: 'Faculty', department: 'Mathematics', created_at: '2025-02-20' },
  { user_id: 'u3', name: 'Carol White', email: 'carol@university.edu', phone: '+91 76543 21098', role: 'Student', department: 'Physics', created_at: '2025-03-10' },
  { user_id: 'u4', name: 'David Brown', email: 'david@university.edu', phone: '+91 65432 10987', role: 'Student', department: 'Literature', created_at: '2025-01-28' },
  { user_id: 'u5', name: 'Prof. Emily Chen', email: 'emily@university.edu', phone: '+91 54321 09876', role: 'Faculty', department: 'Biology', created_at: '2024-12-01' },
];

export const mockIssues = [
  { issue_id: 'i1', user_id: 'u1', book_id: 'b1', issue_date: '2026-04-10', due_date: '2026-04-17', return_date: null, fine_amount: 0, status: 'Issued', users: { name: 'Alice Johnson' }, books: { title: 'Clean Code' } },
  { issue_id: 'i2', user_id: 'u3', book_id: 'b6', issue_date: '2026-04-01', due_date: '2026-04-08', return_date: null, fine_amount: 0, status: 'Issued', users: { name: 'Carol White' }, books: { title: 'Sapiens' } },
  { issue_id: 'i3', user_id: 'u2', book_id: 'b3', issue_date: '2026-03-25', due_date: '2026-04-01', return_date: '2026-04-03', fine_amount: 20, status: 'Returned', users: { name: 'Bob Smith' }, books: { title: 'Introduction to Algorithms' } },
  { issue_id: 'i4', user_id: 'u4', book_id: 'b5', issue_date: '2026-04-12', due_date: '2026-04-19', return_date: null, fine_amount: 0, status: 'Issued', users: { name: 'David Brown' }, books: { title: 'To Kill a Mockingbird' } },
  { issue_id: 'i5', user_id: 'u5', book_id: 'b7', issue_date: '2026-04-05', due_date: '2026-04-12', return_date: '2026-04-11', fine_amount: 0, status: 'Returned', users: { name: 'Prof. Emily Chen' }, books: { title: 'Design Patterns' } },
];

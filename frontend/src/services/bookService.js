import { mockBooks, mockCategories } from './mockData';

// In-memory store so CRUD operations persist during session
let booksStore = [...mockBooks];
let categoriesStore = [...mockCategories];
let idCounter = 100;

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

export const bookService = {
  getBooks: async (search = '', categoryId = null) => {
    await delay();
    let result = [...booksStore];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.includes(q)
      );
    }
    if (categoryId) {
      result = result.filter(b => String(b.category_id) === String(categoryId));
    }
    return result;
  },

  getCategories: async () => {
    await delay(100);
    return [...categoriesStore];
  },

  addBook: async (book) => {
    await delay();
    const newBook = {
      ...book,
      book_id: `b${++idCounter}`,
      available_copies: parseInt(book.total_copies),
      total_copies: parseInt(book.total_copies),
      category_id: parseInt(book.category_id),
      categories: { category_name: categoriesStore.find(c => c.category_id === parseInt(book.category_id))?.category_name || 'Unknown' },
      created_at: new Date().toISOString()
    };
    booksStore.unshift(newBook);
    return newBook;
  },

  updateBook: async (id, updates) => {
    await delay();
    const idx = booksStore.findIndex(b => b.book_id === id);
    if (idx === -1) throw new Error('Book not found');
    const category = categoriesStore.find(c => c.category_id === parseInt(updates.category_id));
    booksStore[idx] = {
      ...booksStore[idx],
      ...updates,
      category_id: parseInt(updates.category_id),
      total_copies: parseInt(updates.total_copies),
      categories: { category_name: category?.category_name || 'Unknown' }
    };
    return booksStore[idx];
  },

  deleteBook: async (id) => {
    await delay();
    booksStore = booksStore.filter(b => b.book_id !== id);
  }
};

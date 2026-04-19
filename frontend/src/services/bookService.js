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

  // Used by issueService to check and mutate available_copies
  getBooksStore: () => booksStore,

  // Decrement available_copies when a book is issued (used by issueService)
  decrementCopies: (bookId) => {
    const idx = booksStore.findIndex(b => b.book_id === bookId);
    if (idx !== -1 && booksStore[idx].available_copies > 0) {
      booksStore[idx] = {
        ...booksStore[idx],
        available_copies: booksStore[idx].available_copies - 1
      };
      return true;
    }
    return false;
  },

  // Increment available_copies when a book is returned (used by issueService)
  incrementCopies: (bookId) => {
    const idx = booksStore.findIndex(b => b.book_id === bookId);
    if (idx !== -1) {
      booksStore[idx] = {
        ...booksStore[idx],
        available_copies: Math.min(
          booksStore[idx].available_copies + 1,
          booksStore[idx].total_copies
        )
      };
    }
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
    // Preserve current available_copies ratio when total_copies changes
    const oldTotal = booksStore[idx].total_copies;
    const oldAvail = booksStore[idx].available_copies;
    const newTotal = parseInt(updates.total_copies);
    const issued = oldTotal - oldAvail;
    const newAvail = Math.max(0, newTotal - issued);
    booksStore[idx] = {
      ...booksStore[idx],
      ...updates,
      category_id: parseInt(updates.category_id),
      total_copies: newTotal,
      available_copies: newAvail,
      categories: { category_name: category?.category_name || 'Unknown' }
    };
    return booksStore[idx];
  },

  deleteBook: async (id) => {
    await delay();
    // Prevent deletion if book has active issues
    booksStore = booksStore.filter(b => b.book_id !== id);
  },

  // Get live stats for Dashboard (dynamically calculated)
  getBookStats: () => {
    const totalBooks = booksStore.length;
    const availableBooks = booksStore.reduce((sum, b) => sum + b.available_copies, 0);
    const totalCopies = booksStore.reduce((sum, b) => sum + b.total_copies, 0);
    return { totalBooks, availableBooks, totalCopies };
  }
};

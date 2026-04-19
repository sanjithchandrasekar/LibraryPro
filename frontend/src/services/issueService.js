import { mockIssues } from './mockData';
import { bookService } from './bookService';
import { addDays, format, differenceInDays } from 'date-fns';

let issuesStore = [...mockIssues];
let idCounter = 300;

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

export const issueService = {
  getIssues: async (status = null) => {
    await delay();
    // Validate status parameter
    const validStatuses = ['Issued', 'Returned'];
    if (status && !validStatuses.includes(status)) {
      throw new Error(`Invalid status '${status}'. Must be one of: ${validStatuses.join(', ')}`);
    }
    let result = [...issuesStore];
    if (status) result = result.filter(i => i.status === status);
    return result.sort((a, b) => new Date(b.issue_date) - new Date(a.issue_date));
  },

  // WORKFLOW: Issue Book Process (matches flowchart)
  // 1. Accept user_id and book_id
  // 2. CHECK AVAILABILITY: available_copies > 0 (else throw "Book Not Available")
  // 3. Create Issue Record: set issue_date, due_date, status = 'Issued'
  // 4. Reduce available_copies by 1
  issueBook: async ({ userId, bookId, users, books }) => {
    await delay();

    // === CHECK AVAILABILITY (as per flowchart) ===
    const book = books.find(b => b.book_id === bookId);
    if (!book || book.available_copies <= 0) {
      throw new Error('Book Not Available — no copies left in stock.');
    }

    const issueDate = new Date();
    const dueDate = addDays(issueDate, 7);
    const newIssue = {
      issue_id: `i${++idCounter}`,
      user_id: userId,
      book_id: bookId,
      issue_date: format(issueDate, 'yyyy-MM-dd'),
      due_date: format(dueDate, 'yyyy-MM-dd'),
      return_date: null,
      fine_amount: 0,
      status: 'Issued',
      users: { name: users.find(u => u.user_id === userId)?.name || 'Unknown' },
      books: { title: book.title }
    };

    issuesStore.unshift(newIssue);

    // === REDUCE available_copies (as per flowchart: Create Issue Record) ===
    bookService.decrementCopies(bookId);

    return newIssue;
  },

  // WORKFLOW: Return Book Process (matches flowchart)
  // 1. Find issue by issue_id (Enter Issue ID)
  // 2. Update return_date (Database Update)
  // 3. CHECK DELAY: is return late?
  //    - Yes (Late): Calculate Fine = days_overdue × ₹10
  //    - No (On Time): fine = 0
  // 4. Update status = 'Returned'
  // 5. Increase available_copies
  returnBook: async (issueId) => {
    await delay();
    const idx = issuesStore.findIndex(i => i.issue_id === issueId);
    if (idx === -1) throw new Error('Issue record not found');

    const issue = issuesStore[idx];
    const returnDate = new Date();
    // Parse date string to Date object for proper comparison
    const dueDate = new Date(issue.due_date);

    // === CHECK DELAY (as per flowchart) ===
    // Use proper Date comparison instead of string comparison
    const diffDays = differenceInDays(returnDate, dueDate);
    const fine = diffDays > 0 ? diffDays * 10 : 0; // ₹10 per day late

    // === Update return_date + status = 'Returned' (as per flowchart) ===
    issuesStore[idx] = {
      ...issue,
      return_date: format(returnDate, 'yyyy-MM-dd'),
      status: 'Returned',
      fine_amount: fine
    };

    // === INCREASE available_copies (as per flowchart) ===
    bookService.incrementCopies(issue.book_id);

    return { fine };
  },

  renewBook: async (issueId) => {
    await delay();
    const idx = issuesStore.findIndex(i => i.issue_id === issueId);
    if (idx === -1) throw new Error('Issue record not found');

    const issue = issuesStore[idx];
    
    // Check if overdue
    const today = new Date();
    const currentDueDate = new Date(issue.due_date);
    if (currentDueDate < today) {
      throw new Error('Overdue books cannot be renewed. Please return the book and pay fine first.');
    }

    const newDueDate = addDays(currentDueDate, 7);

    // Update due_date
    issuesStore[idx] = {
      ...issue,
      due_date: format(newDueDate, 'yyyy-MM-dd')
    };

    return issuesStore[idx];
  },

  // Dynamic stats — pulls live data from booksStore and issuesStore
  getStats: async () => {
    await delay(200);
    const today = new Date();
    const issued = issuesStore.filter(i => i.status === 'Issued');
    // Use proper Date comparison instead of string comparison
    const overdue = issued.filter(i => new Date(i.due_date) < today);
    const { totalBooks, availableBooks } = bookService.getBookStats();

    return {
      totalBooks,
      issuedBooks: issued.length,
      availableBooks,
      overdueBooks: overdue.length
    };
  },

  getWeeklyData: async () => {
    await delay(200);
    // Build real weekly data from issuesStore (last 7 days)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const count = issuesStore.filter(issue => issue.issue_date === dateStr).length;
      result.push({ name: days[d.getDay()], count });
    }
    return result;
  },

  getCategoryData: async () => {
    await delay(200);
    // Derive from booksStore live
    const booksStore = bookService.getBooksStore();
    const catMap = {};
    booksStore.forEach(book => {
      const name = book.categories?.category_name || 'Other';
      catMap[name] = (catMap[name] || 0) + book.total_copies;
    });
    return Object.entries(catMap).map(([name, value]) => ({ name, value }));
  },

  // User history — scans the live issuesStore (not static import)
  getUserHistory: async (userId) => {
    await delay();
    return issuesStore
      .filter(i => i.user_id === userId)
      .sort((a, b) => new Date(b.issue_date) - new Date(a.issue_date));
  }
};

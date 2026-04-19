import { mockIssues } from './mockData';
import { addDays, format, differenceInDays } from 'date-fns';

let issuesStore = [...mockIssues];
let booksRef = null; // Will be injected by Issues page
let idCounter = 300;

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

export const issueService = {
  getIssues: async (status = null) => {
    await delay();
    let result = [...issuesStore];
    if (status) result = result.filter(i => i.status === status);
    return result.sort((a, b) => new Date(b.issue_date) - new Date(a.issue_date));
  },

  issueBook: async ({ userId, bookId, users, books }) => {
    await delay();
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
      books: { title: books.find(b => b.book_id === bookId)?.title || 'Unknown' }
    };
    issuesStore.unshift(newIssue);
    return newIssue;
  },

  returnBook: async (issueId) => {
    await delay();
    const idx = issuesStore.findIndex(i => i.issue_id === issueId);
    if (idx === -1) throw new Error('Issue record not found');

    const issue = issuesStore[idx];
    const returnDate = new Date();
    const dueDate = new Date(issue.due_date);
    const diffDays = differenceInDays(returnDate, dueDate);
    const fine = diffDays > 0 ? diffDays * 10 : 0;

    issuesStore[idx] = {
      ...issue,
      return_date: format(returnDate, 'yyyy-MM-dd'),
      status: 'Returned',
      fine_amount: fine
    };
    return { fine };
  },

  getStats: async () => {
    await delay(200);
    const today = format(new Date(), 'yyyy-MM-dd');
    const issued = issuesStore.filter(i => i.status === 'Issued');
    const overdue = issued.filter(i => i.due_date < today);

    return {
      totalBooks: 8,   // from mockBooks.length  
      issuedBooks: issued.length,
      availableBooks: 24, // sum of available_copies from books
      overdueBooks: overdue.length
    };
  },

  getWeeklyData: async () => {
    await delay(200);
    return [
      { name: 'Mon', count: 12 },
      { name: 'Tue', count: 19 },
      { name: 'Wed', count: 15 },
      { name: 'Thu', count: 22 },
      { name: 'Fri', count: 30 },
      { name: 'Sat', count: 10 },
      { name: 'Sun', count: 5 },
    ];
  },

  getCategoryData: async () => {
    await delay(200);
    return [
      { name: 'Computer Science', value: 12 },
      { name: 'Mathematics', value: 7 },
      { name: 'Physics', value: 9 },
      { name: 'Literature', value: 14 },
      { name: 'History', value: 6 },
      { name: 'Biology', value: 8 },
    ];
  }
};

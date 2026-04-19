import { mockUsers } from './mockData';

let usersStore = [...mockUsers];
let idCounter = 200;

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

export const userService = {
  getUsers: async (search = '') => {
    await delay();
    let result = [...usersStore];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q)
      );
    }
    return result;
  },

  addUser: async (user) => {
    await delay();
    const newUser = {
      ...user,
      user_id: `u${++idCounter}`,
      created_at: new Date().toISOString()
    };
    usersStore.unshift(newUser);
    return newUser;
  },

  updateUser: async (id, updates) => {
    await delay();
    const idx = usersStore.findIndex(u => u.user_id === id);
    if (idx === -1) throw new Error('User not found');
    usersStore[idx] = { ...usersStore[idx], ...updates };
    return usersStore[idx];
  },

  deleteUser: async (id) => {
    await delay();
    usersStore = usersStore.filter(u => u.user_id !== id);
  },

  getUserHistory: async (userId) => {
    await delay();
    // Return mock history entries for a user
    const { mockIssues } = await import('./mockData');
    return mockIssues.filter(i => i.user_id === userId);
  }
};

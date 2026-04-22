import { supabase } from './supabaseClient';
import { format, subDays, differenceInDays, isSameDay } from 'date-fns';

export const notificationService = {
  getNotifications: async () => {
    // Resetting time of today to midnight for proper comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = format(today, 'yyyy-MM-dd');
    
    const yesterday = subDays(today, 1);
    const yesterdayStr = yesterday.toISOString();
    
    let notifications = [];
    
    // Get dismissed IDs from localStorage
    const dismissedIds = JSON.parse(localStorage.getItem('dismissed_notifications') || '[]');

    try {
      // 1. Get Issued Books (to check overdue and due today)
      const { data: issuesData, error: issuesError } = await supabase
        .from('issues')
        .select('*, users ( name ), books ( title )')
        .eq('status', 'Issued');

      if (!issuesError && issuesData) {
        issuesData.forEach(issue => {
          const dueDate = new Date(issue.due_date);
          dueDate.setHours(0,0,0,0);
          
          const userName = issue.users?.name || 'Unknown User';
          const bookTitle = issue.books?.title || 'Unknown Book';

          if (dueDate < today) {
            // Overdue
            const diff = differenceInDays(today, dueDate);
            const timeStr = diff === 1 ? '1 day ago' : `${diff} days ago`;
            notifications.push({
              id: `issue-overdue-${issue.issue_id}`,
              text: `${bookTitle} is overdue (${userName})`,
              time: timeStr,
              dot: 'bg-red-500',
              type: 'overdue',
              timestamp: dueDate.getTime() // used for sorting later
            });
          } else if (dueDate.getTime() === today.getTime()) {
            // Due today
            notifications.push({
              id: `issue-duetoday-${issue.issue_id}`,
              text: `${bookTitle} due today (${userName})`,
              time: 'Today',
              dot: 'bg-amber-500',
              type: 'warning',
              timestamp: today.getTime()
            });
          }
        });
      }

      // 2. Get recent users (registered recently)
      // Check last 7 days just to have some data, but flag them as recent
      const lastWeek = subDays(today, 7).toISOString();
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('user_id, name, created_at')
        .gte('created_at', lastWeek);

      if (!usersError && usersData) {
        usersData.forEach(user => {
          const createdAt = new Date(user.created_at);
          let timeStr = 'Recently';
          if (isSameDay(createdAt, today)) timeStr = 'Today';
          else if (isSameDay(createdAt, yesterday)) timeStr = 'Yesterday';
          else timeStr = `${differenceInDays(today, createdAt)} days ago`;

          notifications.push({
            id: `user-${user.user_id}`,
            text: `New user registered: ${user.name}`,
            time: timeStr,
            dot: 'bg-violet-500',
            type: 'info',
            timestamp: createdAt.getTime()
          });
        });
      }

      // Filter out dismissed notifications
      notifications = notifications.filter(n => !dismissedIds.includes(n.id));

      // Sort by timestamp descending
      notifications.sort((a, b) => b.timestamp - a.timestamp);

      return notifications;
    } catch (err) {
      console.error("Error fetching notifications:", err);
      return [];
    }
  },

  dismissNotification: (id) => {
    const dismissedIds = JSON.parse(localStorage.getItem('dismissed_notifications') || '[]');
    if (!dismissedIds.includes(id)) {
      dismissedIds.push(id);
      localStorage.setItem('dismissed_notifications', JSON.stringify(dismissedIds));
    }
  },

  dismissAll: (notifications) => {
    const dismissedIds = JSON.parse(localStorage.getItem('dismissed_notifications') || '[]');
    notifications.forEach(n => {
      if (!dismissedIds.includes(n.id)) {
        dismissedIds.push(n.id);
      }
    });
    localStorage.setItem('dismissed_notifications', JSON.stringify(dismissedIds));
  }
};

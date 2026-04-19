import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import {
  Plus, Search, Edit2, Trash2, History,
  GraduationCap, Users as UsersIcon, Mail, Phone, Building2,
  BookOpen, Clock, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const RoleBadge = ({ role }) => (
  <span className={`badge mt-1 ${role === 'Faculty'
    ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200/40 dark:border-purple-900/40'
    : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/40 dark:border-blue-900/40'
  }`}>
    {role === 'Faculty' ? '👨‍🏫' : '🎓'} {role}
  </span>
);

const avatarGradients = [
  'from-violet-500 to-indigo-600',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-pink-500 to-rose-500',
  'from-blue-400 to-cyan-500',
  'from-purple-500 to-fuchsia-500',
];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [historyModal, setHistoryModal] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'Student', department: '' });

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      setUsers(await userService.getUsers(search));
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', phone: '', role: 'Student', department: '' });
    setIsModalOpen(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, phone: user.phone || '', role: user.role, department: user.department });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.user_id, form);
        toast.success('Member profile updated');
      } else {
        await userService.addUser(form);
        toast.success('Member registered');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this member permanently?')) return;
    setDeleting(id);
    try {
      await userService.deleteUser(id);
      toast.success('Member removed');
      fetchUsers();
    } catch { toast.error('Cannot remove member with active issues'); }
    finally { setDeleting(null); }
  };

  const openHistory = async (user) => {
    setHistoryModal(user);
    setHistoryLoading(true);
    try {
      setHistoryData(await userService.getUserHistory(user.user_id));
    } catch { toast.error('Failed to load history'); }
    finally { setHistoryLoading(false); }
  };

  const students = users.filter(u => u.role === 'Student').length;
  const faculty = users.filter(u => u.role === 'Faculty').length;

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <UsersIcon size={18} className="text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Library Members</h1>
          </div>
          <p className="text-sm text-muted-foreground font-medium ml-12">{students} students · {faculty} faculty</p>
        </div>
        <button id="add-member-btn" onClick={openAdd} className="btn-primary">
          <Plus size={18} /> Register Member
        </button>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Members', value: users.length, icon: UsersIcon, gradient: 'from-indigo-500 to-violet-500', shadow: 'shadow-indigo-500/25' },
          { label: 'Students', value: students, icon: GraduationCap, gradient: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/25' },
          { label: 'Faculty', value: faculty, icon: Building2, gradient: 'from-purple-500 to-fuchsia-500', shadow: 'shadow-purple-500/25' },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-3xl p-5 shadow-sm card-hover flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-lg ${s.shadow} shrink-0`}>
              <s.icon size={22} className="text-white" />
            </div>
            <div>
              <p className="text-3xl font-black text-foreground">{s.value}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            id="user-search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-11 py-2.5"
            placeholder="Search by name, email, or department..."
          />
        </div>
      </div>

      {/* User Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="skeleton w-12 h-12 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-2/3" />
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl py-24 text-center shadow-sm">
          <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-muted flex items-center justify-center">
            <UsersIcon size={36} className="text-muted-foreground/30" />
          </div>
          <p className="text-muted-foreground font-bold text-lg">No members found</p>
          <p className="text-sm text-muted-foreground/60 mt-2">Try adjusting your search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {users.map((user, idx) => (
            <div key={user.user_id} className="bg-card border border-border rounded-3xl p-6 card-hover shadow-sm group relative overflow-hidden">
              {/* Subtle bg accent */}
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-5 blur-xl bg-gradient-to-br ${avatarGradients[idx % avatarGradients.length]}`} />

              <div className="flex items-start justify-between mb-5 relative z-10">
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${avatarGradients[idx % avatarGradients.length]} flex items-center justify-center font-black text-lg text-white shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-foreground leading-tight">{user.name}</p>
                    <RoleBadge role={user.role} />
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button onClick={() => openHistory(user)} className="p-2 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all hover:scale-110 active:scale-95" title="View History">
                    <History size={15} />
                  </button>
                  <button onClick={() => openEdit(user)} className="p-2 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all hover:scale-110 active:scale-95" title="Edit">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => handleDelete(user.user_id)} disabled={deleting === user.user_id} className="p-2 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all hover:scale-110 active:scale-95" title="Remove">
                    {deleting === user.user_id
                      ? <div className="w-4 h-4 border-2 border-destructive border-t-transparent rounded-full spin" />
                      : <Trash2 size={15} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm relative z-10">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Mail size={13} className="shrink-0" />
                  <span className="truncate font-medium">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Phone size={13} className="shrink-0" />
                    <span className="font-medium">{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Building2 size={13} className="shrink-0" />
                  <span className="font-medium">{user.department}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit Member' : 'Register Member'}
        description={editingUser ? `Editing profile for ${editingUser?.name}` : 'Add a new member to the library system'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold mb-2 text-foreground/80">Full Name *</label>
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="input-field" placeholder="John Doe" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-foreground/80">Email *</label>
              <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="input-field" placeholder="john@uni.edu" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-foreground/80">Phone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="input-field" placeholder="+91 XXXXX XXXXX" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-foreground/80">Role *</label>
              <select required value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="input-field">
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-foreground/80">Department *</label>
              <input required value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                className="input-field" placeholder="Computer Science" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)}
              className="flex-1 py-3 rounded-2xl border border-border hover:bg-muted transition-colors font-bold text-sm">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex-1 btn-primary justify-center py-3">
              {submitting
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spin" />
                : editingUser ? '✓ Save Changes' : '+ Register'}
            </button>
          </div>
        </form>
      </Modal>

      {/* History Modal */}
      <Modal isOpen={!!historyModal} onClose={() => setHistoryModal(null)}
        title="Borrowing History" description={`Showing all activity for ${historyModal?.name}`} size="lg">
        {historyLoading ? <Loader /> : (
          <div className="-mx-1">
            {historyData.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-muted flex items-center justify-center">
                  <BookOpen size={28} className="text-muted-foreground/40" />
                </div>
                <p className="text-muted-foreground font-bold">No borrowing history</p>
                <p className="text-sm text-muted-foreground/60 mt-1.5">This member hasn't borrowed any books yet.</p>
              </div>
            ) : historyData.map((h, idx) => {
              const isOverdue = new Date(h.due_date) < new Date() && h.status === 'Issued';
              return (
                <div key={h.issue_id} className={`flex items-center gap-4 py-4 px-2 ${idx < historyData.length - 1 ? 'border-b border-border/50' : ''}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${h.status === 'Returned' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600' : isOverdue ? 'bg-red-100 dark:bg-red-950/40 text-red-600' : 'bg-amber-100 dark:bg-amber-950/40 text-amber-600'}`}>
                    {h.status === 'Returned' ? <CheckCircle2 size={18} /> : isOverdue ? <AlertTriangle size={18} /> : <Clock size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{h.books?.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                      Issued: {format(new Date(h.issue_date), 'MMM d, yyyy')} · Due: {format(new Date(h.due_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`badge ${h.status === 'Returned' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : isOverdue ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'}`}>
                      {isOverdue ? '⚠ Overdue' : h.status}
                    </span>
                    {h.fine_amount > 0 && (
                      <p className="text-xs text-destructive font-bold mt-1.5">Fine: ₹{h.fine_amount}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users;

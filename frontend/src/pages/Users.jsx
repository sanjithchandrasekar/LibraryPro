import React, { useState, useEffect, useCallback } from 'react';
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
  <span className={`badge ${role === 'Faculty'
    ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40'
    : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40'
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

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await userService.getUsers(search));
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

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
    // Validate required fields
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (!form.email.trim()) { toast.error('Email is required'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) { toast.error('Invalid email format'); return; }
    if (!form.phone.trim()) { toast.error('Phone is required'); return; }
    if (!form.department.trim()) { toast.error('Department is required'); return; }
    // Check for duplicate email (only for new users)
    if (!editingUser && users.some(u => u.email.toLowerCase() === form.email.toLowerCase())) {
      toast.error('Email already registered'); return;
    }
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

  const stats = [
    { label: 'Total Members', value: users.length, icon: UsersIcon, color: 'bg-indigo-500' },
    { label: 'Students', value: users.filter(u => u.role === 'Student').length, icon: GraduationCap, color: 'bg-emerald-500' },
    { label: 'Faculty', value: users.filter(u => u.role === 'Faculty').length, icon: Building2, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Library Members</h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium opacity-80">Manage student and faculty credentials</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={20} /> Register Member
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-3xl p-6 shadow-sm flex items-center gap-5">
            <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center shadow-lg shadow-indigo-500/10`}>
              <s.icon size={22} className="text-white" />
            </div>
            <div>
              <p className="text-3xl font-black text-foreground leading-none">{s.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field !pl-14 py-4 rounded-[1.5rem] bg-card border-border shadow-sm text-base"
          placeholder="Search members by name, email, or department..."
        />
      </div>

      {/* User Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-[180px]" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="bg-card border border-border rounded-[2.5rem] py-24 text-center shadow-sm">
          <p className="text-muted-foreground font-black uppercase tracking-widest">No members registered</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {users.map((user, idx) => (
            <div key={user.user_id} className="bg-card border border-border rounded-[2rem] p-7 card-hover shadow-sm group relative overflow-hidden">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarGradients[idx % avatarGradients.length]} flex items-center justify-center font-black text-xl text-white shadow-xl`}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-lg text-foreground leading-tight">{user.name}</p>
                    <RoleBadge role={user.role} />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 translate-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button onClick={() => openHistory(user)} className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground" title="History"><History size={16} /></button>
                  <button onClick={() => openEdit(user)} className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground" title="Edit"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(user.user_id)} disabled={deleting === user.user_id} className="p-2.5 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0" title="Remove">
                    {deleting === user.user_id ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs font-bold text-muted-foreground">
                  <Mail size={14} className="text-indigo-400" /> {user.email}
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold text-muted-foreground">
                  <Building2 size={14} className="text-indigo-400" /> {user.department}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? 'Edit Member' : 'Register Member'} description={editingUser ? 'Update member details.' : 'Fill in the details to register a new member.'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Name</label>
            <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full Name" required />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Email</label>
            <input type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email Address" required />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Phone</label>
            <input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone Number" required />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Role</label>
            <select className="input-field" value={form.role} onChange={e => setForm({...form, role: e.target.value})} required>
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Department</label>
            <input className="input-field" value={form.department} onChange={e => setForm({...form, department: e.target.value})} placeholder="Department / Course" required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-2xl border border-border hover:bg-muted transition-colors font-bold text-sm">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 btn-primary justify-center py-3">
              {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spin" /> : (editingUser ? 'Save Changes' : 'Register')}
            </button>
          </div>
        </form>
      </Modal>

      {/* History Modal */}
      <Modal isOpen={!!historyModal} onClose={() => setHistoryModal(null)} title="Member History" description={`Issue history for ${historyModal?.name}`}>
        {historyLoading ? <Loader /> : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {historyData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 font-bold">No issue history found.</p>
            ) : (
              historyData.map(h => (
                <div key={h.issue_id} className="p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground text-sm">{h.books?.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Issued: {format(new Date(h.issue_date), 'MMM d, yyyy')}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${h.status === 'Returned' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40'}`}>{h.status}</span>
                </div>
              ))
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users;

import React, { useState, useEffect, useCallback } from 'react';
import { bookService } from '../services/bookService';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import {
  Plus, Search, SlidersHorizontal, Edit2, Trash2,
  BookOpen, ChevronLeft, ChevronRight, Library
} from 'lucide-react';
import { toast } from 'react-toastify';

const PAGE_SIZE = 8;

const AvailabilityBar = ({ available, total }) => {
  const pct = total > 0 ? (available / total) * 100 : 0;
  const color = pct === 0 ? 'from-red-500 to-rose-500' : pct < 40 ? 'from-amber-400 to-orange-500' : 'from-emerald-400 to-teal-500';
  const textColor = pct === 0 ? 'text-red-600 dark:text-red-400' : pct < 40 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400';
  return (
    <div className="space-y-1.5 min-w-[100px]">
      <div className="flex justify-between text-xs font-bold">
        <span className={textColor}>{available} avail.</span>
        <span className="text-muted-foreground">/ {total}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const Books = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', author: '', isbn: '', category_id: '', total_copies: '' });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [b, c] = await Promise.all([bookService.getBooks(debouncedSearch, filterCat), bookService.getCategories()]);
      setBooks(b);
      setCategories(c);
      setPage(1);
    } catch { toast.error('Failed to load books'); }
    finally { setLoading(false); }
  }, [debouncedSearch, filterCat]);

  useEffect(() => { 
    // Parse filter category as number to prevent type mismatch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(); 
  }, [fetchData]);

  const openAdd = () => {
    setEditingBook(null);
    setForm({ title: '', author: '', isbn: '', category_id: '', total_copies: '' });
    setIsModalOpen(true);
  };

  const openEdit = (book) => {
    setEditingBook(book);
    setForm({ title: book.title, author: book.author, isbn: book.isbn, category_id: String(book.category_id), total_copies: String(book.total_copies) });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.author || !form.isbn || !form.category_id || !form.total_copies) {
      toast.warning('Please fill in all fields'); return;
    }
    setSubmitting(true);
    try {
      if (editingBook) {
        await bookService.updateBook(editingBook.book_id, form);
        toast.success('Book updated!');
      } else {
        await bookService.addBook(form);
        toast.success('Book added to library!');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await bookService.deleteBook(id);
      toast.success('Book removed');
      fetchData();
    } catch { toast.error('Cannot delete this book'); }
    finally { setDeleting(null); }
  };

  const totalPages = Math.ceil(books.length / PAGE_SIZE);
  const paginated = books.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Library size={18} className="text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Book Inventory</h1>
          </div>
          <p className="text-sm text-muted-foreground font-medium ml-12">{books.length} books found</p>
        </div>
        {user?.role === 'Admin' && (
          <button id="add-book-btn" onClick={openAdd} className="btn-primary">
            <Plus size={18} /> Add New Book
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            id="book-search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search title, author, ISBN..."
            className="input-field !pl-11 py-2.5"
          />
        </div>
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal size={16} className="text-muted-foreground shrink-0" />
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="input-field py-2.5 min-w-[180px]"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
            ))}
          </select>
        </div>
        {(search || filterCat) && (
          <button
            onClick={() => { setSearch(''); setFilterCat(''); }}
            className="text-sm font-bold text-primary hover:text-primary/70 transition-colors px-3 py-2 rounded-xl hover:bg-primary/8"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header text-left">Book</th>
                <th className="table-header text-left">ISBN</th>
                <th className="table-header text-left">Category</th>
                <th className="table-header text-left">Availability</th>
                {user?.role === 'Admin' && <th className="table-header text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(PAGE_SIZE)].map((_, i) => (
                  <tr key={i}>
                    {[80, 50, 40, 60, 30].map((w, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="skeleton h-4" style={{ width: `${w}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="py-20 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-muted flex items-center justify-center">
                        <BookOpen size={28} className="text-muted-foreground/40" />
                      </div>
                      <p className="text-muted-foreground font-bold">No books found</p>
                      <p className="text-sm text-muted-foreground/60 mt-1.5">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((book) => (
                  <tr key={book.book_id} className="hover:bg-muted/25 transition-colors group">
                    <td className="table-cell">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/10 to-indigo-500/10 border border-primary/15 flex items-center justify-center shrink-0">
                          <BookOpen size={17} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground leading-tight">{book.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 font-medium">{book.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="font-mono text-xs bg-muted px-2.5 py-1.5 rounded-lg font-semibold">{book.isbn}</span>
                    </td>
                    <td className="table-cell">
                      <span className="badge bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/30">
                        {book.categories?.category_name}
                      </span>
                    </td>
                    <td className="table-cell w-40">
                      <AvailabilityBar available={book.available_copies} total={book.total_copies} />
                    </td>
                    {user?.role === 'Admin' && (
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => openEdit(book)}
                            className="p-2 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all hover:scale-110 active:scale-95"
                            title="Edit book"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(book.book_id)}
                            disabled={deleting === book.book_id}
                            className="p-2 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all hover:scale-110 active:scale-95"
                            title="Delete book"
                          >
                            {deleting === book.book_id
                              ? <div className="w-4 h-4 border-2 border-destructive border-t-transparent rounded-full spin" />
                              : <Trash2 size={16} />}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/20">
            <p className="text-sm text-muted-foreground font-medium">
              Showing <span className="font-bold text-foreground">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, books.length)}</span> of <span className="font-bold text-foreground">{books.length}</span>
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-xl hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95">
                <ChevronLeft size={16} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${page === i + 1 ? 'bg-primary text-white shadow-md shadow-primary/30 scale-105' : 'hover:bg-muted'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-xl hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBook ? 'Edit Book Details' : 'Add New Book'}
        description={editingBook ? 'Update the book information below.' : 'Fill in the details to add a book to the library.'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold mb-2 text-foreground/80">Book Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="input-field" placeholder="e.g. Clean Code" required />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2 text-foreground/80">Author *</label>
            <input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })}
              className="input-field" placeholder="Robert C. Martin" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-foreground/80">ISBN *</label>
              <input value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })}
                className="input-field font-mono text-sm" placeholder="978-XXXXXXXXXX" required />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-foreground/80">Copies *</label>
              <input type="number" min="1" value={form.total_copies}
                onChange={e => setForm({ ...form, total_copies: e.target.value })}
                className="input-field" placeholder="10" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2 text-foreground/80">Category *</label>
            <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}
              className="input-field" required>
              <option value="">Select a category</option>
              {categories.map(c => (
                <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)}
              className="flex-1 py-3 rounded-2xl border border-border hover:bg-muted transition-colors font-bold text-sm hover:scale-[1.01] active:scale-[0.99]">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex-1 btn-primary justify-center py-3">
              {submitting
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spin" />
                : editingBook ? '✓ Save Changes' : '+ Add Book'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Books;

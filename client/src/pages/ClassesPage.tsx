import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getClasses, createClass, updateClass, deleteClass, Class } from '../api/classes';

export function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Class | null>(null);
  const [form, setForm] = useState({ topic: '', year: '', semester: '' });

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const data = await getClasses();
      setClasses(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      topic: form.topic,
      year: parseInt(form.year),
      semester: parseInt(form.semester)
    };
    try {
      if (editing) {
        await updateClass(editing.id, data);
      } else {
        await createClass(data);
      }
      setShowModal(false);
      setEditing(null);
      setForm({ topic: '', year: '', semester: '' });
      loadClasses();
    } catch (err) {
      alert('Error saving class');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this class?')) return;
    try {
      await deleteClass(id);
      loadClasses();
    } catch {
      alert('Error deleting class');
    }
  };

  const openEdit = (cls: Class) => {
    setEditing(cls);
    setForm({ topic: cls.topic, year: String(cls.year), semester: String(cls.semester) });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ topic: '', year: '', semester: '' });
    setShowModal(true);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="toolbar">
        <h1>Classes</h1>
        <button className="btn btn-primary" onClick={openAdd}>Add Class</button>
      </div>

      {classes.length === 0 ? (
        <div className="empty">No classes defined</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Topic</th>
              <th>Year</th>
              <th>Semester</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map(c => (
              <tr key={c.id}>
                <td><Link to={`/classes/${c.id}`}>{c.topic}</Link></td>
                <td>{c.year}</td>
                <td>{c.semester}</td>
                <td className="actions">
                  <button className="btn btn-secondary" onClick={() => openEdit(c)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? 'Edit Class' : 'Add Class'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Topic</label>
                <input value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Year</label>
                <input type="number" value={form.year} onChange={e => setForm({...form, year: e.target.value})} placeholder="2026" required />
              </div>
              <div className="form-group">
                <label>Semester</label>
                <input type="number" value={form.semester} onChange={e => setForm({...form, semester: e.target.value})} placeholder="1" required />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
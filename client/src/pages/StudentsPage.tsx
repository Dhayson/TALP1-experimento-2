import { use, Suspense, useState, useMemo } from 'react';
import { getStudents, createStudent, updateStudent, deleteStudent, type Student } from '../api/students';

export function StudentsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const studentsPromise = useMemo(() => {
    return getStudents();
  }, [refreshKey]);
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StudentsList studentsPromise={studentsPromise} onRefresh={() => setRefreshKey(k => k + 1)} />
    </Suspense>
  );
}

function StudentsList({ studentsPromise, onRefresh }: { studentsPromise: Promise<Student[]>, onRefresh: () => void }) {
  const students = use(studentsPromise);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState({ name: '', cpf: '', email: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateStudent(editing.id, form);
      } else {
        await createStudent(form);
      }
      setShowModal(false);
      setEditing(null);
      setForm({ name: '', cpf: '', email: '' });
      onRefresh();
    } catch (err) {
      alert(`Error saving student ${err}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this student?')) return;
    try {
      await deleteStudent(id);
      onRefresh();
    } catch {
      alert('Error deleting student');
    }
  };

  const openEdit = (student: Student) => {
    setEditing(student);
    setForm({ name: student.name, cpf: student.cpf, email: student.email });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', cpf: '', email: '' });
    setShowModal(true);
  };

  return (
    <div>
      <div className="toolbar">
        <h1>Students</h1>
        <button className="btn btn-primary" onClick={openAdd}>Add Student</button>
      </div>

      {students.length === 0 ? (
        <div className="empty">No students registered</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>CPF</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.cpf}</td>
                <td>{s.email}</td>
                <td className="actions">
                  <button className="btn btn-secondary" onClick={() => openEdit(s)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(s.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? 'Edit Student' : 'Add Student'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>CPF</label>
                <input value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} placeholder="123.456.789-00" required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
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
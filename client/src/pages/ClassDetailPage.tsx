import { use, Suspense, useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getClass,
  getClassStudents,
  getAllStudents,
  enrollStudent,
  unenrollStudent,
  type Class,
  type Student
} from '../api/classes';

export function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  const classPromise = useMemo(() => getClass(id!), [id, refreshKey]);
  const studentsPromise = useMemo(() => getClassStudents(id!), [id, refreshKey]);
  const allStudentsPromise = useMemo(() => getAllStudents(), [refreshKey]);

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClassDetailContent
        classPromise={classPromise}
        studentsPromise={studentsPromise}
        allStudentsPromise={allStudentsPromise}
        showEnrollModal={showEnrollModal}
        setShowEnrollModal={setShowEnrollModal}
        onRefresh={handleRefresh}
      />
    </Suspense>
  );
}

interface ClassDetailContentProps {
  classPromise: Promise<Class>;
  studentsPromise: Promise<Student[]>;
  allStudentsPromise: Promise<Student[]>;
  showEnrollModal: boolean;
  setShowEnrollModal: (show: boolean) => void;
  onRefresh: () => void;
}

function ClassDetailContent({
  classPromise,
  studentsPromise,
  allStudentsPromise,
  showEnrollModal,
  setShowEnrollModal,
  onRefresh
}: ClassDetailContentProps) {
  const cls = use(classPromise);
  const enrolledStudents = use(studentsPromise);
  const allStudents = use(allStudentsPromise);

  const availableStudents = allStudents.filter(
    s => !enrolledStudents.find(enrolled => enrolled.id === s.id)
  );

  const handleEnroll = async (studentId: string) => {
    try {
      await enrollStudent(cls.id, studentId);
      onRefresh();
    } catch {
      alert('Error enrolling student');
    }
  };

  const handleUnenroll = async (studentId: string) => {
    if (!confirm('Remove student from class?')) return;
    try {
      await unenrollStudent(cls.id, studentId);
      onRefresh();
    } catch {
      alert('Error removing student');
    }
  };

  return (
    <div>
      <div className="toolbar">
        <h1>{cls.topic} ({cls.year}.{cls.semester})</h1>
        <Link to="/classes" className="btn btn-secondary">Back to Classes</Link>
      </div>

      <div className="toolbar">
        <h2>Enrolled Students ({enrolledStudents.length})</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowEnrollModal(true)}
          disabled={availableStudents.length === 0}
        >
          Enroll Student
        </button>
      </div>

      {enrolledStudents.length === 0 ? (
        <div className="empty">No students enrolled. Click "Enroll Student" to add.</div>
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
            {enrolledStudents.map(s => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.cpf}</td>
                <td>{s.email}</td>
                <td className="actions">
                  <button
                    className="btn btn-danger"
                    onClick={() => handleUnenroll(s.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showEnrollModal && (
        <div className="modal-overlay" onClick={() => setShowEnrollModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Enroll Student</h2>
            {availableStudents.length === 0 ? (
              <p className="empty">All students already enrolled</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>CPF</th>
                    <th>Email</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {availableStudents.map(s => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.cpf}</td>
                      <td>{s.email}</td>
                      <td>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleEnroll(s.id)}
                        >
                          Enroll
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="form-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowEnrollModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
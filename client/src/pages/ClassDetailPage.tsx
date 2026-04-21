import { use, Suspense, useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TabNav } from '../components/TabNav';
import {
  getClass,
  getClassStudents,
  getAllStudents,
  getClassTests,
  getClassResults,
  enrollStudent,
  unenrollStudent,
  setClassResult,
  deleteClassResult,
  type Class,
  type Student,
  type Test
} from '../api/classes';

export function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  const classPromise = useMemo(() => getClass(id!), [id, refreshKey]);
  const studentsPromise = useMemo(() => getClassStudents(id!), [id, refreshKey]);
  const allStudentsPromise = useMemo(() => getAllStudents(), [refreshKey]);
  const testsPromise = useMemo(() => getClassTests(id!), [id, refreshKey]);
  const resultsPromise = useMemo(() => getClassResults(id!), [id, refreshKey]);

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClassDetailContent
        classPromise={classPromise}
        studentsPromise={studentsPromise}
        allStudentsPromise={allStudentsPromise}
        testsPromise={testsPromise}
        resultsPromise={resultsPromise}
        showEnrollModal={showEnrollModal}
        setShowEnrollModal={setShowEnrollModal}
        onRefresh={handleRefresh}
        classId={id!}
      />
    </Suspense>
  );
}

interface ClassDetailContentProps {
  classPromise: Promise<Class>;
  studentsPromise: Promise<Student[]>;
  allStudentsPromise: Promise<Student[]>;
  testsPromise: Promise<Test[]>;
  resultsPromise: Promise<{ tests: Test[]; data: Array<{ student: Student; results: Record<string, string> }> }>;
  showEnrollModal: boolean;
  setShowEnrollModal: (show: boolean) => void;
  onRefresh: () => void;
  classId: string;
}

function ClassDetailContent({
  classPromise,
  studentsPromise,
  allStudentsPromise,
  testsPromise,
  resultsPromise,
  showEnrollModal,
  setShowEnrollModal,
  onRefresh,
  classId
}: ClassDetailContentProps) {
  const cls = use(classPromise);
  const enrolledStudents = use(studentsPromise);
  const allStudents = use(allStudentsPromise);
  const tests = use(testsPromise);
  const resultsData = use(resultsPromise);

  const availableStudents = allStudents.filter(
    s => !enrolledStudents.find(enrolled => enrolled.id === s.id)
  );

  const resultsMap: Record<string, Record<string, string>> = {};
  for (const row of resultsData.data) {
    resultsMap[row.student.id] = row.results;
  }

  const studentsTab = (
    <StudentsTab
      enrolledStudents={enrolledStudents}
      availableStudents={availableStudents}
      showEnrollModal={showEnrollModal}
      setShowEnrollModal={setShowEnrollModal}
      onEnroll={async (studentId) => {
        try {
          await enrollStudent(classId, studentId);
          onRefresh();
        } catch {
          alert('Error enrolling student');
        }
      }}
      onUnenroll={async (studentId) => {
        if (!confirm('Remove student from class?')) return;
        try {
          await unenrollStudent(classId, studentId);
          onRefresh();
        } catch {
          alert('Error removing student');
        }
      }}
    />
  );

  const gradesTab = (
    <GradesTab
      tests={tests}
      enrolledStudents={enrolledStudents}
      resultsMap={resultsMap}
      onGradeChange={async (studentId, testId, goal) => {
        try {
          if (goal === '') {
            await deleteClassResult(classId, studentId, testId);
          } else {
            await setClassResult(classId, studentId, testId, goal);
          }
          onRefresh();
        } catch {
          alert('Error saving grade');
        }
      }}
      classId={classId}
    />
  );

  return (
    <div>
      <div className="toolbar">
        <h1>{cls.topic} ({cls.year}.{cls.semester})</h1>
        <Link to="/classes" className="btn btn-secondary">Back to Classes</Link>
      </div>

      <TabNav
        tabs={[
          { id: 'students', label: 'Students', content: studentsTab },
          { id: 'grades', label: 'Grades', content: gradesTab }
        ]}
        defaultTab="students"
      />
    </div>
  );
}

interface StudentsTabProps {
  enrolledStudents: Student[];
  availableStudents: Student[];
  showEnrollModal: boolean;
  setShowEnrollModal: (show: boolean) => void;
  onEnroll: (studentId: string) => void;
  onUnenroll: (studentId: string) => void;
}

function StudentsTab({
  enrolledStudents,
  availableStudents,
  showEnrollModal,
  setShowEnrollModal,
  onEnroll,
  onUnenroll
}: StudentsTabProps) {
  return (
    <div>
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
                  <button className="btn btn-danger" onClick={() => onUnenroll(s.id)}>
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
                        <button className="btn btn-primary" onClick={() => onEnroll(s.id)}>
                          Enroll
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setShowEnrollModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface GradesTabProps {
  tests: Test[];
  enrolledStudents: Student[];
  resultsMap: Record<string, Record<string, string>>;
  onGradeChange: (studentId: string, testId: string, goal: string) => void;
  classId: string;
}

function GradesTab({
  tests,
  enrolledStudents,
  resultsMap,
  onGradeChange,
  classId
}: GradesTabProps) {
  if (tests.length === 0) {
    return (
      <div className="empty">
        No tests defined. 
        <Link to={`/classes/${classId}/tests`}> Create tests</Link> first.
      </div>
    );
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Student</th>
          {tests.map(t => <th key={t.id}>{t.name}</th>)}
        </tr>
      </thead>
      <tbody>
        {enrolledStudents.length === 0 ? (
          <tr>
            <td colSpan={tests.length + 1} className="empty">No students enrolled</td>
          </tr>
        ) : (
          enrolledStudents.map(s => (
            <tr key={s.id}>
              <td>{s.name}</td>
              {tests.map(t => (
                <td key={t.id}>
                  <select
                    className={`cell-select ${resultsMap[s.id]?.[t.id] || ''}`}
                    value={resultsMap[s.id]?.[t.id] || ''}
                    onChange={e => onGradeChange(s.id, t.id, e.target.value)}
                  >
                    <option value="">-</option>
                    <option value="MANA">MANA</option>
                    <option value="MPA">MPA</option>
                    <option value="MA">MA</option>
                  </select>
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
import { use, Suspense, useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getClass,
  getClassTests,
  createClassTest,
  deleteClassTest,
  type Class,
  type Test
} from '../api/classes';

export function ClassTestsPage() {
  const { id } = useParams<{ id: string }>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [newTestName, setNewTestName] = useState('');

  const classPromise = useMemo(() => getClass(id!), [id]);
  const testsPromise = useMemo(() => getClassTests(id!), [id, refreshKey]);

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  const handleAddTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestName.trim()) return;
    try {
      await createClassTest(id!, newTestName);
      setNewTestName('');
      handleRefresh();
    } catch {
      alert('Error adding test');
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm('Delete this test? All grades for this test will be removed.')) return;
    try {
      await deleteClassTest(id!, testId);
      handleRefresh();
    } catch {
      alert('Error deleting test');
    }
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClassTestsContent
        classPromise={classPromise}
        testsPromise={testsPromise}
        newTestName={newTestName}
        setNewTestName={setNewTestName}
        onAddTest={handleAddTest}
        onDeleteTest={handleDeleteTest}
        classId={id!}
      />
    </Suspense>
  );
}

interface ClassTestsContentProps {
  classPromise: Promise<Class>;
  testsPromise: Promise<Test[]>;
  newTestName: string;
  setNewTestName: (name: string) => void;
  onAddTest: (e: React.FormEvent) => void;
  onDeleteTest: (testId: string) => void;
  classId: string;
}

function ClassTestsContent({
  classPromise,
  testsPromise,
  newTestName,
  setNewTestName,
  onAddTest,
  onDeleteTest,
  classId
}: ClassTestsContentProps) {
  const cls = use(classPromise);
  const tests = use(testsPromise);

  return (
    <div>
      <div className="toolbar">
        <h1>{cls.topic} ({cls.year}.{cls.semester}) - Tests</h1>
        <Link to={`/classes/${classId}`} className="btn btn-secondary">Back to Class</Link>
      </div>

      <form onSubmit={onAddTest} style={{ marginBottom: '20px', display: 'flex', gap: '8px' }}>
        <input
          value={newTestName}
          onChange={e => setNewTestName(e.target.value)}
          placeholder="New test name"
          style={{ width: '200px' }}
        />
        <button type="submit" className="btn btn-primary">Add Test</button>
      </form>

      {tests.length === 0 ? (
        <div className="empty">No tests defined. Add a test above.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Test Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tests.map(t => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td className="actions">
                  <button
                    className="btn btn-danger"
                    onClick={() => onDeleteTest(t.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  getClass, getClassStudents, getClassTests, getClassResults, 
  createClassTest, deleteClassTest, setClassResult, deleteClassResult,
  Class, Student, Test 
} from '../api/classes';

export function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [cls, setCls] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [results, setResults] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);
  const [newTest, setNewTest] = useState('');

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [clsData, studentsData, testsData, resultsData] = await Promise.all([
        getClass(id!),
        getClassStudents(id!),
        getClassTests(id!),
        getClassResults(id!)
      ]);
      setCls(clsData);
      setStudents(studentsData);
      setTests(testsData);
      
      const resultsMap: Record<string, Record<string, string>> = {};
      for (const row of resultsData.data) {
        resultsMap[row.student.id] = row.results;
      }
      setResults(resultsMap);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTest.trim()) return;
    try {
      await createClassTest(id!, newTest);
      setNewTest('');
      loadData();
    } catch {
      alert('Error adding test');
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm('Delete this test?')) return;
    try {
      await deleteClassTest(id!, testId);
      loadData();
    } catch {
      alert('Error deleting test');
    }
  };

  const handleGoalChange = async (studentId: string, testId: string, goal: string) => {
    try {
      if (goal === '') {
        await deleteClassResult(id!, studentId, testId);
      } else {
        const test = tests.find(t => t.id === testId);
        if (!test) return;
        await setClassResult(id!, studentId, testId, goal);
      }
      loadData();
    } catch {
      alert('Error saving result');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!cls) return <div>Class not found</div>;

  return (
    <div>
      <div className="toolbar">
        <h1>{cls.topic} ({cls.year}.{cls.semester})</h1>
        <Link to="/classes" className="btn btn-secondary">Back to Classes</Link>
      </div>

      <form onSubmit={handleAddTest} style={{ marginBottom: '20px', display: 'flex', gap: '8px' }}>
        <input 
          value={newTest} 
          onChange={e => setNewTest(e.target.value)} 
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
              <th>Student</th>
              {tests.map(t => (
                <th key={t.id}>
                  {t.name}
                  <button 
                    className="btn btn-danger" 
                    style={{ marginLeft: '8px', padding: '2px 6px', fontSize: '12px' }}
                    onClick={() => handleDeleteTest(t.id)}
                  >
                    ×
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={tests.length + 1} className="empty">No students enrolled</td>
              </tr>
            ) : (
              students.map(s => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  {tests.map(t => (
                    <td key={t.id}>
                      <select
                        className={`cell-select ${results[s.id]?.[t.id] || ''}`}
                        value={results[s.id]?.[t.id] || ''}
                        onChange={e => handleGoalChange(s.id, t.id, e.target.value)}
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
      )}
    </div>
  );
}
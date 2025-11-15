import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { db } from './firebase.js';
import {
  collection, addDoc, getDocs, deleteDoc, doc,
  query, where, onSnapshot, updateDoc
} from 'firebase/firestore';

const TEXT = {
  appName: "School Step to Success",
  tagline: "Навчайся англійською мові з нами!",
  mainButton: "Let's jump into learning",
  menuTitle: "Menu",
  backToHome: "Back to Home",
  backToMenu: "Back to Menu",
  loginTitle: "Login",
  username: "Username",
  password: "Password",
  loginBtn: "Login",
  createAccount: "Create Student Account",
  signupTitle: "Create Student Account",
  signupBtn: "Sign Up",
  logout: "Logout",
  wrongCred: "Wrong username or password!",
  userExists: "Username already taken!",
  gradeTitle: "Grades",
  addGrade: "Add Grade",
  chooseStudent: "Choose student",
  reasonLabel: "Reason (e.g. Present Simple 1)",
  submitGrade: "Submit",
  noGrades: "No grades yet.",
  yourGrades: "Your Grades",
  deleteBtn: "Delete",
  recordedLessons: "Recorded Lessons",
  createUnit: "Create Unit",
  unitName: "Unit Name (e.g. Unit 1: Present Simple)",
  videosInUnit: "How many videos in this unit?",
  createUnitBtn: "Create Unit",
  addVideo: "Add Video",
  videoTitle: "Video Title",
  videoLink: "YouTube Link (or leave empty to upload file)",
  addVideoBtn: "Add Video",
  noUnits: "No units created yet.",
  watchVideo: "Watch Video",
  unitProgress: "Unit Progress",
  deleteUnit: "Delete Unit",
};

const COLLECTIONS = {
  users: 'users',
  grades: 'grades',
  units: 'units',
  watched: 'watched',
};

let currentUser = null;
let users = [];

const FirebaseDB = {
  async save(col, data, id = null) {
    if (id) {
      await updateDoc(doc(db, col, id), data);
    } else {
      await addDoc(collection(db, col), data);
    }
  },
  async load(col) {
    const snap = await getDocs(collection(db, col));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  onSnapshot(col, cb) {
    return onSnapshot(collection(db, col), snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  },
  onSnapshotWhere(col, field, op, value, cb) {
    const q = query(collection(db, col), where(field, op, value));
    return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  },
  async delete(col, id) {
    await deleteDoc(doc(db, col, id));
  },
};

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      currentUser = { username: user.username, role: user.role };
      navigate('/menu');
    } else {
      setError(TEXT.wrongCred);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{TEXT.loginTitle}</h1>
      <form onSubmit={handleLogin} style={styles.loginForm}>
        <input type="text" placeholder={TEXT.username} value={username} onChange={e => setUsername(e.target.value)} style={styles.input} required />
        <input type="password" placeholder={TEXT.password} value={password} onChange={e => setPassword(e.target.value)} style={styles.input} required />
        <button type="submit" style={styles.mainButton}>{TEXT.loginBtn}</button>
      </form>
      {error && <p style={styles.error}>{error}</p>}
      <button style={styles.createBtn} onClick={() => navigate('/signup')}>{TEXT.createAccount}</button>
    </div>
  );
}

function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (users.some(u => u.username === username)) {
      setError(TEXT.userExists);
      return;
    }
    const newUser = { username, password, role: "student" };
    await FirebaseDB.save(COLLECTIONS.users, newUser);
    currentUser = { username, role: "student" };
    navigate('/menu');
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{TEXT.signupTitle}</h1>
      <form onSubmit={handleSignup} style={styles.loginForm}>
        <input type="text" placeholder="Choose username" value={username} onChange={e => setUsername(e.target.value)} style={styles.input} required />
        <input type="password" placeholder="Choose password" value={password} onChange={e => setPassword(e.target.value)} style={styles.input} required />
        <button type="submit" style={styles.mainButton}>{TEXT.signupBtn}</button>
      </form>
      {error && <p style={styles.error}>{error}</p>}
      <button style={styles.backBtn} onClick={() => navigate('/login')}>Back to Login</button>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  useEffect(() => {
    if (!currentUser) navigate('/login');
  }, []);
  if (!currentUser) return null;
  return (
    <>
      <button style={styles.logoutBtn} onClick={() => {
        currentUser = null;
        navigate('/login');
      }}>{TEXT.logout}</button>
      {children}
    </>
  );
}

function HomePage() {
  const navigate = useNavigate();
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{TEXT.appName}</h1>
      <p style={styles.description}>{TEXT.tagline}</p>
      <p style={styles.roleInfo}>Logged in as: <strong>{currentUser.role.toUpperCase()}</strong></p>
      <button style={styles.mainButton} onClick={() => navigate('/menu')}>{TEXT.mainButton}</button>
    </div>
  );
}

function MenuPage() {
  const navigate = useNavigate();
  const sections = [
    { title: "Grades", path: "/grades" },
    { title: "Recorded Lessons", path: "/recorded-lessons" },
  ];
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{TEXT.menuTitle}</h1>
      <div style={styles.grid}>
        {sections.map(s => (
          <div key={s.path} style={styles.circleWrapper} onClick={() => navigate(s.path)}>
            <div style={styles.circle} />
            <p style={styles.circleLabel}>{s.title}</p>
          </div>
        ))}
      </div>
      <button style={styles.backButton} onClick={() => navigate('/')}>{TEXT.backToHome}</button>
    </div>
  );
}

function GradesPage() {
  const navigate = useNavigate();
  const [student, setStudent] = useState('');
  const [grade, setGrade] = useState('12');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [allGrades, setAllGrades] = useState([]);

  useEffect(() => {
    const unsub = FirebaseDB.onSnapshot(COLLECTIONS.grades, setAllGrades);
    return () => unsub();
  }, []);

  const submitGrade = async (e) => {
    e.preventDefault();
    if (!student || !grade || !date || !reason) return;
    await FirebaseDB.save(COLLECTIONS.grades, { student, grade: Number(grade), date, reason });
    setStudent(''); setGrade('12'); setReason('');
  };

  const deleteGrade = async (id) => {
    if (!window.confirm('Delete?')) return;
    await FirebaseDB.delete(COLLECTIONS.grades, id);
  };

  const myGrades = currentUser.role === 'student'
    ? allGrades.filter(g => g.student === currentUser.username)
    : allGrades;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{TEXT.gradeTitle}</h1>

      {currentUser.role === 'teacher' && (
        <div style={styles.teacherPanel}>
          <form onSubmit={submitGrade} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <select value={student} onChange={e => setStudent(e.target.value)} style={styles.select} required>
              <option value="">{TEXT.chooseStudent}</option>
              {users.filter(u => u.role === 'student').map(u => <option key={u.username} value={u.username}>{u.username}</option>)}
            </select>
            <select value={grade} onChange={e => setGrade(e.target.value)} style={styles.select} required>
              {Array.from({ length: 12 }, (_, i) => <option key={i} value={String(12 - i)}>{12 - i}</option>)}
            </select>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={styles.input} required />
            <input type="text" placeholder={TEXT.reasonLabel} value={reason} onChange={e => setReason(e.target.value)} style={styles.input} required />
            <button type="submit" style={styles.assignBtn}>{TEXT.submitGrade}</button>
          </form>
        </div>
      )}

      <div style={styles.studentView}>
        <h3>{currentUser.role === 'teacher' ? 'All Grades' : TEXT.yourGrades}</h3>
        {myGrades.length === 0 ? <p>{TEXT.noGrades}</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myGrades.sort((a, b) => b.date.localeCompare(a.date)).map(g => (
              <div key={g.id} style={styles.gradeIsland}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.6rem' }}>{g.grade}</div>
                    <div>{g.student} – {new Date(g.date).toLocaleDateString()}</div>
                    <div style={{ fontStyle: 'italic', color: '#777' }}>{g.reason}</div>
                  </div>
                  {currentUser.role === 'teacher' && (
                    <button onClick={() => deleteGrade(g.id)} style={styles.deleteBtn}>{TEXT.deleteBtn}</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button style={styles.backButton} onClick={() => navigate('/menu')}>{TEXT.backToMenu}</button>
    </div>
  );
}

function RecordedLessonsPage() {
  const navigate = useNavigate();
  const [units, setUnits] = useState([]);
  const [watched, setWatched] = useState([]);
  const [showCreateUnit, setShowCreateUnit] = useState(false);
  const [unitName, setUnitName] = useState('');
  const [videoCount, setVideoCount] = useState('3');
  const [editingUnit, setEditingUnit] = useState(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [videoFile, setVideoFile] = useState(null);

  useEffect(() => {
    const unsubUnits = FirebaseDB.onSnapshot(COLLECTIONS.units, setUnits);
    const unsubWatched = FirebaseDB.onSnapshotWhere(COLLECTIONS.watched, 'username', '==', currentUser.username, setWatched);
    return () => { unsubUnits(); unsubWatched(); };
  }, []);

  const createUnit = async () => {
    if (!unitName.trim() || !videoCount) return;
    await FirebaseDB.save(COLLECTIONS.units, { name: unitName, totalVideos: Number(videoCount), videos: [] });
    setUnitName(''); setVideoCount('3'); setShowCreateUnit(false);
  };

  const deleteUnit = async (id) => {
    if (!window.confirm('Delete unit?')) return;
    await FirebaseDB.delete(COLLECTIONS.units, id);
  };

  const addVideo = async (unitId) => {
    const unit = units.find(u => u.id === unitId);
    if (unit.videos.length >= unit.totalVideos) return alert('Max videos reached');
    if (!videoTitle.trim()) return;

    let src = videoLink.trim();
    if (videoFile) src = URL.createObjectURL(videoFile);

    const newVideo = { id: Date.now(), title: videoTitle, src };
    const updatedVideos = [...unit.videos, newVideo];
    await FirebaseDB.save(COLLECTIONS.units, { videos: updatedVideos }, unitId);
    setVideoTitle(''); setVideoLink(''); setVideoFile(null); setEditingUnit(null);
  };

  const markWatched = async (videoId) => {
    if (currentUser.role !== 'student') return;
    if (watched.some(w => w.videoId === videoId)) return;
    await FirebaseDB.save(COLLECTIONS.watched, { username: currentUser.username, videoId });
  };

  const getProgress = (unit) => {
    const watchedInUnit = unit.videos.filter(v => watched.some(w => w.videoId === v.id)).length;
    return Math.round((watchedInUnit / unit.totalVideos) * 100);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{TEXT.recordedLessons}</h1>

      {currentUser.role === 'teacher' && (
        <div style={styles.teacherPanel}>
          <button style={styles.assignBtn} onClick={() => setShowCreateUnit(!showCreateUnit)}>
            {showCreateUnit ? 'Cancel' : TEXT.createUnit}
          </button>
          {showCreateUnit && (
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder={TEXT.unitName} value={unitName} onChange={e => setUnitName(e.target.value)} style={styles.input} />
              <select value={videoCount} onChange={e => setVideoCount(e.target.value)} style={styles.select}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} videos</option>)}
              </select>
              <button style={styles.assignBtn} onClick={createUnit}>{TEXT.createUnitBtn}</button>
            </div>
          )}
        </div>
      )}

      {units.length === 0 ? <p style={{ color: '#777' }}>{TEXT.noUnits}</p> : (
        <div style={{ maxWidth: '600px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {units.map(unit => {
            const progress = getProgress(unit);
            return (
              <div key={unit.id} style={styles.unitCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0 }}>{unit.name}</h3>
                  {currentUser.role === 'teacher' && <button onClick={() => deleteUnit(unit.id)} style={styles.deleteBtn}>{TEXT.deleteUnit}</button>}
                </div>
                <div style={{ margin: '12px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span>{TEXT.unitProgress}</span>
                    <span>{progress}%</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#ddd', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, backgroundColor: progress === 100 ? '#27ae60' : '#3498db' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {unit.videos?.map(video => {
                    const isWatched = watched.some(w => w.videoId === video.id);
                    return (
                      <div key={video.id} style={styles.videoItem}>
                        <strong>{video.title}</strong>
                        {currentUser.role === 'student' ? (
                          <button style={{ ...styles.chooseBtn, backgroundColor: isWatched ? '#27ae60' : '#3498db' }}
                            onClick={() => { markWatched(video.id); window.open(video.src, '_blank'); }}>
                            {isWatched ? 'Rewatch' : TEXT.watchVideo}
                          </button>
                        ) : (
                          <a href={video.src} target="_blank" rel="noopener noreferrer" style={styles.chooseBtn}>Open</a>
                        )}
                      </div>
                    );
                  }) || <p>No videos yet.</p>}
                </div>
                {currentUser.role === 'teacher' && unit.videos?.length < unit.totalVideos && (
                  <div style={{ marginTop: '16px' }}>
                    <button style={styles.assignBtn} onClick={() => setEditingUnit(unit.id)}>{TEXT.addVideo}</button>
                    {editingUnit === unit.id && (
                      <div style={{ marginTop: '12px', gap: '10px', display: 'flex', flexDirection: 'column' }}>
                        <input type="text" placeholder={TEXT.videoTitle} value={videoTitle} onChange={e => setVideoTitle(e.target.value)} style={styles.input} />
                        <input type="text" placeholder={TEXT.videoLink} value={videoLink} onChange={e => setVideoLink(e.target.value)} style={styles.input} />
                        <input type="file" accept="video/mp4" onChange={e => setVideoFile(e.target.files[0])} style={{ ...styles.input, padding: '8px' }} />
                        <button style={styles.assignBtn} onClick={() => addVideo(unit.id)}>{TEXT.addVideoBtn}</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button style={styles.backButton} onClick={() => navigate('/menu')}>{TEXT.backToMenu}</button>
    </div>
  );
}

function App() {
  useEffect(() => {
    const loadInitial = async () => {
      users = await FirebaseDB.load(COLLECTIONS.users);
      if (users.length === 0) {
        await FirebaseDB.save(COLLECTIONS.users, { username: "teacher", password: "pass123", role: "teacher" });
        users = await FirebaseDB.load(COLLECTIONS.users);
      }
    };
    loadInitial();
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/menu" element={<ProtectedRoute><MenuPage /></ProtectedRoute>} />
      <Route path="/grades" element={<ProtectedRoute><GradesPage /></ProtectedRoute>} />
      <Route path="/recorded-lessons" element={<ProtectedRoute><RecordedLessonsPage /></ProtectedRoute>} />
    </Routes>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f7fb', padding: '20px', fontFamily: 'Arial, sans-serif' },
  title: { fontSize: '2.5rem', color: '#2c3e50', marginBottom: '24px' },
  description: { fontSize: '1.1rem', color: '#555', marginBottom: '40px', maxWidth: '600px', textAlign: 'center' },
  mainButton: { backgroundColor: '#3498db', color: 'white', fontSize: '1.2rem', padding: '14px 32px', border: 'none', borderRadius: '50px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', maxWidth: '400px', width: '100%', marginBottom: '40px' },
  circleWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' },
  circle: { width: '140px', height: '140px', backgroundColor: '#3498db', borderRadius: '50%', marginBottom: '12px', boxShadow: '0 6px 16px rgba(52,152,219,0.3)' },
  circleLabel: { color: '#2c3e50', fontSize: '1rem', fontWeight: '600', textAlign: 'center', margin: 0 },
  backButton: { backgroundColor: '#95a5a6', color: 'white', padding: '10px 24px', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '1rem' },
  logoutBtn: { position: 'absolute', top: '20px', right: '20px', background: '#e74c3c', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '20px', fontSize: '0.9rem', cursor: 'pointer' },
  loginForm: { display: 'flex', flexDirection: 'column', gap: '14px', width: '280px', margin: '20px 0' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' },
  error: { color: '#e74c3c', fontWeight: 'bold', marginTop: '10px' },
  createBtn: { backgroundColor: '#27ae60', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', marginTop: '15px', cursor: 'pointer', width: '280px' },
  backBtn: { backgroundColor: '#95a5a6', color: 'white', padding: '10px', border: 'none', borderRadius: '8px', marginTop: '15px', cursor: 'pointer' },
  roleInfo: { fontSize: '1.1rem', color: '#27ae60', fontWeight: 'bold', margin: '10px 0' },
  teacherPanel: { backgroundColor: '#2c3e50', color: '#fff', padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '500px', margin: '20px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
  assignBtn: { backgroundColor: '#27ae60', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' },
  studentView: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '500px', margin: '20px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  select: { padding: '10px', borderRadius: '8px', marginBottom: '10px', width: '100%', backgroundColor: '#34495e', color: '#fff' },
  chooseBtn: { backgroundColor: '#3498db', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '0.9rem' },
  deleteBtn: { backgroundColor: '#e74c3c', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '0.9rem' },
  unitCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  videoItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px' },
  gradeIsland: { backgroundColor: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
};

export default App;
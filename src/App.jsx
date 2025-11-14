import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

 import { initializeApp } from 'firebase/app';

 // TODO: Replace the following with your app's Firebase configuration
 const firebaseConfig = {
   //...
 };

 const app = initializeApp(firebaseConfig);

/* ========================================
   1. TEXT & DATA
   ======================================== */
const TEXT = {
  appName: "School Step to Success",
  tagline: "Навчайся англійській мові з нами!",
  mainButton: "Let’s jump into learning",
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
  assignHomework: "Assign Homework",
  noHomework: "No homework assigned yet.",
  chooseBtn: "Choose",
  deleteBtn: "Delete",
  calendarTitle: "Teacher Schedule",
  available: "Available",
  busy: "Busy",
  noSlots: "No time set",
  gradeTitle: "Grades",
  addGrade: "Add Grade",
  chooseStudent: "Choose student",
  gradeLabel: "Grade (12-1)",
  dateLabel: "Date",
  reasonLabel: "Reason (e.g. Present Simple 1)",
  submitGrade: "Submit",
  noGrades: "No grades yet.",
  yourGrades: "Your Grades",
  // --- ONLINE LESSONS ---
  onlineLessons: "Online Lessons",
  assignLink: "Assign Lesson Link",
  chooseStudentOrAll: "Choose student (or All)",
  linkPlaceholder: "Paste Zoom/Meet link here...",
  assignLinkBtn: "Assign Link",
  noLinksYet: "No online lessons scheduled yet.",
  yourLink: "Your Lesson Link",
  joinNow: "Join Lesson",
  allStudents: "All Students",
  // --- RECORDED LESSONS ---
  recordedLessons: "Recorded Lessons",
  createUnit: "Create Unit",
  unitName: "Unit Name (e.g. Unit 1: Present Simple)",
  videosInUnit: "How many videos in this unit?",
  createUnitBtn: "Create Unit",
  addVideo: "Add Video",
  videoTitle: "Video Title",
  videoLink: "YouTube Link (or leave empty to upload file)",
  uploadVideo: "Upload MP4 File",
  addVideoBtn: "Add Video",
  noUnits: "No units created yet.",
  watchVideo: "Watch Video",
  unitProgress: "Unit Progress",
  completed: "Completed",
  watched: "Watched",
  editUnit: "Edit",
  deleteUnit: "Delete Unit",
};

/* ========================================
   2. LOCAL DATABASE
   ======================================== */
const DB = {
  save(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
  load(key, defaultValue = null) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  },
};

/* ========================================
   3. USERS & AUTH
   ======================================== */
let users = DB.load('users', [
  { username: "teacher", password: "pass123", role: "teacher" }
]);
let currentUser = DB.load('currentUser');
let grades = DB.load('grades', []);
let onlineLessons = DB.load('onlineLessons', []);
let units = DB.load('units', []);

// Validate currentUser
if (currentUser && !users.some(u => u.username === currentUser.username)) {
  currentUser = null;
  DB.save('currentUser', null);
}

/* ========================================
   4. LOGIN PAGE
   ======================================== */
function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      const { password, ...safeUser } = user;
      currentUser = safeUser;
      DB.save('currentUser', safeUser);
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

/* ========================================
   5. SIGNUP PAGE
   ======================================== */
function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    setError('');
    if (users.some(u => u.username === username)) {
      setError(TEXT.userExists);
      return;
    }
    const newUser = { username, password, role: "student" };
    users.push(newUser);
    DB.save('users', users);
    const { password: _, ...safeUser } = newUser;
    currentUser = safeUser;
    DB.save('currentUser', safeUser);
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

/* ========================================
   6. PROTECTED ROUTE
   ======================================== */
function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  if (!currentUser) return <LoginPage />;
  return (
    <>
      <button style={styles.logoutBtn} onClick={() => {
        currentUser = null;
        DB.save('currentUser', null);
        navigate('/login');
      }}>{TEXT.logout}</button>
      {children}
    </>
  );
}

/* ========================================
   7. HOME PAGE
   ======================================== */
function HomePage() {
  const navigate = useNavigate();
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{TEXT.appName}</h1>
      <p style={styles.description}>{TEXT.tagline}</p>
      <p style={styles.roleInfo}>
        Logged in as: <strong>{currentUser.role.toUpperCase()}</strong>
        {currentUser.role === 'student' && ` (${currentUser.username})`}
      </p>
      <button style={styles.mainButton} onClick={() => navigate('/menu')}>{TEXT.mainButton}</button>
    </div>
  );
}

/* ========================================
   8. MENU PAGE
   ======================================== */
function MenuPage() {
  const navigate = useNavigate();
  const sections = [
    { title: "Online Lessons", path: "/online-lessons" },
    { title: "Homework", path: "/homework" },
    { title: "Grades", path: "/grades" },
    { title: "Recorded Lessons", path: "/recorded-lessons" },
    { title: "Calendar", path: "/calendar" },
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

/* ========================================
   9. HOMEWORK PAGE
   ======================================== */
function HomeworkPage() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState(DB.load('assignments', []));
  const [input, setInput] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [myHomework, setMyHomework] = useState(DB.load(`homework_${currentUser.username}`, ''));

  const students = users.filter(u => u.role === 'student');

  const assignHomework = () => {
    if (!input || !selectedStudent) return;
    const newAssign = { id: Date.now(), text: input, student: selectedStudent };
    const updated = [...assignments, newAssign];
    DB.save('assignments', updated);
    setAssignments(updated);
    setInput('');
  };

  const choose = (assign) => {
    DB.save(`homework_${currentUser.username}`, assign.text);
    setMyHomework(assign.text);
  };

  const deleteAssign = (id) => {
    const updated = assignments.filter(a => a.id !== id);
    DB.save('assignments', updated);
    setAssignments(updated);
  };

  const availableAssignments = assignments.filter(a => !a.student || a.student === currentUser.username);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Homework</h1>
      {currentUser.role === 'teacher' ? (
        <div style={styles.teacherPanel}>
          <h3>{TEXT.assignHomework}</h3>
          <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} style={styles.select}>
            <option value="">Select student</option>
            {students.map(s => <option key={s.username} value={s.username}>{s.username}</option>)}
          </select>
          <textarea placeholder="Write assignment..." value={input} onChange={e => setInput(e.target.value)} style={styles.textarea} />
          <button style={styles.assignBtn} onClick={assignHomework}>Assign</button>
          <h4 style={{ marginTop: '30px' }}>All Assignments</h4>
          {assignments.length === 0 ? <p>No assignments yet.</p> : (
            <div>
              {assignments.map(a => (
                <div key={a.id} style={styles.assignItem}>
                  <p><strong>{a.student || 'All'}:</strong> {a.text}</p>
                  <button style={styles.deleteBtn} onClick={() => deleteAssign(a.id)}>{TEXT.deleteBtn}</button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={styles.studentView}>
          <h3>Your Current Homework</h3>
          <p style={styles.homeworkText}>{myHomework || TEXT.noHomework}</p>
          <h4>Available Homework</h4>
          {availableAssignments.length === 0 ? <p>No homework available.</p> : (
            <div>
              {availableAssignments.map(a => (
                <div key={a.id} style={styles.assignItem}>
                  <p>{a.text}</p>
                  <button style={styles.chooseBtn} onClick={() => choose(a)}>{TEXT.chooseBtn}</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <button style={styles.backButton} onClick={() => navigate('/menu')}>{TEXT.backToMenu}</button>
    </div>
  );
}

/* ========================================
   10. CALENDAR PAGE
   ======================================== */
function CalendarPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [schedule, setSchedule] = useState(DB.load('schedule', {}));
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const timeSlots = [];
  for (let h = 8; h <= 23; h++) {
    timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
    if (h < 23) timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
  }

  const toggleSlot = (date, time) => {
    const dateKey = date.toISOString().split('T')[0];
    const newSchedule = { ...schedule };
    if (!newSchedule[dateKey]) newSchedule[dateKey] = {};
    newSchedule[dateKey][time] = !newSchedule[dateKey][time];
    DB.save('schedule', newSchedule);
    setSchedule(newSchedule);
  };

  const getSlots = (date) => {
    const dateKey = date.toISOString().split('T')[0];
    return schedule[dateKey] || {};
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{TEXT.calendarTitle}</h1>
      <div style={styles.calendarGrid}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={styles.dayHeader}>{day}</div>
        ))}
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`empty-${i}`} style={styles.emptyCell} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const date = new Date(year, month, i + 1);
          const dateKey = date.toISOString().split('T')[0];
          const hasAvailable = schedule[dateKey] && Object.values(schedule[dateKey]).some(v => v);
          const hasBusy = schedule[dateKey] && Object.values(schedule[dateKey]).some(v => !v);
          return (
            <div
              key={i}
              style={{
                ...styles.calendarCell,
                backgroundColor: hasAvailable ? '#27ae60' : hasBusy ? '#e74c3c' : '#fff',
                color: hasAvailable || hasBusy ? 'white' : '#2c3e50',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedDate(date)}
            >
              {i + 1}
            </div>
          );
        })}
      </div>
      {selectedDate && (
        <div style={styles.modal}>
          <h3>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
          {currentUser.role === 'teacher' ? (
            <div style={styles.darkPanel}>
              <p style={{ margin: '0 0 10px', color: '#fff' }}>Set availability:</p>
              <div style={styles.timeGrid}>
                {timeSlots.map(time => {
                  const slots = getSlots(selectedDate);
                  const isAvailable = slots[time];
                  return (
                    <button
                      key={time}
                      style={{
                        ...styles.timeBtnDark,
                        backgroundColor: isAvailable === true ? '#27ae60' : isAvailable === false ? '#e74c3c' : '#555',
                      }}
                      onClick={() => toggleSlot(selectedDate, time)}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <p>Teacher is:</p>
              {timeSlots.map(time => {
                const slots = getSlots(selectedDate);
                const status = slots[time];
                return status !== undefined ? (
                  <p key={time} style={{ color: status ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>
                    {time}: {status ? TEXT.available : TEXT.busy}
                  </p>
                ) : null;
              })}
              {timeSlots.every(t => getSlots(selectedDate)[t] === undefined) && <p>{TEXT.noSlots}</p>}
            </div>
          )}
          <button style={styles.closeBtn} onClick={() => setSelectedDate(null)}>Close</button>
        </div>
      )}
      <button style={styles.backButton} onClick={() => navigate('/menu')}>
        {TEXT.backToMenu}
      </button>
    </div>
  );
}

/* ========================================
   11. ONLINE LESSONS PAGE
   ======================================== */
function OnlineLessonsPage() {
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState('');
  const [link, setLink] = useState('');
  const [lessons, setLessons] = useState(DB.load('onlineLessons', []));
  const students = users.filter(u => u.role === 'student');

  const assignLink = (e) => {
    e.preventDefault();
    if (!link.trim() || !selectedStudent) return;

    const newLesson = {
      id: Date.now(),
      student: selectedStudent === 'all' ? null : selectedStudent,
      link: link.trim(),
      date: new Date().toISOString().split('T')[0],
    };

    const updated = [...lessons, newLesson];
    DB.save('onlineLessons', updated);
    setLessons(updated);
    setLink('');
    setSelectedStudent('');
  };

  const deleteLesson = (id) => {
    if (!window.confirm('Delete this lesson link?')) return;
    const updated = lessons.filter(l => l.id !== id);
    DB.save('onlineLessons', updated);
    setLessons(updated);
  };

  const visibleLessons = currentUser.role === 'teacher'
    ? lessons
    : lessons.filter(l => !l.student || l.student === currentUser.username);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{TEXT.onlineLessons}</h1>

      {currentUser.role === 'teacher' && (
        <div style={styles.teacherPanel}>
          <h3>{TEXT.assignLink}</h3>
          <form onSubmit={assignLink} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <select
              value={selectedStudent}
              onChange={e => setSelectedStudent(e.target.value)}
              style={styles.select}
              required
            >
              <option value="">{TEXT.chooseStudentOrAll}</option>
              <option value="all">{TEXT.allStudents}</option>
              {students.map(s => (
                <option key={s.username} value={s.username}>{s.username}</option>
              ))}
            </select>
            <input
              type="url"
              placeholder={TEXT.linkPlaceholder}
              value={link}
              onChange={e => setLink(e.target.value)}
              style={styles.input}
              required
            />
            <button type="submit" style={styles.assignBtn}>{TEXT.assignLinkBtn}</button>
          </form>

          <h4 style={{ marginTop: '30px' }}>All Assigned Links</h4>
          {lessons.length === 0 ? (
            <p style={{ color: '#aaa' }}>No links assigned yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {lessons.map(l => (
                <div key={l.id} style={styles.assignItem}>
                  <div>
                    <strong>{l.student ? l.student : TEXT.allStudents}</strong>
                    <span style={{ color: '#95a5a6', fontSize: '0.8rem', marginLeft: '8px' }}>
                      {new Date(l.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ margin: '6px 0', wordBreak: 'break-all', fontSize: '0.9rem' }}>
                    {l.link}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a
                      href={l.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ ...styles.chooseBtn, textDecoration: 'none', fontSize: '0.8rem' }}
                    >
                      Open
                    </a>
                    <button onClick={() => deleteLesson(l.id)} style={styles.deleteBtn}>
                      {TEXT.deleteBtn}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {currentUser.role === 'student' && (
        <div style={styles.studentView}>
          <h3>{TEXT.yourLink}</h3>
          {visibleLessons.length === 0 ? (
            <p>{TEXT.noLinksYet}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {visibleLessons
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map(l => (
                  <div key={l.id} style={styles.gradeIsland}>
                    <p style={{ margin: '0 0 8px', fontSize: '0.9rem', color: '#555' }}>
                      Assigned on: <strong>{new Date(l.date).toLocaleDateString()}</strong>
                    </p>
                    <a
                      href={l.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        ...styles.mainButton,
                        fontSize: '1rem',
                        padding: '12px 20px',
                        display: 'inline-block',
                        textAlign: 'center',
                        textDecoration: 'none',
                      }}
                    >
                      {TEXT.joinNow}
                    </a>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      <button style={styles.backButton} onClick={() => navigate('/menu')}>
        {TEXT.backToMenu}
      </button>
    </div>
  );
}

/* ========================================
   12. GRADES PAGE — WITH DELETE
   ======================================== */
function GradesPage() {
  const navigate = useNavigate();
  const [student, setStudent] = useState('');
  const [grade, setGrade] = useState('12');
  const [date, setDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [reason, setReason] = useState('');
  const [allGrades, setAllGrades] = useState(DB.load('grades', []));
  const students = users.filter(u => u.role === 'student');

  const submitGrade = (e) => {
    e.preventDefault();
    if (!student || !grade || !date || !reason) return;
    const newGrade = {
      id: Date.now(),
      student,
      grade: Number(grade),
      date,
      reason,
    };
    const updated = [...allGrades, newGrade];
    DB.save('grades', updated);
    setAllGrades(updated);
    setStudent('');
    setGrade('12');
    setDate(() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    setReason('');
  };

  const deleteGrade = (id) => {
    if (!window.confirm('Are you sure you want to delete this grade?')) return;
    const updated = allGrades.filter(g => g.id !== id);
    DB.save('grades', updated);
    setAllGrades(updated);
  };

  const myGrades = currentUser.role === 'student'
    ? allGrades.filter(g => g.student === currentUser.username)
    : allGrades;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{TEXT.gradeTitle}</h1>

      {currentUser.role === 'teacher' && (
        <div style={styles.teacherPanel}>
          <h3>{TEXT.addGrade}</h3>
          <form onSubmit={submitGrade} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <select value={student} onChange={e => setStudent(e.target.value)} style={styles.select} required>
              <option value="">{TEXT.chooseStudent}</option>
              {students.map(s => <option key={s.username} value={s.username}>{s.username}</option>)}
            </select>
            <select value={grade} onChange={e => setGrade(e.target.value)} style={styles.select} required>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={String(12 - i)}>{12 - i}</option>
              ))}
            </select>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={styles.input} required />
            <input
              type="text"
              placeholder={TEXT.reasonLabel}
              value={reason}
              onChange={e => setReason(e.target.value)}
              style={styles.input}
              required
            />
            <button type="submit" style={styles.assignBtn}>{TEXT.submitGrade}</button>
          </form>
          <h4 style={{ marginTop: '30px' }}>All Grades</h4>
        </div>
      )}

      <div style={styles.studentView}>
        <h3>{currentUser.role === 'teacher' ? 'All Grades' : TEXT.yourGrades}</h3>
        {myGrades.length === 0 ? (
          <p>{TEXT.noGrades}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            {myGrades
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(g => (
                <div key={g.id} style={styles.gradeIsland}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '1.6rem', color: '#2c3e50' }}>
                        {g.grade}
                      </div>
                      <div style={{ fontSize: '0.95rem', color: '#555' }}>
                        <strong>{g.student}</strong> – {new Date(g.date).toLocaleDateString()}
                      </div>
                      <div style={{ marginTop: '4px', fontStyle: 'italic', color: '#7f8c8d' }}>
                        {g.reason}
                      </div>
                    </div>
                    {currentUser.role === 'teacher' && (
                      <button onClick={() => deleteGrade(g.id)} style={styles.deleteBtn}>
                        {TEXT.deleteBtn}
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <button style={styles.backButton} onClick={() => navigate('/menu')}>
        {TEXT.backToMenu}
      </button>
    </div>
  );
}

/* ========================================
   13. RECORDED LESSONS PAGE — FULL LMS
   ======================================== */
function RecordedLessonsPage() {
  const navigate = useNavigate();
  const [units, setUnits] = useState(DB.load('units', []));
  const [watched, setWatched] = useState(DB.load(`watched_${currentUser.username}`, []));
  const [showCreateUnit, setShowCreateUnit] = useState(false);
  const [unitName, setUnitName] = useState('');
  const [videoCount, setVideoCount] = useState('3');
  const [editingUnit, setEditingUnit] = useState(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [videoFile, setVideoFile] = useState(null);

  const createUnit = () => {
    if (!unitName.trim() || !videoCount) return;
    const newUnit = {
      id: Date.now(),
      name: unitName,
      totalVideos: Number(videoCount),
      videos: [],
    };
    const updated = [...units, newUnit];
    DB.save('units', updated);
    setUnits(updated);
    setUnitName('');
    setVideoCount('3');
    setShowCreateUnit(false);
  };

  const deleteUnit = (id) => {
    if (!window.confirm('Delete this unit and all videos?')) return;
    const updated = units.filter(u => u.id !== id);
    DB.save('units', updated);
    setUnits(updated);
  };

  const addVideo = (unitId) => {
    const unit = units.find(u => u.id === unitId);
    if (unit.videos.length >= unit.totalVideos) {
      alert(`This unit only allows ${unit.totalVideos} videos.`);
      return;
    }
    if (!videoTitle.trim()) return;

    let src = videoLink.trim();
    if (videoFile) {
      src = URL.createObjectURL(videoFile);
    } else if (src && !src.includes('youtube.com') && !src.includes('youtu.be')) {
      alert('Please use a valid YouTube link or upload an MP4.');
      return;
    }

    const newVideo = {
      id: Date.now(),
      title: videoTitle,
      src,
      isFile: !!videoFile,
    };

    const updatedUnits = units.map(u =>
      u.id === unitId ? { ...u, videos: [...u.videos, newVideo] } : u
    );
    DB.save('units', updatedUnits);
    setUnits(updatedUnits);
    setVideoTitle('');
    setVideoLink('');
    setVideoFile(null);
    setEditingUnit(null);
  };

  const markWatched = (videoId) => {
    if (currentUser.role !== 'student') return;
    if (watched.includes(videoId)) return;

    const updated = [...watched, videoId];
    DB.save(`watched_${currentUser.username}`, updated);
    setWatched(updated);
  };

  const getProgress = (unit) => {
    const watchedInUnit = unit.videos.filter(v => watched.includes(v.id)).length;
    return unit.totalVideos > 0 ? Math.round((watchedInUnit / unit.totalVideos) * 100) : 0;
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{TEXT.recordedLessons}</h1>

      {currentUser.role === 'teacher' && (
        <div style={styles.teacherPanel}>
          <button
            style={styles.assignBtn}
            onClick={() => setShowCreateUnit(!showCreateUnit)}
          >
            {showCreateUnit ? 'Cancel' : TEXT.createUnit}
          </button>

          {showCreateUnit && (
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder={TEXT.unitName}
                value={unitName}
                onChange={e => setUnitName(e.target.value)}
                style={styles.input}
              />
              <select
                value={videoCount}
                onChange={e => setVideoCount(e.target.value)}
                style={styles.select}
              >
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <option key={n} value={n}>{n} videos</option>
                ))}
              </select>
              <button style={styles.assignBtn} onClick={createUnit}>
                {TEXT.createUnitBtn}
              </button>
            </div>
          )}
        </div>
      )}

      {units.length === 0 ? (
        <p style={{ color: '#777' }}>{TEXT.noUnits}</p>
      ) : (
        <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {units.map(unit => {
            const progress = getProgress(unit);
            const isComplete = progress === 100;

            return (
              <div key={unit.id} style={styles.unitCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: '#2c3e50' }}>{unit.name}</h3>
                  {currentUser.role === 'teacher' && (
                    <button
                      onClick={() => deleteUnit(unit.id)}
                      style={styles.deleteBtn}
                    >
                      {TEXT.deleteUnit}
                    </button>
                  )}
                </div>

                <div style={{ margin: '12px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#555' }}>
                    <span>{TEXT.unitProgress}</span>
                    <span>{progress}%</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#ddd', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${progress}%`,
                        backgroundColor: isComplete ? '#27ae60' : '#3498db',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  {isComplete && <p style={{ color: '#27ae60', fontWeight: 'bold', margin: '4px 0 0' }}>Completed</p>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {unit.videos.length === 0 ? (
                    <p style={{ fontStyle: 'italic', color: '#999' }}>No videos yet.</p>
                  ) : (
                    unit.videos.map(video => {
                      const isWatched = watched.includes(video.id);
                      return (
                        <div key={video.id} style={styles.videoItem}>
                          <div style={{ flex: 1 }}>
                            <strong>{video.title}</strong>
                            {isWatched && <span style={{ color: '#27ae60', marginLeft: '8px' }}>Watched</span>}
                          </div>
                          {currentUser.role === 'student' ? (
                            <button
                              style={{
                                ...styles.chooseBtn,
                                backgroundColor: isWatched ? '#27ae60' : '#3498db',
                              }}
                              onClick={() => {
                                markWatched(video.id);
                                window.open(video.src, '_blank');
                              }}
                            >
                              {isWatched ? 'Rewatch' : TEXT.watchVideo}
                            </button>
                          ) : (
                            <a
                              href={video.src}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ ...styles.chooseBtn, textDecoration: 'none' }}
                            >
                              Open
                            </a>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {currentUser.role === 'teacher' && unit.videos.length < unit.totalVideos && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #ccc' }}>
                    <button
                      style={styles.assignBtn}
                      onClick={() => setEditingUnit(unit.id)}
                    >
                      {TEXT.addVideo}
                    </button>
                    {editingUnit === unit.id && (
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input
                          type="text"
                          placeholder={TEXT.videoTitle}
                          value={videoTitle}
                          onChange={e => setVideoTitle(e.target.value)}
                          style={styles.input}
                        />
                        <input
                          type="text"
                          placeholder={TEXT.videoLink}
                          value={videoLink}
                          onChange={e => setVideoLink(e.target.value)}
                          style={styles.input}
                        />
                        <input
                          type="file"
                          accept="video/mp4"
                          onChange={e => setVideoFile(e.target.files[0])}
                          style={{ ...styles.input, padding: '8px' }}
                        />
                        <button
                          style={styles.assignBtn}
                          onClick={() => addVideo(unit.id)}
                        >
                          {TEXT.addVideoBtn}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button style={styles.backButton} onClick={() => navigate('/menu')}>
        {TEXT.backToMenu}
      </button>
    </div>
  );
}

/* ========================================
   14. MAIN APP
   ======================================== */
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/menu" element={<ProtectedRoute><MenuPage /></ProtectedRoute>} />
      <Route path="/online-lessons" element={<ProtectedRoute><OnlineLessonsPage /></ProtectedRoute>} />
      <Route path="/homework" element={<ProtectedRoute><HomeworkPage /></ProtectedRoute>} />
      <Route path="/grades" element={<ProtectedRoute><GradesPage /></ProtectedRoute>} />
      <Route path="/recorded-lessons" element={<ProtectedRoute><RecordedLessonsPage /></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
    </Routes>
  );
}

/* ========================================
   15. STYLES — FULL & FIXED
   ======================================== */
const styles = {
  container: { minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f7fb', padding: '20px', fontFamily: 'Arial, sans-serif' },
  title: { fontSize: '2.5rem', color: '#2c3e50', marginBottom: '24px' },
  description: { fontSize: '1.1rem', color: '#555', marginBottom: '40px', maxWidth: '600px', textAlign: 'center' },
  mainButton: { backgroundColor: '#3498db', color: 'white', fontSize: '1.2rem', fontWeight: 'bold', padding: '14px 32px', border: 'none', borderRadius: '50px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
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
  textarea: { width: '100%', height: '100px', padding: '10px', borderRadius: '8px', border: '1px solid #555', marginBottom: '10px', backgroundColor: '#34495e', color: '#fff' },
  assignBtn: { backgroundColor: '#27ae60', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' },
  studentView: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '500px', margin: '20px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  homeworkText: { fontSize: '1.1rem', color: '#2c3e50', whiteSpace: 'pre-wrap', margin: '0 0 20px' },
  select: { padding: '10px', borderRadius: '8px', marginBottom: '10px', width: '100%', backgroundColor: '#34495e', color: '#fff' },
  assignItem: { backgroundColor: '#34495e', color: '#fff', padding: '12px', borderRadius: '8px', margin: '8px 0', display: 'flex', flexDirection: 'column' },
  chooseBtn: { backgroundColor: '#3498db', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '0.9rem' },
  deleteBtn: { backgroundColor: '#e74c3c', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '0.9rem' },
  calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', maxWidth: '400px', margin: '20px 0' },
  dayHeader: { textAlign: 'center', fontWeight: 'bold', padding: '8px', backgroundColor: '#ecf0f1', borderRadius: '8px' },
  emptyCell: { height: '40px' },
  calendarCell: { height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '8px', fontWeight: 'bold', border: '1px solid #ddd' },
  modal: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', maxWidth: '320px', textAlign: 'center', margin: '20px 0' },
  darkPanel: { backgroundColor: '#2c3e50', padding: '16px', borderRadius: '12px', margin: '10px 0' },
  timeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  timeBtnDark: { padding: '10px', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 'bold', fontSize: '0.9rem' },
  closeBtn: { backgroundColor: '#95a5a6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', marginTop: '15px', cursor: 'pointer' },
  gradeIsland: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: '320px',
    width: '100%',
  },
  unitCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  videoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
};

export default App;
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import './index.css';

const LoginForm = ({ onToggle }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(username, password);
    if (!res.success) setError(res.message);
  };

  return (
    <div className="auth-container">
      <h2>Initial Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          Username (Email):
          <input className="form-input" type="text" value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div className="input-group">
          Password:
          <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn">Login</button>
        <p>
          Don't have an account? <span style={{ color: '#2f7d6d', cursor: 'pointer', fontWeight: 'bold' }} onClick={onToggle}>Sign Up😊</span>
        </p>
      </form>
    </div>
  );
};

const SignupForm = ({ onToggle }) => {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '', // email
    phone: '',
    password: ''
  });
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await signup(formData.username, formData.password); // keeping existing auth logic for username/password
    if (res.success) {
      setMsg({ type: 'success', text: 'Account created! Please login.' });
      setTimeout(onToggle, 2000);
    } else {
      setMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="auth-container">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        First Name:
        <input className="form-input" type="text" name="first_name" onChange={handleChange} required />

        Last Name:
        <input className="form-input" type="text" name="last_name" onChange={handleChange} required />

        Email (Gmail):
        <input className="form-input" type="email" name="username" onChange={handleChange} required />

        OR Phone Number:
        <input className="form-input" type="tel" name="phone" onChange={handleChange} />

        Password:
        <input
          className="form-input"
          type="password"
          name="password"
          onChange={handleChange}
          pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}"
          title="At least 1 uppercase, 1 lowercase, 1 number, min 6 characters"
          required
        />

        {msg.text && <p className={msg.type}>{msg.text}</p>}
        <button type="submit" className="btn">Sign Up</button>
      </form>
      <p>
        Back to login...! <span style={{ color: '#2f7d6d', cursor: 'pointer', fontWeight: 'bold' }} onClick={onToggle}>Login 😊</span>
      </p>
    </div>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [view, setView] = useState('scan');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [foodType, setFoodType] = useState('Turmeric');

  const fetchHistory = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/history/${user.id}`);
      const data = await res.json();
      setHistory(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (view === 'history') fetchHistory();
  }, [view]);

  const compressImage = (base64Str) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // Limit size for speed
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% quality
      };
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result);
        handleScan(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async (imgData) => {
    setImage(imgData);
    setLoading(true);
    setResult(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      console.log("Sending compressed scan request...");
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, image: imgData, food_type: foodType }),
        signal: controller.signal
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Server error");
      }

      console.log("Scan result received:", data);
      setResult(data);
    } catch (e) {
      console.error("Scan error:", e);
      let errorMsg = e.message;
      if (e.name === 'AbortError') {
        errorMsg = "Analysis timed out (60 seconds). Image analysis is complex; please try again with a clearer picture.";
      }
      setResult({
        error: "Analysis Failed",
        report_summary: errorMsg || "Failed to connect to the analysis server. Please check your internet and backend."
      });
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ background: 'var(--bg-main)', minHeight: '100vh', display: 'block' }}>
      <nav>
        <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)' }}>PureScan AI</span>
        <div className="nav-links">
          <span className={view === 'scan' ? 'active' : ''} onClick={() => setView('scan')}>Scan</span>
          <span className={view === 'history' ? 'active' : ''} onClick={() => setView('history')}>History</span>
          <span onClick={logout} className="btn-secondary" style={{ padding: '5px 15px', borderRadius: '5px', cursor: 'pointer', border: '1px solid #ccc' }}>Logout</span>
        </div>
      </nav>

      {view === 'scan' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
          <div style={{ textAlign: 'center', maxWidth: '600px' }}>
            <h3>Welcome to the Food Adulteration Detector</h3>
            <p>How it works:<br />
              1. Select the type of food you want to analyze<br />
              2. Take a clear photo or upload an image<br />
              3. Our AI analyzes for common adulterants<br />
              4. Get instant results with confidence scores
            </p>
          </div>

          <div className="upload-card">
            <div className="icon-large">📷</div>
            <p>Take a photo or upload an image of the food you want to analyze</p>

            <div style={{ width: '100%', marginBottom: '15px' }}>
              <select className="form-input" value={foodType} onChange={e => setFoodType(e.target.value)}>
                <option>Turmeric</option>
                <option>Chili Powder</option>
                <option>Milk</option>
                <option>Ghee</option>
                <option>General</option>
              </select>
            </div>

            <label className="btn" style={{ width: '100%', cursor: 'pointer' }}>
              Open Camera
              <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFileChange} />
            </label>

            <label className="btn btn-secondary" style={{ width: '100%', cursor: 'pointer' }}>
              Upload Image
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
            </label>

            {loading && <p style={{ marginTop: '10px' }}>Analyzing with Gemini AI...</p>}

            {image && !loading && (
              <img src={image} style={{ maxWidth: '100%', marginTop: '20px', borderRadius: '8px' }} />
            )}
          </div>

          {result && !loading && (
            <div className="auth-container" style={{ marginTop: '20px', width: '400px' }}>
              <h2 style={{ color: result.error ? '#dc3545' : 'inherit' }}>
                {result.error ? '⚠️ Analysis Error' : (result.adulterated ? '🚩 Adulterated' : '✅ Likely Pure')}
              </h2>

              {/* Robust Purity Display */}
              {!result.error && (
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ fontSize: '18px', margin: '5px 0' }}>
                    <b>Purity: {result.purity_percentage ?? (result.adulterated ? 0 : 100)}%</b>
                  </p>
                  {result.adulterants_found && result.adulterants_found.length > 0 && (
                    <p style={{ fontSize: '14px', color: '#dc3545' }}>
                      Detected: {result.adulterants_found.join(', ')}
                    </p>
                  )}
                </div>
              )}

              <p style={{ fontStyle: 'italic', background: '#f8f9fa', padding: '10px', borderRadius: '5px' }}>
                "{result.report_summary || result.error || "No details provided"}"
              </p>

              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button className="btn" onClick={() => { setResult(null); setImage(null); }}>Scan New Item</button>
                {result.error && (
                  <button className="btn btn-secondary" onClick={() => handleScan(image)}>Retry Scan</button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'history' && (
        <div className="container">
          <div className="auth-container" style={{ width: '90%', maxWidth: '800px' }}>
            <h2>Scan History</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Status</th>
                  <th>Purity</th>
                </tr>
              </thead>
              <tbody>
                {history.map(item => (
                  <tr key={item.id}>
                    <td>{new Date(item.timestamp).toLocaleDateString()}</td>
                    <td>{item.food_item}</td>
                    <td>
                      <span style={{ color: item.adulteration_detected === 'Yes' ? 'red' : 'green', fontWeight: 'bold' }}>
                        {item.adulteration_detected === 'Yes' ? 'Adulterated' : 'Pure'}
                      </span>
                    </td>
                    <td>{item.purity_percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const Main = () => {
  const { user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  if (user) return <Dashboard />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-auth)', display: 'flex', alignItems: 'center' }}>
      {isLogin ? <LoginForm onToggle={() => setIsLogin(false)} /> : <SignupForm onToggle={() => setIsLogin(true)} />}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}

import { useState, useEffect } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import './LoginForm.css';

function LoginFormPage() {
    const dispatch = useDispatch();
    const sessionUser = useSelector((state) => state.session.user);

    const [credential, setCredential] = useState('');
    const [password, setPassword] = useState('');

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Reset errors when user types
    useEffect(() => {
      setErrors({});
    }, [credential, password]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        if (!credential || !password) {
          setErrors({ credential: "Username/email and password are required." });
          setLoading(false);
          return;
        }

        try {
          const response = await dispatch(sessionActions.login({ credential, password }));

          if (!response.ok) {
            const data = await response.json();
            if (data?.errors) setErrors(data.errors);
          }

          setLoading(false);
        } catch (error) {
          setErrors({ credential: "Unexpected error occurred. Please try again." });
          setLoading(false);
        }
      };

    // Redirect logged-in users to home page
    if (sessionUser) return <Navigate to="/" replace />;

    return (
      <div className="login-form-container">
        <h1>Log In</h1>

        {errors.credential && (
          <p className="error-message">{errors.credential}</p>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Username or Email
            <input
              type="text"
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              required
              autoFocus
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    );
  }

  export default LoginFormPage;

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import * as sessionActions from '../../store/session';
import './SignupForm.css';

function SignupFormPage() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const incompleteSignup = !formData.email || !formData.username || formData.username.length < 4 ||
                          !formData.firstName || !formData.lastName || !formData.password ||
                          formData.password.length < 6 || !formData.confirmPassword ||
                          formData.confirmPassword !== formData.password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm Password must match Password";
    }

    try {
      await dispatch(
        sessionActions.signup({
          email: formData.email,
          username: formData.username,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
        })
      );
    } catch (res) {
      if (res && res.json) {
        const data = await res.json();
        if (data?.errors) {
          if (data.errors.email) newErrors.email = "Invalid email address";
          if (data.errors.username) newErrors.username = "Username must be unique";
        }
      }
    }
    setErrors(newErrors);
  };

  return (
    <div className='sign-up-container'>
      <h1>Sign Up</h1>

      <div className='error-container'>
        {Object.values(errors).map((error, idx) => (
          <p key={idx} className='error-message'>{error}</p>
        ))}
      </div>

      <form className='form-div' onSubmit={handleSubmit}>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          placeholder="First Name"
          onChange={handleInputChange}
        />

        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          placeholder="Last Name"
          onChange={handleInputChange}
        />

        <input
          type="email"
          name="email"
          value={formData.email}
          placeholder="Email"
          onChange={handleInputChange}
        />

        <input
          type="text"
          name="username"
          value={formData.username}
          placeholder="Username"
          onChange={handleInputChange}
        />

        <input
          type="password"
          name="password"
          value={formData.password}
          placeholder="Password"
          onChange={handleInputChange}
        />

        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          placeholder="Confirm Password"
          onChange={handleInputChange}
        />

        <button type="submit" className='sign-up-button' disabled={incompleteSignup}>Sign Up</button>
      </form>
    </div>
  );
}

export default SignupFormPage;

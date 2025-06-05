import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import * as sessionActions from "../../store/session";
import "./SignupForm.css";
import { motion } from "framer-motion";

function SignupFormModal() {
    const dispatch = useDispatch();
    const { closeModal } = useModal();

    // Form state
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setEmail("");
        setUsername("");
        setFirstName("");
        setLastName("");
        setPassword("");
        setConfirmPassword("");
        setErrors({});
    }, [closeModal]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setErrors({
                confirmPassword: "Confirm Password must match Password",
            });
            return;
        }

        setErrors({});
        try {
            const newUser = await dispatch(
                sessionActions.signup({
                    email,
                    username,
                    firstName,
                    lastName,
                    password,
                })
            );
            if (newUser) {
                closeModal();
            }
        } catch (res) {
            const data = await res.json();
            if (data?.errors) setErrors(data.errors);
        }
    };

    // Disable "Sign Up"
    const isSubmitDisabled =
        !email ||
        !username ||
        username.length < 4 ||
        !firstName ||
        !lastName ||
        !password ||
        password.length < 6 ||
        !confirmPassword ||
        password !== confirmPassword;

    return (
        <div className="sign-up-container">
            <h1>Sign Up</h1>
            <form onSubmit={handleSubmit} className="form-div">
                <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    required
                    aria-label="First Name"
                    tabIndex={0}
                />
                {errors.firstName && (
                    <p className="error-message">{errors.firstName}</p>
                )}

                <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    required
                    aria-label="Last Name"
                    tabIndex={0}
                />
                {errors.lastName && (
                    <p className="error-message">{errors.lastName}</p>
                )}

                <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    aria-label="Email"
                    tabIndex={0}
                />
                {errors.email && (
                    <p className="error-message">{errors.email}</p>
                )}

                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                    aria-label="Username"
                    tabIndex={0}
                />
                {errors.username && (
                    <p className="error-message">{errors.username}</p>
                )}

                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    aria-label="Password"
                    tabIndex={0}
                />
                {errors.password && (
                    <p className="error-message">{errors.password}</p>
                )}

                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    required
                    aria-label="Confirm Password"
                    tabIndex={0}
                />
                {errors.confirmPassword && (
                    <p className="error-message">{errors.confirmPassword}</p>
                )}

                <motion.button
                    type="submit"
                    className="sign-up-button"
                    disabled={isSubmitDisabled}
                    aria-label="Sign Up"
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.03 }}
                >
                    Sign Up
                </motion.button>
            </form>
        </div>
    );
}

export default SignupFormModal;

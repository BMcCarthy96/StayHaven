import { useState, useEffect } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import "./LoginForm.css";
import { motion } from "framer-motion";

function LoginFormModal() {
    const dispatch = useDispatch();
    const [credential, setCredential] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const { closeModal } = useModal();

    const resetForm = () => {
        setCredential("");
        setPassword("");
        setErrors({});
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        return dispatch(sessionActions.login({ credential, password }))
            .then(() => {
                resetForm();
                closeModal();
            })
            .catch(async (res) => {
                const data = await res.json();
                if (data?.errors?.credential) {
                    setErrors({ credential: data.errors.credential });
                } else {
                    setErrors({
                        credential: "The provided credentials were invalid.",
                    });
                }
            });
    };

    // Reset the form on unmount
    useEffect(() => {
        return () => resetForm();
    }, []);

    return (
        <div
            className="login-modal-container"
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-title"
        >
            <h1 id="login-title">Log In</h1>

            {errors.credential && (
                <div className="error-container">
                    <p>{errors.credential}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} id="login-form">
                <div className="form-field">
                    <label htmlFor="login-credential">Username or Email</label>
                    <input
                        id="login-credential"
                        type="text"
                        value={credential}
                        placeholder="Username or email"
                        onChange={(e) => setCredential(e.target.value)}
                        tabIndex={0}
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="login-password">Password</label>
                    <input
                        id="login-password"
                        type="password"
                        value={password}
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                        tabIndex={0}
                    />
                </div>

                <div className="log-in-button-div">
                    <motion.button
                        disabled={credential.length < 4 || password.length < 6}
                        className="login-button"
                        type="submit"
                        aria-label="Log In"
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ scale: 1.03 }}
                    >
                        Log In
                    </motion.button>
                </div>
            </form>

            <div className="demo-user-div">
                <button
                    type="button"
                    className="demo-user-link"
                    aria-label="Log in as demo user"
                    onClick={() => {
                        setCredential("Demo-lition");
                        setPassword("password");
                        setTimeout(() => {
                            document
                                .getElementById("login-form")
                                .requestSubmit();
                        }, 0);
                    }}
                >
                    Continue as demo user
                </button>
            </div>
        </div>
    );
}

export default LoginFormModal;

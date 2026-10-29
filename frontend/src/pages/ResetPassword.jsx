
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";

function ResetPassword() {
  const { uidb64, token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setSuccess(false);

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await api.post(
        `reset-password/${uidb64}/${token}/`,
        { new_password: password }
      );

      setMessage(response.data.message);
      setSuccess(true);
    } catch (error) {
      const data = error.response?.data;
      setMessage(
        data?.error ||
        data?.new_password?.[0] ||
        data?.detail ||
        "Password reset failed. The link may be invalid or expired."
      );
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Reset Password</h1>
        <p>Enter and confirm your new password.</p>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          required
        />

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          minLength={8}
          required
        />

        <button type="submit">Reset Password</button>

        {message && <p>{message}</p>}

        {success && <Link to="/login">Go to Login</Link>}
      </form>
    </div>
  );
}

export default ResetPassword;

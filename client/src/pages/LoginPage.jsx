import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/layout/AuthLayout.jsx";
import Button from "../components/ui/Button.jsx";
import Field from "../components/ui/Field.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address";
    }
    if (!password) nextErrors.password = "Password is required";
    setFieldErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setFieldErrors(error.fieldErrors?.() ?? {});
      setFormError(error.message || "Could not sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        Welcome back
      </h1>
      <p className="mt-1.5 text-sm text-ink-muted">
        Sign in to pick up where you left off.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        {formError ? (
          <p
            role="alert"
            className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2.5 text-sm text-danger"
          >
            {formError}
          </p>
        ) : null}
        <Field
          id="login-email"
          name="email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email}
          required
          disabled={submitting}
        />
        <Field
          id="login-password"
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
          required
          disabled={submitting}
        />
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-ink-muted">
        New to TaskFlow?{" "}
        <Link
          to="/register"
          className="font-medium text-brand-strong hover:underline dark:text-brand"
        >
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}

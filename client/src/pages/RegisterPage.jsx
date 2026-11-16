import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/layout/AuthLayout.jsx";
import Button from "../components/ui/Button.jsx";
import Field from "../components/ui/Field.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address";
    }
    if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters";
    } else if (password.length > 72) {
      nextErrors.password = "Password must be at most 72 characters";
    }
    if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }
    setFieldErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setFieldErrors(error.fieldErrors?.() ?? {});
      setFormError(error.message || "Could not create your account. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        Create your account
      </h1>
      <p className="mt-1.5 text-sm text-ink-muted">
        Start organising your work in a few seconds.
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
          id="register-name"
          name="name"
          label="Full name"
          autoComplete="name"
          placeholder="Your name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={fieldErrors.name}
          required
          maxLength={80}
          disabled={submitting}
        />
        <Field
          id="register-email"
          name="email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email}
          required
          maxLength={254}
          disabled={submitting}
        />
        <Field
          id="register-password"
          name="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          hint="Use at least 8 characters."
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
          required
          minLength={8}
          maxLength={72}
          disabled={submitting}
        />
        <Field
          id="register-confirm-password"
          name="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={fieldErrors.confirmPassword}
          required
          disabled={submitting}
        />
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-brand-strong hover:underline dark:text-brand"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

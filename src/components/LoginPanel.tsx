interface LoginPanelProps {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  error: string | null;
}

const LoginPanel = ({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  isSubmitting,
  error,
}: LoginPanelProps) => {
  return (
    <section className="panel-surface">
      <p className="section-kicker">Authenticated Features</p>
      <h3 className="section-title mt-1">Connect your real Socity account</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Login unlocks post creation, personalized jobs, community join actions, and notification read
        updates from the backend.
      </p>
      <div className="mt-4 space-y-3">
        <input
          className="form-input"
          placeholder="Email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          type="email"
        />
        <input
          className="form-input"
          placeholder="Password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          type="password"
        />
        <button
          className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onSubmit}
          type="button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing in...' : 'Login To Socity'}
        </button>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </div>
    </section>
  );
};

export default LoginPanel;

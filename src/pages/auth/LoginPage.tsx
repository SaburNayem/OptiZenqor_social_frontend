import { Link, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useAppOutlet } from '../../hooks/useAppOutlet';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function LoginPage() {
  const { app } = useAppOutlet();
  const [email, setEmail] = useState('ariana@optizenqor.com');
  const [password, setPassword] = useState('demo12345');
  const [message, setMessage] = useState<string | null>(null);

  if (app.session) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Welcome back</p>
      <h1 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">Sign in to OptiZenqor Social</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Access your network, messages, creator tools, and premium profile workspace.
      </p>

      <div className="mt-8 space-y-4">
        <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button
          className="w-full"
          onClick={async () => {
            const result = await app.login(email, password);
            setMessage(result.message);
          }}
        >
          Sign in
        </Button>
      </div>

      {message ?? app.authMessage ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{message ?? app.authMessage}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
        <Link className="font-medium text-sky-600 dark:text-sky-300" to="/auth/forgot-password">
          Forgot password?
        </Link>
        <p className="text-slate-500 dark:text-slate-400">
          New here?{' '}
          <Link className="font-medium text-sky-600 dark:text-sky-300" to="/auth/register">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAppOutlet } from '../../hooks/useAppOutlet';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getApiBaseUrl } from '../../lib/api';

export function LoginPage() {
  const { app } = useAppOutlet();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Live session</p>
      <h1 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">Sign in to OptiZenqor Social</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Use your backend account to open the live social workspace.
      </p>
      <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
        API base URL: {getApiBaseUrl()}
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
            if (result.ok) {
              navigate('/');
            }
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
          Forgot your password?
        </Link>
        <p className="text-slate-500 dark:text-slate-400">
          Need an account?{' '}
          <Link className="font-medium text-sky-600 dark:text-sky-300" to="/auth/register">
            Create one here
          </Link>
        </p>
      </div>
    </div>
  );
}

import { Link, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useAppOutlet } from '../../hooks/useAppOutlet';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function RegisterPage() {
  const { app } = useAppOutlet();
  const [name, setName] = useState('Ariana Cole');
  const [email, setEmail] = useState('ariana@optizenqor.com');
  const [password, setPassword] = useState('demo12345');
  const [message, setMessage] = useState<string | null>(null);

  if (app.session) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Create account</p>
      <h1 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">Join the premium network</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Start with a polished profile, curated feed, and collaborative messaging experience.
      </p>

      <div className="mt-8 space-y-4">
        <Input label="Full name" value={name} onChange={(event) => setName(event.target.value)} />
        <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          hint="Use at least 8 characters in a real production flow."
        />
        <Button
          className="w-full"
          onClick={async () => {
            const result = await app.register({ name, email, password });
            setMessage(result.message);
          }}
        >
          Create account
        </Button>
      </div>

      {message ?? app.authMessage ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{message ?? app.authMessage}</p>
      ) : null}

      <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link className="font-medium text-sky-600 dark:text-sky-300" to="/auth/login">
          Sign in
        </Link>
      </p>
    </div>
  );
}

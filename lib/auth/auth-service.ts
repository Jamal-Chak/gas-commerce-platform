import type { User } from '@supabase/supabase-js';
import { createBrowserSupabaseClient } from '../supabase/browserClient';

/**
 * AUTH SERVICE BOUNDARY
 * ---------------------
 * Wraps Supabase Auth behind a typed result so the UI can render consistent
 * loading/error/success states. Uses the public (anon) client only — no
 * service-role credentials ever touch the browser.
 *
 * CURRENT STATE: works automatically as soon as `NEXT_PUBLIC_SUPABASE_URL`
 * and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured. Until then the
 * functions return `AUTH_NOT_CONFIGURED` and the UI shows a friendly notice.
 *
 * NOTE: for hardened production, session verification on protected routes
 * must also happen server-side (e.g. `@supabase/ssr` + middleware/proxy).
 */

export function isSupabaseAuthConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export type AuthResult =
  | { ok: true; user: User | null; message: string }
  | { ok: false; code: string; message: string };

export type AuthStatus =
  | { status: 'configured'; user: User | null }
  | { status: 'not-configured' };

const NOT_CONFIGURED: AuthResult = {
  ok: false,
  code: 'AUTH_NOT_CONFIGURED',
  message:
    'Authentication is not configured yet. Ask an administrator to set the Supabase environment variables.',
};

function mapAuthError(error: { code?: string; message: string }): AuthResult {
  const code = error.code ?? '';
  let message = error.message;
  if (code === 'invalid_credentials' || /invalid login/i.test(message)) {
    message = 'Incorrect email or password. Please try again.';
  } else if (/email not confirmed/i.test(message)) {
    message = 'Please confirm your email address before signing in.';
  } else if (/already registered/i.test(message)) {
    message = 'An account with this email already exists. Try signing in instead.';
  } else if (/password should be at least/i.test(message)) {
    message = 'Your password must be at least 8 characters long.';
  } else if (/rate limit/i.test(message)) {
    message = 'Too many attempts. Please wait a moment and try again.';
  }
  return { ok: false, code, message };
}

export async function getAuthStatus(): Promise<AuthStatus> {
  if (!isSupabaseAuthConfigured()) return { status: 'not-configured' };
  try {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return { status: 'configured', user: session?.user ?? null };
  } catch {
    return { status: 'configured', user: null };
  }
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  if (!isSupabaseAuthConfigured()) return NOT_CONFIGURED;
  try {
    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return mapAuthError(error);
    return { ok: true, user: data.user, message: 'Welcome back!' };
  } catch (error) {
    return { ok: false, code: 'UNEXPECTED', message: 'Something went wrong. Please try again.' };
  }
}

export async function signUpWithEmail(
  fullName: string,
  email: string,
  password: string
): Promise<AuthResult> {
  if (!isSupabaseAuthConfigured()) return NOT_CONFIGURED;
  try {
    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (error) return mapAuthError(error);
    if (data.user && data.session === null) {
      return {
        ok: true,
        user: data.user,
        message: 'Account created! Check your email to confirm your sign-in.',
      };
    }
    return { ok: true, user: data.user, message: 'Your account is ready.' };
  } catch {
    return { ok: false, code: 'UNEXPECTED', message: 'Something went wrong. Please try again.' };
  }
}

export async function sendPasswordReset(email: string): Promise<AuthResult> {
  if (!isSupabaseAuthConfigured()) return NOT_CONFIGURED;
  try {
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return mapAuthError(error);
    return {
      ok: true,
      user: null,
      message: 'If that email has an account, a password reset link has been sent.',
    };
  } catch {
    return { ok: false, code: 'UNEXPECTED', message: 'Something went wrong. Please try again.' };
  }
}

export async function signOutUser(): Promise<void> {
  if (!isSupabaseAuthConfigured()) return;
  try {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
  } catch {
    // Best-effort sign out.
  }
}

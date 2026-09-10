import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";

export function LoginForm({ callbackUrl, hasError }: { callbackUrl: string; hasError: boolean }) {
  async function action(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        username: formData.get("username"),
        password: formData.get("password"),
        redirectTo: callbackUrl,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        redirect(`/admin/login?error=CredentialsSignin&callbackUrl=${encodeURIComponent(callbackUrl)}`);
      }
      throw error;
    }
  }

  return (
    <form action={action} className="admin-form">
      {hasError ? <p className="admin-form-error">Invalid username or password.</p> : null}
      <label className="admin-field">
        <span className="admin-field-label">Username</span>
        <input name="username" type="text" required autoComplete="username" className="admin-input" />
      </label>
      <label className="admin-field">
        <span className="admin-field-label">Password</span>
        <input name="password" type="password" required autoComplete="current-password" className="admin-input" />
      </label>
      <button type="submit" className="admin-btn admin-btn-primary">
        Sign in
      </button>
    </form>
  );
}

import { LoginForm } from "@/components/admin/LoginForm";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h1 className="admin-login-title">Site admin</h1>
        <p className="admin-login-subtitle">Sign in to manage content.</p>
        <LoginForm callbackUrl={params.callbackUrl ?? "/admin"} hasError={params.error === "CredentialsSignin"} />
      </div>
    </div>
  );
}

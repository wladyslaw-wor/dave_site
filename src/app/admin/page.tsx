import { getFullState } from "@/lib/content";
import { auth, signOut } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminPage() {
  const [state, session] = await Promise.all([getFullState(), auth()]);

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  return (
    <AdminShell
      initialState={state}
      username={session?.user?.name ?? "admin"}
      logoutAction={logout}
    />
  );
}

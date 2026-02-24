import { isAdminAuthenticated } from "./actions";
import { AdminLoginForm } from "./AdminLoginForm";
import { AdminContent } from "./AdminContent";

export default async function AdminPage() {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    return (
      <div className="min-h-dvh bg-primary flex items-center justify-center p-4">
        <AdminLoginForm />
      </div>
    );
  }
  return (
    <div className="min-h-dvh bg-primary text-white">
      <AdminContent />
    </div>
  );
}

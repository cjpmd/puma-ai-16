
import { UserManagement } from "@/components/admin/UserManagement";

export const AdminSettings = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
      <UserManagement />
    </div>
  );
};

export default AdminSettings;

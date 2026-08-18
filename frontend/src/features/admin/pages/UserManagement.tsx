import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../app/store';
import { fetchUsersThunk, updateUserRoleThunk, deleteUserThunk } from '../store/adminSlice';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';
import { Permission } from '../../../security/permissions/permissions';
import { DataTable, Column } from '../../../shared/components/DataTable';
import { User } from '../../../auth/types/auth.types';
import { getRoleBadgeClass } from '../../../shared/utils/helpers';
import { Trash2, UserPlus } from 'lucide-react';
import { Button } from '../../../shared/components/Button';

export const UserManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, isLoading } = useSelector((state: RootState) => state.admin);

  useEffect(() => {
    dispatch(fetchUsersThunk());
  }, [dispatch]);

  const handleRoleChange = (userId: string, newRole: Role) => {
    dispatch(updateUserRoleThunk({ userId, role: newRole }));
  };

  const handleDelete = (userId: string) => {
    if (confirm('Are you sure you want to revoke and delete this account?')) {
      dispatch(deleteUserThunk(userId));
    }
  };

  const columns: Column<User>[] = [
    {
      header: 'Account User',
      cell: (user: User) => (
        <div className="flex items-center gap-3">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover border border-slate-700"
          />
          <div>
            <p className="font-bold text-slate-100">{user.name}</p>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
        </div>
      ),
    },
    { header: 'Department', accessorKey: 'department' },
    {
      header: 'Assigned Role',
      cell: (user: User) => (
        <select
          value={user.role}
          onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 border border-slate-700 ${getRoleBadgeClass(user.role)} cursor-pointer`}
        >
          {Object.values(Role).map((r) => (
            <option key={r} value={r} className="bg-slate-900 text-slate-200">
              {r}
            </option>
          ))}
        </select>
      ),
    },
    {
      header: 'Status',
      cell: (user: User) => (
        <span className="badge badge-success">
          {user.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (user: User) => (
        <button
          onClick={() => handleDelete(user.id)}
          className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
          title="Delete account"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  return (
    <RoleGuard allowedRoles={[Role.ADMIN]} requiredPermission={Permission.USERS_READ}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">User Account Management</h2>
            <p className="text-sm text-slate-400">View, assign, or revoke enterprise security roles</p>
          </div>
          <Button icon={<UserPlus size={16} />}>Provision New User</Button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading user accounts...</div>
        ) : (
          <div className="glass-panel p-6">
            <DataTable
              data={users}
              columns={columns}
              searchPlaceholder="Filter by name, email, or department..."
              searchFilter={(user, q) =>
                user.name.toLowerCase().includes(q) ||
                user.email.toLowerCase().includes(q) ||
                user.department.toLowerCase().includes(q)
              }
            />
          </div>
        )}
      </div>
    </RoleGuard>
  );
};

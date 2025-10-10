import React, { useState, useEffect } from "react";
import { User } from "@shared/types";
import { createUser, updateUser, deleteUser } from "../api/admin";

interface AdminUsersInlineProps {
  initialUsers: User[];
}

const roles = ["user", "admin", "superadmin", "leagueadmin"]; // allowed roles

export const AdminUsersInline: React.FC<AdminUsersInlineProps> = ({
  initialUsers,
}) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: "",
    email: "",
    role: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [newErrors, setNewErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Validation helper
  const validateUser = (user: Partial<User>) => {
    const errors: Record<string, string> = {};
    if (!user.name) errors.name = "Name is required";
    if (!user.email) errors.email = "Email is required";
    if (!user.role) errors.role = "Role is required";
    else if (!roles.includes(user.role)) errors.role = "Invalid role";
    return errors;
  };

  // Create user
  const handleCreate = async () => {
    const errors = validateUser(newUser);
    if (Object.keys(errors).length) {
      setNewErrors(errors);
      return;
    }
    const created = await createUser(newUser as User);
    setUsers([...users, created]);
    setNewUser({ name: "", email: "", role: "" });
    setNewErrors({});
  };

  // Edit user
  const startEdit = (user: User) => {
    setEditingId(user.id);
    setEditForm({ ...user });
    setEditErrors({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setEditErrors({});
  };

  const handleUpdate = async (id: string) => {
    const errors = validateUser(editForm);
    if (Object.keys(errors).length) {
      setEditErrors(errors);
      return;
    }
    const updated = await updateUser(id, editForm as User);
    setUsers(users.map((u) => (u.id === id ? updated : u)));
    cancelEdit();
  };

  // Delete user
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    await deleteUser(id);
    setUsers(users.filter((u) => u.id !== id));
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Email</th>
            <th className="px-4 py-2 border">Role</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Existing users */}
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-2 border">
                {editingId === user.id ? (
                  <>
                    <input
                      className={`border p-1 rounded w-full ${editErrors.name ? "border-red-500" : ""}`}
                      value={editForm.name || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                    />
                    {editErrors.name && (
                      <p className="text-red-500 text-xs">{editErrors.name}</p>
                    )}
                  </>
                ) : (
                  user.name
                )}
              </td>
              <td className="px-4 py-2 border">
                {editingId === user.id ? (
                  <>
                    <input
                      className={`border p-1 rounded w-full ${editErrors.email ? "border-red-500" : ""}`}
                      value={editForm.email || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                    />
                    {editErrors.email && (
                      <p className="text-red-500 text-xs">{editErrors.email}</p>
                    )}
                  </>
                ) : (
                  user.email
                )}
              </td>
              <td className="px-4 py-2 border">
                {editingId === user.id ? (
                  <>
                    <select
                      className={`border p-1 rounded w-full ${editErrors.role ? "border-red-500" : ""}`}
                      value={editForm.role || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, role: e.target.value })
                      }
                    >
                      <option value="">Select role</option>
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                    {editErrors.role && (
                      <p className="text-red-500 text-xs">{editErrors.role}</p>
                    )}
                  </>
                ) : (
                  user.role
                )}
              </td>
              <td className="px-4 py-2 border space-x-2">
                {editingId === user.id ? (
                  <>
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded"
                      onClick={() => handleUpdate(user.id)}
                    >
                      Save
                    </button>
                    <button
                      className="bg-gray-400 text-white px-2 py-1 rounded"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                      onClick={() => startEdit(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}

          {/* New user row */}
          <tr>
            <td className="px-4 py-2 border">
              <input
                className={`border p-1 rounded w-full ${newErrors.name ? "border-red-500" : ""}`}
                placeholder="Name"
                value={newUser.name || ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
              />
              {newErrors.name && (
                <p className="text-red-500 text-xs">{newErrors.name}</p>
              )}
            </td>
            <td className="px-4 py-2 border">
              <input
                className={`border p-1 rounded w-full ${newErrors.email ? "border-red-500" : ""}`}
                placeholder="Email"
                value={newUser.email || ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />
              {newErrors.email && (
                <p className="text-red-500 text-xs">{newErrors.email}</p>
              )}
            </td>
            <td className="px-4 py-2 border">
              <select
                className={`border p-1 rounded w-full ${newErrors.role ? "border-red-500" : ""}`}
                value={newUser.role || ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
              >
                <option value="">Select role</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
              {newErrors.role && (
                <p className="text-red-500 text-xs">{newErrors.role}</p>
              )}
            </td>
            <td className="px-4 py-2 border">
              <button
                className="bg-green-500 text-white px-2 py-1 rounded"
                onClick={handleCreate}
              >
                Add
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

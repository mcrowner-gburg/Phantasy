import React, { useState } from "react";
import { User } from "@shared/types";
import { updateUser, deleteUser } from "../api/admin";

interface UserRowProps {
  user: User;
  onUpdate: (updated: User) => void;
  onDelete: (id: string) => void;
}

const roles = ["user", "admin", "superadmin", "leagueadmin"];

export const UserRow: React.FC<UserRowProps> = ({
  user,
  onUpdate,
  onDelete,
}) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<User>>(user);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (u: Partial<User>) => {
    const errs: Record<string, string> = {};
    if (!u.name) errs.name = "Name required";
    if (!u.email) errs.email = "Email required";
    if (!u.role) errs.role = "Role required";
    else if (!roles.includes(u.role)) errs.role = "Invalid role";
    return errs;
  };

  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) return setErrors(errs);
    const updated = await updateUser(user.id, form as User);
    onUpdate(updated);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this user?")) return;
    await deleteUser(user.id);
    onDelete(user.id);
  };

  return (
    <tr>
      <td className="px-4 py-2 border">
        {editing ? (
          <>
            <input
              className={`border p-1 rounded w-full ${errors.name ? "border-red-500" : ""}`}
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name}</p>
            )}
          </>
        ) : (
          user.name
        )}
      </td>
      <td className="px-4 py-2 border">
        {editing ? (
          <>
            <input
              className={`border p-1 rounded w-full ${errors.email ? "border-red-500" : ""}`}
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email}</p>
            )}
          </>
        ) : (
          user.email
        )}
      </td>
      <td className="px-4 py-2 border">
        {editing ? (
          <>
            <select
              className={`border p-1 rounded w-full ${errors.role ? "border-red-500" : ""}`}
              value={form.role || ""}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="">Select role</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-red-500 text-xs">{errors.role}</p>
            )}
          </>
        ) : (
          user.role
        )}
      </td>
      <td className="px-4 py-2 border space-x-2">
        {editing ? (
          <>
            <button
              className="bg-green-500 text-white px-2 py-1 rounded"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="bg-gray-400 text-white px-2 py-1 rounded"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              className="bg-blue-500 text-white px-2 py-1 rounded"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
            <button
              className="bg-red-500 text-white px-2 py-1 rounded"
              onClick={handleDelete}
            >
              Delete
            </button>
          </>
        )}
      </td>
    </tr>
  );
};

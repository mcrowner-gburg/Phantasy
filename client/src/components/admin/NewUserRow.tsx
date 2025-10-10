import React, { useState } from "react";
import { User } from "@shared/types";
import { createUser } from "../api/admin";

interface NewUserRowProps {
  onCreate: (user: User) => void;
}

const roles = ["user", "admin", "superadmin", "leagueadmin"];

export const NewUserRow: React.FC<NewUserRowProps> = ({ onCreate }) => {
  const [form, setForm] = useState<Partial<User>>({
    name: "",
    email: "",
    role: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (u: Partial<User>) => {
    const errs: Record<string, string> = {};
    if (!u.name) errs.name = "Name required";
    if (!u.email) errs.email = "Email required";
    if (!u.role) errs.role = "Role required";
    else if (!roles.includes(u.role)) errs.role = "Invalid role";
    return errs;
  };

  const handleAdd = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) return setErrors(errs);
    const created = await createUser(form as User);
    onCreate(created);
    setForm({ name: "", email: "", role: "" });
    setErrors({});
  };

  return (
    <tr>
      <td className="px-4 py-2 border">
        <input
          className={`border p-1 rounded w-full ${errors.name ? "border-red-500" : ""}`}
          placeholder="Name"
          value={form.name || ""}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
      </td>
      <td className="px-4 py-2 border">
        <input
          className={`border p-1 rounded w-full ${errors.email ? "border-red-500" : ""}`}
          placeholder="Email"
          value={form.email || ""}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
      </td>
      <td className="px-4 py-2 border">
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
        {errors.role && <p className="text-red-500 text-xs">{errors.role}</p>}
      </td>
      <td className="px-4 py-2 border">
        <button
          className="bg-green-500 text-white px-2 py-1 rounded"
          onClick={handleAdd}
        >
          Add
        </button>
      </td>
    </tr>
  );
};
A
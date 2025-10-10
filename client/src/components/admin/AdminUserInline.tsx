import React, { useState } from "react";
import { User } from "@shared/types";
import { UserRow } from "./UserRow";
import { NewUserRow } from "./NewUserRow";

interface AdminUsersInlineProps {
  initialUsers: User[];
}

export const AdminUsersInline: React.FC<AdminUsersInlineProps> = ({
  initialUsers,
}) => {
  const [users, setUsers] = useState<User[]>(initialUsers);

  const handleUpdate = (updated: User) => {
    setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
  };

  const handleDelete = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  const handleCreate = (newUser: User) => {
    setUsers([...users, newUser]);
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
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
          <NewUserRow onCreate={handleCreate} />
        </tbody>
      </table>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Power, ShieldAlert, Sparkles, UserCheck } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

interface UserDirectoryProps {
  initialUsers: User[];
  currentUserId: string;
}

export default function UserDirectory({ initialUsers, currentUserId }: UserDirectoryProps) {
  const router = useRouter();

  // Invite states
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("AUTHOR");
  const [inviting, setInviting] = useState(false);
  const [invitedPassword, setInvitedPassword] = useState("");

  // Table action states
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  // Invite User Submit
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !role) return;

    setInviting(true);
    setInvitedPassword("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, role }),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.message || "Failed to create user");
      } else {
        const data = await res.json();
        setInvitedPassword(data.tempPassword);
        setEmail("");
        setName("");
        setRole("AUTHOR");
        router.refresh();
      }
    } catch (err) {
      alert("Error inviting user.");
    } finally {
      setInviting(false);
    }
  };

  // Toggle User Active Status
  const handleToggleActive = async (user: User) => {
    const isSelf = user.id === parseInt(currentUserId, 10);
    if (isSelf) {
      alert("You cannot deactivate your own account.");
      return;
    }

    const confirmToggle = window.confirm(
      `Are you sure you want to ${user.active ? "deactivate" : "reactivate"} user ${user.name}?`
    );
    if (!confirmToggle) return;

    setUpdatingUserId(user.id);

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !user.active }),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.message || "Failed to toggle status");
      } else {
        router.refresh();
      }
    } catch (err) {
      alert("Error toggling status.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Change User Role
  const handleChangeRole = async (user: User, newRole: string) => {
    const isSelf = user.id === parseInt(currentUserId, 10);
    if (isSelf) {
      alert("You cannot change your own admin role.");
      return;
    }

    setUpdatingUserId(user.id);

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.message || "Failed to change role");
      } else {
        router.refresh();
      }
    } catch (err) {
      alert("Error updating role.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 select-none">
      
      {/* LEFT: USERS DIRECTORY TABLE (8 cols) */}
      <div className="lg:col-span-8 space-y-6">
        
        {invitedPassword && (
          <div className="bg-[#ECFDF5] border border-[#A7F3D0] p-4 text-xs text-[#065F46] flex items-center justify-between">
            <div>
              <span className="font-bold uppercase tracking-wider block mb-0.5">Success: Account Initialized</span>
              <p className="font-medium select-text">
                User created! Temporary Password: <code className="bg-[#A7F3D0]/30 px-1 font-mono font-bold">{invitedPassword}</code>. 
                Share this secure password for their first sign-in.
              </p>
            </div>
            <button 
              onClick={() => setInvitedPassword("")} 
              className="text-[#065F46] font-bold uppercase tracking-wider text-[10px] hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="bg-white border border-[#E4E4E7] shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#E4E4E7] text-[#71717A] font-semibold tracking-wider uppercase">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role Designation</th>
                <th className="p-4 text-center">Active Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E4E7]">
              {initialUsers.map((user) => {
                const isSelf = user.id === parseInt(currentUserId, 10);
                const disabled = updatingUserId === user.id;

                return (
                  <tr key={user.id} className={`hover:bg-[#FAFAFA] transition-colors ${!user.active ? "opacity-60" : ""}`}>
                    {/* NAME */}
                    <td className="p-4 font-semibold text-[#18181B] uppercase tracking-wide">
                      <div className="flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {isSelf && (
                          <span className="bg-[#F4F4F5] border border-[#E4E4E7] text-[8px] px-1 text-soft font-bold rounded">
                            You
                          </span>
                        )}
                      </div>
                    </td>

                    {/* EMAIL */}
                    <td className="p-4 text-[#52525B] font-medium">{user.email}</td>

                    {/* ROLE SELECTOR */}
                    <td className="p-4">
                      {isSelf ? (
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-[#09090B] text-white border border-[#09090B] rounded tracking-wider">
                          {user.role}
                        </span>
                      ) : (
                        <select
                          disabled={disabled}
                          value={user.role}
                          onChange={(e) => handleChangeRole(user, e.target.value)}
                          className="bg-[#FAFAFA] border border-[#E4E4E7] text-[9px] font-bold p-1 outline-none text-[#18181B] focus:border-[#09090B] uppercase tracking-wider rounded cursor-pointer"
                        >
                          <option value="AUTHOR">Author</option>
                          <option value="EDITOR">Editor</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      )}
                    </td>

                    {/* ACTIVE BADGE */}
                    <td className="p-4 text-center select-none">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border rounded ${
                        user.active
                          ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]"
                          : "bg-[#FEF2F2] border-[#FEE2E2] text-[#991B1B]"
                      }`}>
                        {user.active ? "Active" : "Deactivated"}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="p-4 text-right">
                      {!isSelf ? (
                        <button
                          disabled={disabled}
                          onClick={() => handleToggleActive(user)}
                          className={`inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-xs ${
                            user.active ? "text-[#991B1B] hover:text-[#7F1D1D]" : "text-[#059669] hover:text-[#047857]"
                          }`}
                        >
                          <Power size={11} />
                          <span>{user.active ? "Deactivate" : "Reactivate"}</span>
                        </button>
                      ) : (
                        <span className="text-faint text-[10px] uppercase font-bold italic select-none">Self Account</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT: INVITE USER FORM (4 cols) */}
      <div className="lg:col-span-4 bg-white border border-[#E4E4E7] p-6 shadow-sm flex flex-col justify-between h-fit">
        <div>
          <h2 className="text-xs font-semibold tracking-wider uppercase text-[#18181B] border-b border-[#E4E4E7] pb-3 mb-5 flex items-center gap-2">
            <UserPlus size={14} className="text-[#71717A]" />
            <span>Invite Collaborator</span>
          </h2>

          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#52525B] uppercase mb-1">
                Collaborator Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E4E4E7] text-xs p-2.5 outline-none text-[#18181B] focus:border-[#09090B] focus:bg-white transition-colors"
                placeholder="e.g. Imran Sheikh"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#52525B] uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E4E4E7] text-xs p-2.5 outline-none text-[#18181B] focus:border-[#09090B] focus:bg-white transition-colors"
                placeholder="e.g. imran@sera.com"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-[#52525B] uppercase mb-1">
                Role Assignment
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E4E4E7] text-xs p-2.5 outline-none text-[#18181B] focus:border-[#09090B] focus:bg-white transition-colors uppercase font-bold tracking-wide"
              >
                <option value="AUTHOR">Author (Writer)</option>
                <option value="EDITOR">Editor (Reviews & Approves)</option>
                <option value="ADMIN">Admin (Full Control)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={inviting}
              className="w-full bg-[#18181B] hover:bg-black text-white text-[10px] font-semibold tracking-widest uppercase p-3 transition-colors border border-black disabled:opacity-50 mt-2"
            >
              {inviting ? "INVITING..." : "INVITE COLLABORATOR"}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}

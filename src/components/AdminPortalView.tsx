"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Shield,
  Stethoscope,
  Trash2,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { AdminApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

export function AdminPortalView({ currentUser }: { currentUser: any }) {
  const { success, error: toastError } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [counts, setCounts] = useState({ total: 0, doctors: 0, staff: 0, admins: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Add Doctor / Staff form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleName, setRoleName] = useState<"Doctor" | "Staff">("Doctor");
  const [specialization, setSpecialization] = useState("General Medicine");
  const [registrationNo, setRegistrationNo] = useState("");
  const [department, setDepartment] = useState("Outpatient Department (OPD)");
  const [contactPhone, setContactPhone] = useState("+9198450");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await AdminApi.listUsers();
      setUsers(data.items || []);
      setCounts({
        total: data.total || 0,
        doctors: data.doctors_count || 0,
        staff: data.staff_count || 0,
        admins: data.admin_count || 0,
      });
    } catch (err: any) {
      toastError(err.message || "Failed to load users", "Admin Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await AdminApi.createUser({
        full_name: fullName,
        email,
        password,
        role_name: roleName,
        specialization: roleName === "Doctor" ? specialization : undefined,
        registration_no: roleName === "Doctor" ? registrationNo || undefined : undefined,
        department: roleName === "Doctor" ? department : undefined,
        contact_phone: roleName === "Doctor" ? contactPhone : undefined,
      });
      success(`${created.role_name} account created for ${created.full_name}.`, "Account Created");
      setFullName("");
      setEmail("");
      setPassword("");
      setRegistrationNo("");
      await loadUsers();
    } catch (err: any) {
      toastError(err.message || "Failed to create account", "Creation Error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (u: any) => {
    try {
      await AdminApi.toggleStatus(u.user_id, !u.is_active);
      success(`${u.full_name} is now ${!u.is_active ? "Active" : "Inactive"}.`, "Status Updated");
      await loadUsers();
    } catch (err: any) {
      toastError(err.message || "Failed to update status", "Update Error");
    }
  };

  const handleDeleteUser = async (u: any) => {
    try {
      await AdminApi.deleteUser(u.user_id);
      success(`Removed ${u.full_name}.`, "Account Removed");
      await loadUsers();
    } catch (err: any) {
      toastError(err.message || "Failed to delete account", "Delete Error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Role Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-300 uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Hospital Administration Portal</span>
          </div>
          <h1 className="text-xl font-extrabold mt-1">
            Doctor & Staff Account Management
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Admin accounts manage doctors, clinical staff, and system access only. Patient registration and consultations are restricted to Doctors and Staff.
          </p>
        </div>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Registered Doctors</p>
            <p className="text-2xl font-black text-sky-700 mt-1">{counts.doctors}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
            <Stethoscope className="w-5 h-5" />
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Clinical Intake Staff</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">{counts.staff}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total System Users</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{counts.total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add New Doctor / Staff Form */}
        <section className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-sky-600" />
            <span>Add New Doctor / Staff</span>
          </h2>

          <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Role</label>
              <select
                value={roleName}
                onChange={(e) => setRoleName(e.target.value as "Doctor" | "Staff")}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white font-semibold"
              >
                <option value="Doctor">Doctor (Licensed Medical Practitioner)</option>
                <option value="Staff">Staff (Clinical Intake Nurse)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Dr. Ramesh Kulkarni, MBBS, MD"
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Address</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@hospital.org"
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Password</label>
              <input
                required
                type="text"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
              />
            </div>

            {roleName === "Doctor" && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">KMC Reg No</label>
                    <input
                      value={registrationNo}
                      onChange={(e) => setRegistrationNo(e.target.value)}
                      placeholder="KMC-96001"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Phone</label>
                    <input
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+9198450..."
                      className="w-full border border-slate-300 rounded-xl px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Specialization</label>
                  <input
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="General Medicine / Pulmonology"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Department</label>
                  <input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Outpatient Department (OPD)"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              <span>Add {roleName} Account</span>
            </button>
          </form>
        </section>

        {/* Directory of Doctors & Staff */}
        <section className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Registered Doctors & Staff Directory</span>
          </h2>

          {loading ? (
            <div className="py-12 flex items-center justify-center text-slate-500 text-xs gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading accounts...</span>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Name & Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Specialization / Reg</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => {
                    const isSelf = u.user_id === currentUser?.user_id;
                    return (
                      <tr key={u.user_id} className="hover:bg-slate-50/70">
                        <td className="p-3 font-mono text-slate-500">#{u.user_id}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{u.full_name}</div>
                          <div className="text-[11px] text-slate-500">{u.email}</div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              u.role_name === "Doctor"
                                ? "bg-sky-100 text-sky-800"
                                : u.role_name === "Admin"
                                ? "bg-indigo-100 text-indigo-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {u.role_name}
                          </span>
                        </td>
                        <td className="p-3 text-[11px] text-slate-600">
                          {u.doctor_profile ? (
                            <>
                              <div className="font-semibold text-slate-800">{u.doctor_profile.specialization}</div>
                              <div className="font-mono">{u.doctor_profile.registration_no}</div>
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                              u.is_active ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
                            }`}
                          >
                            {u.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {u.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {!isSelf && (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(u)}
                                className="px-2 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-[11px] font-semibold"
                              >
                                {u.is_active ? "Disable" : "Enable"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700"
                                title="Delete user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

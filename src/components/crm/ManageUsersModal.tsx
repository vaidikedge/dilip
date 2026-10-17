import React, { useState } from 'react';
import { X, Users, UserPlus, Key, Phone, Mail, Shield, CheckCircle2, AlertCircle, Eye, EyeOff, Trash2, AlertTriangle } from 'lucide-react';
import { CrmUser } from '../../data/crmData';

interface ManageUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: CrmUser[];
  onAddUser: (user: Omit<CrmUser, 'id' | 'createdAt'>) => void;
  onUpdateUserPassword: (userId: string, newPass: string) => void;
  onToggleUserStatus: (userId: string) => void;
  onDeleteUser?: (userId: string) => void;
}

export const ManageUsersModal: React.FC<ManageUsersModalProps> = ({
  isOpen,
  onClose,
  users,
  onAddUser,
  onUpdateUserPassword,
  onToggleUserStatus,
  onDeleteUser,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [roleTitle, setRoleTitle] = useState('Solar Engineer');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [userToDelete, setUserToDelete] = useState<CrmUser | null>(null);

  // Password editing state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  if (!isOpen) return null;

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim().toLowerCase();

    // Check duplicate username
    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      setFormError(`Username "${cleanUsername}" is already taken! Choose a different ID.`);
      return;
    }

    if (password.length < 3) {
      setFormError('Password must be at least 3 characters.');
      return;
    }

    onAddUser({
      name: name.trim(),
      username: cleanUsername,
      password: password.trim(),
      role: 'employee',
      roleTitle: roleTitle.trim(),
      phone: phone.trim(),
      email: email.trim(),
      status: 'active',
    });

    const savedName = name.trim();
    setName('');
    setUsername('');
    setPassword('');
    setPhone('');
    setEmail('');
    setFormError('');
    setShowAddForm(false);
    setSuccessNotice(`✅ User "@${cleanUsername}" (${savedName}) successfully created & registered! They can now log in immediately with their ID and password.`);
    setTimeout(() => setSuccessNotice(''), 9000);
  };

  const handleSavePassword = (userId: string) => {
    if (newPasswordInput.trim().length < 3) {
      setFormError('Password must be at least 3 characters.');
      return;
    }
    onUpdateUserPassword(userId, newPasswordInput.trim());
    setEditingUserId(null);
    setNewPasswordInput('');
    setSuccessNotice('✅ Password updated successfully! The user can now log in with the new password.');
    setTimeout(() => setSuccessNotice(''), 6000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1a3882] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Manage Employee & User Accounts</h3>
              <p className="text-xs text-slate-500">Create unlimited employee users, set their ID & passwords</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Notice Banner */}
        {successNotice && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl flex items-center justify-between gap-2 shadow-xs text-xs font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
            <button
              onClick={() => setSuccessNotice('')}
              className="text-emerald-700 hover:text-emerald-950 font-bold px-1.5 py-0.5 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Action Button */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 bg-[#1a3882] hover:bg-blue-900 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow cursor-pointer transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Hide Create Form' : '+ Create New Employee User'}</span>
          </button>
          <span className="text-xs text-slate-500 font-medium">
            Total Users: <strong>{users.length}</strong> (1 Owner, {users.filter((u) => u.role === 'employee').length} Employees)
          </span>
        </div>

        {/* Add User Form */}
        {showAddForm && (
          <form onSubmit={handleCreateUser} className="mb-6 bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-3 text-xs">
            <h4 className="font-bold text-blue-950 text-xs uppercase tracking-wider flex items-center gap-1">
              <UserPlus className="w-4 h-4 text-[#1a3882]" />
              <span>Create New Staff Account (Owner Controlled)</span>
            </h4>

            {formError && (
              <div className="p-2.5 bg-rose-100 border border-rose-300 text-rose-800 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Employee Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3882]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Role / Designation *</label>
                <select
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:outline-none"
                >
                  <option value="Solar Engineer">Solar Engineer</option>
                  <option value="Site Technician">Site Technician</option>
                  <option value="Structure Fabrication In-charge">Structure Fabrication In-charge</option>
                  <option value="UPPCL Net-Metering Desk">UPPCL Net-Metering Desk</option>
                  <option value="Sales & Customer Executive">Sales & Customer Executive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#1a3882] mb-1">Login Username (User ID) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. rahul"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border-2 border-blue-400 rounded-lg p-2 text-xs font-mono font-bold bg-white focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">Employee will use this User ID to log in</span>
              </div>
              <div>
                <label className="block font-bold text-[#1a3882] mb-1">Login Password *</label>
                <div className="relative">
                  <input
                    type={showFormPassword ? 'text' : 'password'}
                    required
                    placeholder="Set secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-2 border-blue-400 rounded-lg p-2 pr-8 text-xs font-mono font-bold bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPassword(!showFormPassword)}
                    className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"
                    title={showFormPassword ? 'Hide password' : 'Show password'}
                  >
                    {showFormPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500">Employee will use this password to log in</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="+91 9415..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="rahul@dilipenterprises.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#1a3882] hover:bg-blue-900 rounded shadow cursor-pointer"
              >
                Save & Register User
              </button>
            </div>
          </form>
        )}

        {/* Existing Users Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#23499d] text-white">
                <th className="py-2.5 px-3 font-semibold">User / Designation</th>
                <th className="py-2.5 px-3 font-semibold">Username (ID)</th>
                <th className="py-2.5 px-3 font-semibold">Password</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((u, idx) => (
                <tr key={u.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <span className="text-[11px] text-slate-500">{u.roleTitle}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {u.username}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {editingUserId === u.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          placeholder="New password"
                          className="w-24 border border-blue-400 rounded px-1.5 py-0.5 text-xs font-mono"
                        />
                        <button
                          onClick={() => handleSavePassword(u.id)}
                          className="bg-emerald-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingUserId(null)}
                          className="text-slate-500 text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-xs select-all">
                          {visiblePasswords[u.id] ? (u.password || '••••••••') : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(u.id)}
                          className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                          title={visiblePasswords[u.id] ? "Hide password" : "Reveal password"}
                        >
                          {visiblePasswords[u.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 text-slate-500" />}
                        </button>
                        {u.role === 'employee' && (
                          <button
                            onClick={() => {
                              setEditingUserId(u.id);
                              setNewPasswordInput(u.password || '');
                            }}
                            className="text-blue-600 hover:text-blue-800 text-[11px] cursor-pointer p-0.5 rounded"
                            title="Change Password"
                          >
                            <Key className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {u.role === 'employee' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onToggleUserStatus(u.id)}
                          className={`text-xs px-2 py-1 rounded font-semibold cursor-pointer transition-colors ${
                            u.status === 'active'
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {u.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        {onDeleteUser && (
                          <button
                            type="button"
                            onClick={() => setUserToDelete(u)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Owner Account</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Delete Confirmation Modal */}
        {userToDelete && (
          <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Delete User Account?</h4>
                  <p className="text-xs text-rose-600 font-semibold">Confirm staff deletion</p>
                </div>
              </div>

              <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3.5 mb-5 text-xs text-slate-700 space-y-2">
                <p>
                  Are you sure you want to permanently delete user{' '}
                  <strong className="text-slate-900 font-bold">"{userToDelete.name}"</strong> (
                  <span className="font-mono text-rose-700 font-semibold">@{userToDelete.username}</span>)?
                </p>
                <div className="text-[11px] text-rose-700 font-medium bg-white/80 p-2 rounded-lg border border-rose-200">
                  ⚠️ This action cannot be undone. All credentials for this account will be permanently erased and this user will no longer be able to access the portal.
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onDeleteUser) {
                      onDeleteUser(userToDelete.id);
                      setSuccessNotice(`✅ User "@${userToDelete.username}" (${userToDelete.name}) permanently deleted.`);
                      setTimeout(() => setSuccessNotice(''), 6000);
                    }
                    setUserToDelete(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md hover:shadow-lg cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Yes, Permanently Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

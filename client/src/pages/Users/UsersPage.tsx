import { useCallback, useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader";
import TableSearchBar from "../../components/layout/TableSearchBar";
import Pagination from "../../components/layout/Pagination";
import ToastMessage from "../../components/ToastMessage/ToastMessage";
import { useToastMessage } from "../../hooks/useToastMessage";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import UserService from "../../services/UserService";
import RoleService from "../../services/RoleService";
import type { UserColumns } from "../../interfaces/UserInterface";
import type { Role } from "../../interfaces/RoleInterface";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/table";
import Spinner from "../../components/Spinner/Spinner";
import UserFormModal from "./components/UserFormModal";
import DeleteUserModal from "./components/DeleteUserModal";
import RoleFormModal from "./components/RoleFormModal";
import RolesListModal from "./components/RolesListModal";
import { parsePaginated } from "../../utils/parsePaginated";

const UsersPage = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [addOpen, setAddOpen] = useState(false);
    const [editUser, setEditUser] = useState<UserColumns | null>(null);
    const [deleteUser, setDeleteUser] = useState<UserColumns | null>(null);
    const [roleFormOpen, setRoleFormOpen] = useState(false);
    const [rolesListOpen, setRolesListOpen] = useState(false);
    const [editRole, setEditRole] = useState<Role | null>(null);
    const { message, isVisible, showToastMessage, closeToastMessage } = useToastMessage("", false, false);

    const fetchUsers = useCallback(async (page: number, search: string) => {
        const res = await UserService.loadUsers(page, search);
        if (res.status !== 200) throw new Error("Failed to load users");
        return parsePaginated<UserColumns>(res.data, "users");
    }, []);

    const {
        items: users,
        search,
        setSearch,
        page,
        lastPage,
        total,
        loading,
        setPage,
        refresh,
    } = usePaginatedList(fetchUsers);

    const loadRoles = useCallback(async () => {
        try {
            const res = await RoleService.loadRoles();
            if (res.status === 200) setRoles(res.data.roles);
        } catch (e) {
            console.error(e);
        }
    }, []);

    useEffect(() => {
        void loadRoles();
    }, [loadRoles]);

    return (
        <>
            <ToastMessage message={message} isVisible={isVisible} onClose={closeToastMessage} />
            <UserFormModal isOpen={addOpen} roles={roles} onClose={() => setAddOpen(false)} onSaved={(m) => { showToastMessage(m, false); refresh(); }} />
            <UserFormModal user={editUser} roles={roles} isOpen={!!editUser} onClose={() => setEditUser(null)} onSaved={(m) => { showToastMessage(m, false); setEditUser(null); refresh(); }} />
            <DeleteUserModal user={deleteUser} isOpen={!!deleteUser} onClose={() => setDeleteUser(null)} onDeleted={(m) => { showToastMessage(m, false); setDeleteUser(null); refresh(); }} />
            <RoleFormModal role={editRole} isOpen={roleFormOpen} onClose={() => { setRoleFormOpen(false); setEditRole(null); }} onSaved={(m) => { showToastMessage(m, false); void loadRoles(); setRoleFormOpen(false); setEditRole(null); }} />
            <RolesListModal isOpen={rolesListOpen} roles={roles} onClose={() => setRolesListOpen(false)} onEdit={(r) => { setEditRole(r); setRoleFormOpen(true); setRolesListOpen(false); }} onRefresh={() => void loadRoles()} onDeleted={(m) => showToastMessage(m, false)} />

            <PageHeader
                title="Users"
                subtitle="Manage user accounts and roles"
                action={
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => setRolesListOpen(true)} className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-gray-200 hover:bg-slate-800">
                            View Roles
                        </button>
                        <button type="button" onClick={() => { setEditRole(null); setRoleFormOpen(true); }} className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-gray-200 hover:bg-slate-800">
                            Add New Role
                        </button>
                        <button type="button" onClick={() => setAddOpen(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                            + Add New User
                        </button>
                    </div>
                }
            />

            <div className="overflow-hidden rounded-xl border border-slate-700 bg-[#152a4a]">
                <TableSearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by name, username, or role..."
                />
                {loading ? (
                    <div className="flex justify-center py-16"><Spinner size="lg" /></div>
                ) : (
                    <>
                        <Table>
                            <TableHeader className="border-b border-slate-700 bg-[#0f1f3d] text-xs uppercase text-gray-400">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3">Picture</TableCell>
                                    <TableCell isHeader className="px-5 py-3">Name</TableCell>
                                    <TableCell isHeader className="px-5 py-3">Role</TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-right">Actions</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-slate-700 text-sm text-gray-200">
                                {users.map((u) => (
                                    <TableRow key={u.user_id} className="hover:bg-slate-800/40">
                                        <TableCell className="px-5 py-3">
                                            {u.profile_picture ? (
                                                <img src={u.profile_picture} alt={u.name} className="h-10 w-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-xs font-medium">
                                                    {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 font-medium">{u.name}</TableCell>
                                        <TableCell className="px-5 py-3">
                                            <span className="rounded-full bg-blue-900/50 px-2.5 py-0.5 text-xs capitalize text-blue-300">
                                                {u.role?.name ?? "—"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-right">
                                            <button type="button" className="mr-4 text-gray-300 hover:text-white" onClick={() => setEditUser(u)}>Edit</button>
                                            <button type="button" className="text-red-400 hover:text-red-300" onClick={() => setDeleteUser(u)}>Delete</button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {users.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-500">No users found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <Pagination currentPage={page} lastPage={lastPage} total={total} onPageChange={setPage} />
                    </>
                )}
            </div>
        </>
    );
};

export default UsersPage;

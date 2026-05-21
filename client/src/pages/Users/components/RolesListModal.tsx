import { useState, type FC } from "react";
import Modal from "../../../components/Modal";
import RoleService from "../../../services/RoleService";
import type { Role } from "../../../interfaces/RoleInterface";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    roles: Role[];
    onEdit: (role: Role) => void;
    onRefresh: () => void;
    onDeleted: (msg: string) => void;
}

const RolesListModal: FC<Props> = ({ isOpen, onClose, roles, onEdit, onRefresh, onDeleted }) => {
    const [deleting, setDeleting] = useState<number | null>(null);

    const handleDelete = async (role: Role) => {
        setDeleting(role.role_id);
        try {
            const res = await RoleService.destroyRole(role.role_id);
            if (res.status === 200) {
                onDeleted(res.data.message);
                onRefresh();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setDeleting(null);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton className="bg-[#111111]">
            <h2 className="mb-4 text-xl font-semibold text-white">Roles</h2>
            <ul className="divide-y divide-gray-800">
                {roles.map((r) => (
                    <li key={r.role_id} className="flex items-center justify-between py-3 text-gray-200">
                        <span className="capitalize">{r.name}</span>
                        <div className="flex gap-2">
                            <button type="button" className="text-sm text-blue-400 hover:text-blue-300" onClick={() => onEdit(r)}>Edit</button>
                            <button type="button" disabled={deleting === r.role_id} className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50" onClick={() => void handleDelete(r)}>
                                {deleting === r.role_id ? "..." : "Delete"}
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </Modal>
    );
};

export default RolesListModal;

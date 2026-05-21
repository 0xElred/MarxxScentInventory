import { useState, type FC } from "react";
import Modal from "../../../components/Modal";
import UserService from "../../../services/UserService";
import type { UserColumns } from "../../../interfaces/UserInterface";

interface Props {
    user: UserColumns | null;
    isOpen: boolean;
    onClose: () => void;
    onDeleted: (msg: string) => void;
}

const DeleteUserModal: FC<Props> = ({ user, isOpen, onClose, onDeleted }) => {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await UserService.destroyUser(user.user_id);
            if (res.status === 200) onDeleted(res.data.message);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton className="bg-[#111111]">
            <p className="text-white">Delete user <strong>{user?.name}</strong>?</p>
            <div className="mt-4 flex gap-3">
                <button type="button" onClick={onClose} className="rounded-lg border border-gray-700 px-4 py-2 text-gray-300">Cancel</button>
                <button type="button" disabled={loading} onClick={() => void handleDelete()} className="rounded-lg bg-red-600 px-4 py-2 text-white disabled:opacity-50">
                    {loading ? "Deleting..." : "Delete"}
                </button>
            </div>
        </Modal>
    );
};

export default DeleteUserModal;

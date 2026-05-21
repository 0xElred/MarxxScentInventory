import { useEffect, useState, type FC, type FormEvent } from "react";
import Modal from "../../../components/Modal";
import type { UserColumns } from "../../../interfaces/UserInterface";
import CloseButton from "../../../components/buttons/CloseButton";
import SubmitButton from "../../../components/buttons/SubmitButton";
import UserService from "../../../services/UserService";

interface DeleteUserFormModalProps {
    user: UserColumns | null;
    onUserDeleted: (message: string) => void;
    refreshKey: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const dash = (value: string | number | undefined | null) => {
    if (value === undefined || value === null || value === "") return "N/A";
    return String(value);
};

const DeleteUserFormModel: FC<DeleteUserFormModalProps> = ({
    user,
    onUserDeleted,
    refreshKey,
    isOpen,
    onClose,
}) => {
    const [loadingDestroy, setLoadingDestroy] = useState(false);
    const [summary, setSummary] = useState("");

    useEffect(() => {
        if (!user) {
            setSummary("");
            return;
        }
        const middle = user.middle_name ?? user.midlle_name ?? "";
        let name = `${user.last_name}, ${user.first_name}`;
        if (middle) name += `, ${middle.charAt(0)}.`;
        if (user.suffix_name) name += ` ${user.suffix_name}`;
        setSummary(name);
    }, [user]);

    const middleName = user ? user.middle_name ?? user.midlle_name : "";

    const handleDestroy = async (e: FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            setLoadingDestroy(true);
            const res = await UserService.destroyUser(user.user_id);
            if (res.status === 200) {
                onUserDeleted(res.data.message ?? "User deleted.");
                refreshKey();
                onClose();
            } else {
                console.error("Unexpected status error occurred during deleting user:", res.status);
            }
        } catch (error) {
            console.error("Unexpected server error occurred during deleting user:", error);
        } finally {
            setLoadingDestroy(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton className="bg-white rounded">
            <form onSubmit={handleDestroy}>
                <h1 className="text-2xl border-b border-gray-100 p-4 font-semibold mb-4">Delete user</h1>
                <div className="px-4 pb-4 space-y-4 text-gray-700">
                    <p>Are you sure you want to delete this user?</p>
                    <p className="font-medium text-gray-900">{summary || "—"}</p>
                    <dl className="grid grid-cols-[minmax(0,auto)_1fr] gap-x-6 gap-y-2 text-sm sm:grid-cols-[10rem_1fr]">
                        <dt className="text-gray-500">First name</dt>
                        <dd className="font-medium text-gray-900">{dash(user?.first_name)}</dd>
                        <dt className="text-gray-500">Middle name</dt>
                        <dd className="font-medium text-gray-900">{dash(middleName)}</dd>
                        <dt className="text-gray-500">Last name</dt>
                        <dd className="font-medium text-gray-900">{dash(user?.last_name)}</dd>
                        <dt className="text-gray-500">Suffix name</dt>
                        <dd className="font-medium text-gray-900">{dash(user?.suffix_name)}</dd>
                        <dt className="text-gray-500">Gender</dt>
                        <dd className="font-medium text-gray-900">{dash(user?.gender?.gender)}</dd>
                        <dt className="text-gray-500">Birth date</dt>
                        <dd className="font-medium text-gray-900">{dash(user?.birth_date)}</dd>
                        <dt className="text-gray-500">Age</dt>
                        <dd className="font-medium text-gray-900">{dash(user?.age)}</dd>
                        <dt className="text-gray-500">Username</dt>
                        <dd className="font-medium text-gray-900">{dash(user?.username)}</dd>
                    </dl>
                </div>
                <div className="flex justify-end gap-2 p-4 border-t border-gray-100">
                    <CloseButton label="Cancel" onClose={onClose} />
                    <SubmitButton
                        className="bg-red-600 hover:bg-red-700"
                        label="Delete user"
                        loading={loadingDestroy}
                        loadingLabel="Deleting…"
                    />
                </div>
            </form>
        </Modal>
    );
};

export default DeleteUserFormModel;

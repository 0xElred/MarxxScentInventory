import { useEffect, useState, type FC, type FormEvent } from "react";
import Modal from "../../../components/Modal";
import FloatingLabelInput from "../../../components/inputs/FloatingLabelInput";
import SubmitButton from "../../../components/buttons/SubmitButton";
import RoleService from "../../../services/RoleService";
import type { Role, RoleFieldErrors } from "../../../interfaces/RoleInterface";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSaved: (message: string) => void;
    role?: Role | null;
}

const RoleFormModal: FC<Props> = ({ isOpen, onClose, onSaved, role }) => {
    const [name, setName] = useState("");
    const [errors, setErrors] = useState<RoleFieldErrors>({});
    const [generalError, setGeneralError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setName(role?.name ?? "");
        setErrors({});
        setGeneralError("");
    }, [role, isOpen]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});
        setGeneralError("");
        try {
            const res = role
                ? await RoleService.updateRole(role.role_id, { name })
                : await RoleService.storeRole({ name });
            if (res.status === 200) {
                onSaved(res.data.message);
                onClose();
            }
        } catch (err: unknown) {
            const axiosErr = err as {
                message?: string;
                response?: { status?: number; data?: { errors?: RoleFieldErrors; message?: string } };
            };
            if (axiosErr.response?.status === 422) {
                const data = axiosErr.response.data;
                if (data?.errors) setErrors(data.errors);
                else if (data?.message) setGeneralError(data.message);
            } else if (axiosErr.response?.data?.message) {
                setGeneralError(axiosErr.response.data.message);
            } else if (axiosErr.message === "Network Error") {
                setGeneralError(
                    "Cannot reach the API. Start XAMPP Apache and MySQL, or run: php artisan serve (then restart npm run dev)."
                );
            } else {
                setGeneralError("Could not save role. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton className="bg-[#111111]">
            <h2 className="mb-4 text-xl font-semibold text-white">{role ? "Edit Role" : "Add New Role"}</h2>
            {generalError && (
                <p className="mb-3 rounded-lg border border-red-800 bg-red-900/30 px-3 py-2 text-sm text-red-300">
                    {generalError}
                </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <FloatingLabelInput
                    label="Role name (e.g. admin, staff, manager)"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    errors={errors.name}
                    required
                    newInputClassName="block w-full rounded-lg border border-gray-700 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white"
                    newLabelClassName="text-gray-400"
                />
                <SubmitButton loading={submitting} label={role ? "Update" : "Save"} />
            </form>
        </Modal>
    );
};

export default RoleFormModal;

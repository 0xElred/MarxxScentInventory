import { useEffect, useState, type FC, type FormEvent } from "react";
import Modal from "../../../components/Modal";
import FloatingLabelInput from "../../../components/inputs/FloatingLabelInput";
import FloatingLabelSelect from "../../../components/select/FloatingLabelSelect";
import UploadInput from "../../../components/inputs/UploadInput";
import SubmitButton from "../../../components/buttons/SubmitButton";
import UserService from "../../../services/UserService";
import type { UserColumns, UserFieldErrors } from "../../../interfaces/UserInterface";
import type { Role } from "../../../interfaces/RoleInterface";
import { appendFile } from "../../../utils/appendFile";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSaved: (message: string) => void;
    roles: Role[];
    user?: UserColumns | null;
}

const UserFormModal: FC<Props> = ({ isOpen, onClose, onSaved, roles, user }) => {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [role, setRole] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [photo, setPhoto] = useState<File | null>(null);
    const [errors, setErrors] = useState<UserFieldErrors>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        if (user) {
            setName(user.name);
            setUsername(user.username);
            setRole(String(user.role?.role_id ?? ""));
            setPhoto(null);
            setPassword("");
            setPasswordConfirmation("");
        } else if (!name && !username) {
            setRole(roles[0] ? String(roles[0].role_id) : "");
        }
        setErrors({});
    }, [user, isOpen, roles]);

    const clearAddForm = () => {
        setName("");
        setUsername("");
        setRole(roles[0] ? String(roles[0].role_id) : "");
        setPassword("");
        setPasswordConfirmation("");
        setPhoto(null);
        setErrors({});
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});
        const fd = new FormData();
        fd.append("name", name);
        fd.append("username", username);
        fd.append("role", role);
        if (photo) appendFile(fd, "profile_picture", photo);
        if (!user || password) {
            fd.append("password", password);
            fd.append("password_confirmation", passwordConfirmation);
        }

        try {
            const res = user
                ? await UserService.updateUser(user.user_id, fd)
                : await UserService.storeUser(fd);
            if (res.status === 200) {
                if (!user) clearAddForm();
                onSaved(res.data.message);
                onClose();
            }
        } catch (err: unknown) {
            const axiosErr = err as { response?: { status?: number; data?: { errors?: UserFieldErrors } } };
            if (axiosErr.response?.status === 422) setErrors(axiosErr.response.data?.errors ?? {});
        } finally {
            setSubmitting(false);
        }
    };

    const darkInput = "block w-full rounded-lg border border-gray-700 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white";
    const darkLabel = "text-gray-400";

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton className="bg-[#111111] border border-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-white">{user ? "Edit User" : "Add New User"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <FloatingLabelInput label="Name" name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} errors={errors.name} required newInputClassName={darkInput} newLabelClassName={darkLabel} />
                <FloatingLabelInput label="Username" name="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} errors={errors.username} required newInputClassName={darkInput} newLabelClassName={darkLabel} />
                <FloatingLabelSelect label="Role" name="role" value={role} onChange={(e) => setRole(e.target.value)} errors={errors.role} required newSelectClassName={darkInput} newLabelClassName={darkLabel}>
                    <option value="">Select role</option>
                    {roles.map((r) => (
                        <option key={r.role_id} value={r.role_id}>{r.name}</option>
                    ))}
                </FloatingLabelSelect>
                <FloatingLabelInput label={user ? "Password (leave blank to keep)" : "Password"} name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} errors={errors.password} required={!user} newInputClassName={darkInput} newLabelClassName={darkLabel} />
                <FloatingLabelInput label="Confirm Password" name="password_confirmation" type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} errors={errors.password_confirmation} required={!user} newInputClassName={darkInput} newLabelClassName={darkLabel} />
                <UploadInput label="Picture" name="profile_picture" value={photo} onChange={setPhoto} existingImageUrl={user?.profile_picture} errors={errors.profile_picture} />
                <SubmitButton loading={submitting} label={user ? "Update" : "Save"} />
            </form>
        </Modal>
    );
};

export default UserFormModal;

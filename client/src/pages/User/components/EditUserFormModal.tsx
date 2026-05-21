import Modal from '../../../components/Modal'
import FloatingLabelInput from '../../../components/inputs/FloatingLabelInput'
import FloatingLabelSelect from '../../../components/select/FloatingLabelSelect'
import CloseButton from '../../../components/buttons/CloseButton'
import SubmitButton from '../../../components/buttons/SubmitButton'
import { useEffect, useState, type FC, type FormEvent } from 'react'
import GenderService from '../../../services/GenderService'
import UserService from '../../../services/UserService'
import type { UserColumns, UserFieldErrors } from '../../../interfaces/UserInterface'
import { requiredField } from '../../../utils/formValidation'
import type { GenderColumns } from '../../../interfaces/GenderInterface'
import UploadInput from '../../../components/inputs/UploadInput'

interface EditUserFormModalprops {
    user: UserColumns | null;
    onUserUpdated: (message: string) => void;
    refreshKey: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const EditUserFormModal: FC<EditUserFormModalprops> = ({
    user,
    onUserUpdated,
    refreshKey,
    isOpen,
    onClose,
}) => {
    const [loadingGenders, setLoadingGenders] = useState(false);
    const [genders, setGenders] = useState<GenderColumns[]>([]);

    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [existingProfilePicture, setExistingProfilePicture] = useState<string | null>(null);
    const [editUserProfilePicture, setEditUserProfilePicture] = useState<File | null>(null);
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
    const [suffixName, setSuffixName] = useState("");
    const [gender, setGender] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [username, setUsername] = useState("");
    const [errors, setErrors] = useState<UserFieldErrors>({});

    const validateEditUser = (): UserFieldErrors => {
        const validationErrors: UserFieldErrors = {}
        const fields: [keyof UserFieldErrors, string][] = [
            ['first_name', firstName],
            ['last_name', lastName],
            ['gender', gender],
            ['birth_date', birthDate],
            ['username', username],
        ]
        for (const [key, value] of fields) {
            const fieldError = requiredField(value)
            if (fieldError) validationErrors[key] = fieldError
        }
        return validationErrors
    }

    const handleUpdateUser = async (e: FormEvent) => {
        e.preventDefault()

        const validationErrors = validateEditUser()
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        try{
          setLoadingUpdate(true)
          setErrors({})

          const formData = new FormData();

            if(editUserProfilePicture){
                formData.append('edit_user_profile_picture', editUserProfilePicture);
            } else if(!existingProfilePicture) {
                formData.append('remove_profile_picture', '1')
            }

            formData.append('first_name', firstName);
            formData.append('middle_name', middleName || '');
            formData.append('last_name', lastName);
            formData.append('suffix_name', suffixName || '');
            formData.append('gender', gender);
            formData.append('birth_date', birthDate);
            formData.append('username', username);
            
          const res = await UserService.updateUser(user?.user_id!, formData);

            if (res.status >= 200 && res.status < 300) {
                setExistingProfilePicture(
                    res.data?.user?.profile_picture ? res.data.user.profile_picture : null
                );
                setEditUserProfilePicture(null);
                // Close modal first so it does not cover the toast (Modal uses z-9999).
                onClose();
                onUserUpdated(
                    res.data?.message ?? 'User Successfully Updated.'
                );
                refreshKey();
            } else {
                console.error(
                    "Unexpected status error occurred during updating user: ",
                    res.status
                );
            }

        } catch (error: any) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                console.error(
                    "Unexpected server error occurred during updating user",
                    error
                );
            }

        } finally {
            setLoadingUpdate(false);
        } 
    };


    const handleLoadGenders = async () => {
        try {
            
            setLoadingGenders(true)

            const res = await GenderService.loadGenders()
            if (res.status === 200) {
                setGenders(res.data.genders)
            } else {
                console.error("Unexpected Status Error Occured during loading Genders: ", res.status)
            }
        } catch (error ) {
            console.error("Unexpected server Error Occured during loading Genders: ", error)

        } finally {
            setLoadingGenders(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            handleLoadGenders();
            
        }
    }, [isOpen]) 


    useEffect(() => {
        if (user) {
            setEditUserProfilePicture(null);
            setExistingProfilePicture(user.profile_picture ? user.profile_picture : null);

            setFirstName(user.first_name);
            setMiddleName(user.middle_name ?? user.midlle_name ?? "");
            setLastName(user.last_name ?? "");
            setSuffixName(user.suffix_name ?? "");
            setGender(user.gender.gender_id.toString());
            setBirthDate(user.birth_date);
            setUsername(user.username);
        } else{
            console.error("Unexpected user error occurred during getting user details: ",
                user
            );
        }
    }, [user]);

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} showCloseButton className="bg-white rounded">
                <form onSubmit={handleUpdateUser} noValidate>
                    <h1 className="text-2-xl border-b boarder-gray-100 p-4 font-semibold mb-4">Edit User Form</h1>
                    <div className="mb-4"></div>
                        <UploadInput label="Profile Picture" name= "edit_user_profile_picture" value={editUserProfilePicture} onChange={setEditUserProfilePicture} onRemoveExistingImageUrl={() => setExistingProfilePicture(null)} existingImageUrl={existingProfilePicture} errors={errors.edit_user_profile_picture} />
                    <div className="grid grid-cols-2 gap-4 border-b border-gray-100 mb-4">
                        <div className="col-span-2 md:col-span-1">
                            <div className="mb-4">
                                <FloatingLabelInput label="First Name" type="text" name="first_name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required autoFocus errors={errors.first_name} />
                            </div>
                            <div className="mb-4">
                                <FloatingLabelInput label="Middle Name" type="text" name="middle_name" value={middleName} onChange={(e) => setMiddleName(e.target.value)} errors={errors.middle_name} />
                            </div>
                            <div className="mb-4">
                                <FloatingLabelInput label="Last Name" type="text" name="last_name" value={lastName} onChange={(e) => setLastName(e.target.value)} required errors={errors.last_name} />
                            </div>
                            <div className="mb-4">
                                <FloatingLabelInput label="Suffix Name" type="text" name="suffix_name" value={suffixName} onChange={(e) => setSuffixName(e.target.value)} errors={errors.suffix_name} />
                            </div>
                            <div className="mb-4">
                                <FloatingLabelSelect label="Gender " name="gender" value={gender} onChange={(e) => setGender(e.target.value)} required errors={errors.gender}>
                                    {loadingGenders ? (
                                        <option value="">Loading...</option>
                                    ) : (
                                        <>
                                            <option value="">Select Gender</option>
                                            {genders.map((g, index) => (
                                                <option value={g.gender_id} key={index}>{g.gender}</option>
                                            ))}
                                        </>
                                    )}
                                </FloatingLabelSelect>
                            </div>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <div className="mb-4">
                                <FloatingLabelInput label="Birth Date" type="date" name="birth_date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required errors={errors.birth_date} />
                            </div>
                            <div className="mb-4">
                                <FloatingLabelInput label="Username" type="text" name="username" value={username} onChange={(e) => setUsername(e.target.value)} required errors={errors.username} />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        {loadingUpdate && (
                            <CloseButton label="Close" onClose={onClose} />
                        )}
                        <SubmitButton label="Update User" loading={loadingUpdate} loadingLabel="Updating User... " />
                    </div>
                </form>
            </Modal>
        </>
    )
}

export default EditUserFormModal

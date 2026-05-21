
import { useEffect, useState, type FC, type FormEvent } from "react"
import FloatingLabelInput from "../../../components/inputs/FloatingLabelInput"
import Modal from "../../../components/Modal/index"
import FloatingLabelSelect from "../../../components/select/FloatingLabelSelect"
import SubmitButton from "../../../components/buttons/SubmitButton"
import CloseButton from "../../../components/buttons/CloseButton"
import GenderService from "../../../services/GenderService";
import UserService from "../../../services/UserService";
import type { UserFieldErrors } from "../../../interfaces/UserInterface"
import { requiredField } from "../../../utils/formValidation"
import type { GenderColumns } from "../../../interfaces/GenderInterface"
import UploadInput from "../../../components/inputs/UploadInput"

interface AddUserFormModalProps {
    onUserAdded: (message: string, failed?: boolean) => void
    isOpen: boolean;
    onClose: () => void;
    refreshKey: () => void;
}

const AddUserFormModal: FC<AddUserFormModalProps> = ({ onUserAdded, isOpen, onClose, refreshKey }) => {
    const [loadingGenders, setLoadingGenders] = useState(false);
    const [genders, setGenders] = useState<GenderColumns[]> ([]);

    const [loadingStore, setLoadingStore] = useState(false);
    const [addUserProfilePicture, setAddUserProfilePicture] = useState<File | null>(null);
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [suffixName, setSuffixName] = useState('');
    const [gender, setGender] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const [errors, setErrors] = useState<UserFieldErrors>({});

    const validateAddUser = (): UserFieldErrors => {
        const validationErrors: UserFieldErrors = {}
        const fields: [keyof UserFieldErrors, string][] = [
            ["first_name", firstName],
            ["last_name", lastName],
            ["gender", gender],
            ["birth_date", birthDate],
            ["username", username],
            ["password", password],
            ["password_confirmation", passwordConfirmation],
        ]
        for (const [key, value] of fields) {
            const fieldError = requiredField(value)
            if (fieldError) validationErrors[key] = fieldError
        }
        return validationErrors
    }

    const handleStoreUser = async (e: FormEvent)=> {
        e.preventDefault()

        const validationErrors = validateAddUser()
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        try {
            setLoadingStore(true)
            setErrors({})

            const formData = new FormData()

            if(addUserProfilePicture){
                formData.append('add_user_profile_picture', addUserProfilePicture)
            }

            formData.append('first_name', firstName);
            formData.append('middle_name', middleName || '');
            formData.append('last_name', lastName);
            formData.append('suffix_name', suffixName || '');
            formData.append('gender', gender);
            formData.append('birth_date', birthDate);
            formData.append('username', username);
            formData.append('password', password);
            formData.append('password_confirmation', passwordConfirmation);

            const res = await UserService.storeUser(formData);

            if (res.status >= 200 && res.status < 300) {
                setAddUserProfilePicture(null);
                setFirstName('');
                setMiddleName('');
                setLastName('');
                setSuffixName('');
                setGender('');
                setBirthDate('');
                setUsername('');
                setPassword('');
                setPasswordConfirmation('');
                setErrors({});

                onClose();
                onUserAdded(res.data?.message ?? 'User Successfully Saved');
                refreshKey();
            } else {
                console.error('Unexpected Status error occured during adding user: ', res.status)
            }

        } catch (error: any) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors)
            } else {
                const message =
                    error.response?.data?.message ??
                    'Something went wrong while saving the user. Please try again.';
                onUserAdded(message, true);
                console.error('Unexpected server error occured during adding user: ', error)
            }
        }
        finally {
            setLoadingStore(false);
        }
    }

        const handleLoadGenders = async () => {
        try {
            
            setLoadingGenders(true)

            const res = await GenderService.loadGenders()
            if (res.status === 200) {
                setGenders(res.data.genders)
            } else {
                console.error('Unexpected Status Error Occured during loading Genders: ', res.status)
            }
        } catch (error ) {
            console.error('Unexpected server Error Occured during loading Genders: ', error)

        } finally {
            setLoadingGenders(false);
        }
    };

useEffect(() => {
    if (isOpen) {
        handleLoadGenders();
        
    }
}, [isOpen])

    const EyeIcon = ({ closed = false }: { closed?: boolean }) => (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
            <circle cx="12" cy="12" r="3" />
            {closed && <path d="M3 3l18 18" />}
        </svg>
    )

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} showCloseButton className="bg-white rounded">
                <form onSubmit={handleStoreUser} noValidate>
                    <h1 className="text-2-xl border-b boarder-gray-100 p-4 font-semibold mb-4"> Add User Form</h1>
                    <div className="mb-4">
                        <UploadInput label= "Profile Picture" name="add_user_profile_picture" value={addUserProfilePicture} onChange={setAddUserProfilePicture} errors={errors.add_user_profile_picture} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-b border-gray-100 mb-4">
                        <div className="col-span-2 md:col-span-1">
                            <div className="mb-4">
                                <FloatingLabelInput label="First Name" type="text" name="first_name" value={firstName} onChange={ (e) => setFirstName(e.target.value)} required autoFocus errors={errors.first_name} />
                            </div>
                            <div className="mb-4">
                                <FloatingLabelInput label="Middle Name" type="text" name="middle_name" value={middleName} onChange={(e) => setMiddleName(e.target.value)} errors={errors.middle_name} />
                            </div>
                            <div className="mb-4">
                                <FloatingLabelInput label="Last Name" type="text" name="last_name" value={lastName} onChange={(e) => setLastName(e.target.value)} required errors={errors.last_name} />
                            </div>
                            <div className="mb-4">
                                <FloatingLabelInput label="Suffix Name" type="text" name="suffix_name" value={suffixName} onChange={(e) =>setSuffixName(e.target.value)} errors={errors.suffix_name}/>
                            </div>
                            <div className="mb-4">
                                <FloatingLabelSelect label="Gender " name="gender" value={gender} onChange={(e) => setGender(e.target.value)} required errors={errors.gender}> 
                                    {loadingGenders ?
                                        (<option value="" > Loading... </option> ) : (
                                            <>
                                            <option value="">Select Gender</option>
                                        {genders.map ((gender, index) =>(
                                        <option value={gender.gender_id} key={index}>{gender.gender}</option>
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
                                <FloatingLabelInput label="Username" type="text" name="username" value={username} onChange={(e) => setUsername(e.target.value)} required  errors={errors.username}/>
                            </div>
                            <div className="mb-4">
                                <FloatingLabelInput
                                    label="Password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    errors={errors.password}
                                    rightElement={
                                        <button
                                            type="button"
                                            className="text-gray-500 hover:text-gray-700"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            title={showPassword ? "Hide password" : "Show password"}
                                        >
                                            <EyeIcon closed={!showPassword} />
                                        </button>
                                    }
                                />
                            </div>
                            <div className="mb-4">
                                <FloatingLabelInput
                                    label="Password Confirmation"
                                    type={showPasswordConfirmation ? "text" : "password"}
                                    name="password_confirmation"
                                    value={passwordConfirmation}
                                    onChange={(e) =>setPasswordConfirmation(e.target.value)}
                                    required
                                    errors={errors.password_confirmation}
                                    rightElement={
                                        <button
                                            type="button"
                                            className="text-gray-500 hover:text-gray-700"
                                            onClick={() => setShowPasswordConfirmation((prev) => !prev)}
                                            aria-label={showPasswordConfirmation ? "Hide confirmation password" : "Show confirmation password"}
                                            title={showPasswordConfirmation ? "Hide confirmation password" : "Show confirmation password"}
                                        >
                                            <EyeIcon closed={!showPasswordConfirmation} />
                                        </button>
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        { loadingStore && ( 

                            <CloseButton label="Close" onClose={onClose} />
                        )}
                        <SubmitButton label="Save User" loading={loadingStore} loadingLabel="Saving User... " />
                    </div>


                </form>
            </Modal>
        </>
    )
}

export default AddUserFormModal
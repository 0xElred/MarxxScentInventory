import { useState, type FC, type FormEvent } from "react"
import SubmitButton from "../../../components/buttons/SubmitButton"
import FloatingLabelInput from "../../../components/inputs/FloatingLabelInput"
import GenderService from "../../../services/GenderService"
import type { GenderFieldErrors } from "../../../interfaces/GenderInterface"
import { requiredField } from "../../../utils/formValidation"

interface AddGenderFormProps {
    onGenderAdded: (message: string) => void
    refreshKey: () => void;
}

const AddGenderForm: FC<AddGenderFormProps> = ({onGenderAdded, refreshKey}) => {
    const [loadingStore, setLoadingStore] = useState(false)
    const [gender, setGender] = useState ('')
    const [errors, setErrors] = useState<GenderFieldErrors>({});

    const handleStoreGender = async (e: FormEvent) => {
        e.preventDefault()

        const genderError = requiredField(gender)
        if (genderError) {
            setErrors({ gender: genderError })
            return
        }

        try {
            setLoadingStore(true)
            
            const res = await GenderService.storeGender({gender})
            if (res.status === 200) {
                setGender("");
                setErrors({});
                onGenderAdded(res.data.message);
                refreshKey()
            }else {
                console.error('Unexpected Error Occured during Storing the gender: ', res.data)
            }
        } catch (error: any) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors)
            }else {
                console.error('Unexpected server Error during Storing Gender; ', error)

            }
            
        }
        finally {
            setLoadingStore(false);
        }
    };
    return (
        <>
            <form onSubmit={handleStoreGender} noValidate>
                <div className="mb-4">
                    <FloatingLabelInput
                        label="Gender"
                        type="text"
                        name="gender"
                        value={gender}
                        onChange={(e)=> {
                            setGender(e.target.value)
                            if (errors.gender) {
                                setErrors({})
                            }
                        }}
                        required
                        autoFocus
                        errors={errors?.gender}
                    />
                </div>
                <div>
                    <SubmitButton label="Save Gender" loading={loadingStore} loadingLabel="Saving Gender..." />
                </div>
            </form>
        </>
    )
}

export default AddGenderForm;
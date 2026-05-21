import { useEffect, useState, type FC, type FormEvent } from "react";
import BackButton from "../../../components/buttons/BackButton"
import SubmitButton from "../../../components/buttons/SubmitButton"
import FloatingLabelInput from "../../../components/inputs/FloatingLabelInput"
import GenderService from "../../../services/GenderService";
import { useParams } from "react-router-dom";
import Spinner from "../../../components/Spinner/Spinner";
import type { GenderFieldErrors } from "../../../interfaces/GenderInterface";
import { requiredField } from "../../../utils/formValidation";

interface EditGenderFormProps {
    onGenderUpdated: (message: string) => void
}

const EditGenderForm: FC<EditGenderFormProps> = ({onGenderUpdated}) => {
    const [ loadingGet, setLoadingGet] = useState(false);
    const [ loadingUpdate, setLoadingUpdate] = useState(false);
    const [ gender, setGender] = useState(" ");
    const [ errors, setErrors] =useState<GenderFieldErrors>({});

    const {gender_id} = useParams()

    const handleGetGender = async (genderId: string | number) => {
        try {
            setLoadingGet(true)

            const res = await GenderService.getGender(genderId)

            if (res.status === 200 ) {
                setGender(res.data.gender.gender)
            } else {
                console.error('Unexpected status error occured during getting gender: ', res.status)
            }
        } catch (error) {
            console.error('Unexpected server error occured during getting gender: ', error)
        } finally {
            setLoadingGet(false)
        }
    };

const handleUpdateGender  = async (e: FormEvent) => {
    e.preventDefault()

    const genderError = requiredField(gender)
    if (genderError) {
        setErrors({ gender: genderError })
        return
    }

    try {
        setLoadingUpdate(true)

        const res = await GenderService.updateGender(gender_id!, {gender})
        if (res.status === 200) {
            setErrors({})
            setGender(res.data.gender.gender)
            onGenderUpdated(res.data.message)
        } else {
            console.error('Unexpected status error occured during updating gender:', res.status);
        }

    } catch (error: any) {
        if (error.response && error.response.status === 422)  {
            setErrors(error.response.data.errors)
        } else {
            console.error('Unexpected server error occured during getting gender: ', error)
        }
    }
    finally{
        setLoadingUpdate(false)
    }
};

useEffect( () => {
    if (gender_id) {
        const parseGenderId = parseInt(gender_id)
        handleGetGender(parseGenderId)
    } else {
        console.error('Unexpected Parameter error occured during getting gender:', gender_id )
    }
}, [gender_id]);

    return (
        <>
        {loadingGet ? (
            <div className="flex justify-center items-center mt-52" >
            <Spinner size="lg" />
            </div>
        ) : (

            <form onSubmit={handleUpdateGender} noValidate>
                <div>
                    <FloatingLabelInput label="Gender" type="text" name="gender" value={gender} onChange={(e) => setGender(e.target.value)} errors={errors.gender} required autoFocus />
                </div>
                <div className="flex justify-end mt-4 gap-4">
                    {!loadingUpdate && 
                        <BackButton label="Back" path="/genders" />
                    }

                    <SubmitButton label="Update Gender" loading={loadingUpdate} loadingLabel="UpdatingGender..." />
                </div>
            </form>

        )}
        </>
    )
}

export default EditGenderForm
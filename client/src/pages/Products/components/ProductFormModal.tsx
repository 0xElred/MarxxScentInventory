import { useEffect, useState, type FC, type FormEvent } from "react";
import Modal from "../../../components/Modal";
import FloatingLabelInput from "../../../components/inputs/FloatingLabelInput";
import UploadInput from "../../../components/inputs/UploadInput";
import SubmitButton from "../../../components/buttons/SubmitButton";
import ProductService from "../../../services/ProductService";
import type { Product, ProductFieldErrors } from "../../../interfaces/ProductInterface";
import { appendFile } from "../../../utils/appendFile";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSaved: (message: string) => void;
    product?: Product | null;
}

const ProductFormModal: FC<Props> = ({ isOpen, onClose, onSaved, product }) => {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [photo, setPhoto] = useState<File | null>(null);
    const [errors, setErrors] = useState<ProductFieldErrors>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        if (product) {
            setName(product.name);
            setPrice(String(product.price));
            setDescription(product.description ?? "");
            setPhoto(null);
        }
        setErrors({});
    }, [product, isOpen]);

    const clearAddForm = () => {
        setName("");
        setPrice("");
        setDescription("");
        setPhoto(null);
        setErrors({});
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});
        const fd = new FormData();
        fd.append("name", name);
        fd.append("price", price);
        fd.append("description", description);
        if (photo) appendFile(fd, "photo", photo);

        try {
            const res = product
                ? await ProductService.updateProduct(product.product_id, fd)
                : await ProductService.storeProduct(fd);
            if (res.status === 200) {
                if (!product) clearAddForm();
                onSaved(res.data.message);
                onClose();
            }
        } catch (err: unknown) {
            const axiosErr = err as { response?: { status?: number; data?: { errors?: ProductFieldErrors } } };
            if (axiosErr.response?.status === 422) {
                setErrors(axiosErr.response.data?.errors ?? {});
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton className="bg-[#111111] border border-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-white">
                {product ? "Edit Product" : "Add New Product"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <FloatingLabelInput label="Name" name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} errors={errors.name} required newInputClassName="block w-full rounded-lg border border-gray-700 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white" newLabelClassName="text-gray-400" />
                <FloatingLabelInput label="Price" name="price" type="text" value={price} onChange={(e) => setPrice(e.target.value)} errors={errors.price} required newInputClassName="block w-full rounded-lg border border-gray-700 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white" newLabelClassName="text-gray-400" />
                <FloatingLabelInput label="Description" name="description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} errors={errors.description} newInputClassName="block w-full rounded-lg border border-gray-700 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white" newLabelClassName="text-gray-400" />
                <UploadInput label={product ? "Photo (optional)" : "Photo"} name="photo" value={photo} onChange={setPhoto} errors={errors.photo} />
                <SubmitButton loading={submitting} label={product ? "Update" : "Save"} />
            </form>
        </Modal>
    );
};

export default ProductFormModal;

/** Append a file to FormData with a filename so Laravel recognizes the upload. */
export const appendFile = (fd: FormData, field: string, file: File) => {
    fd.append(field, file, file.name);
};

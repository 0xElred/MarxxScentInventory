export const REQUIRED_MESSAGE = "This field is required.";

export function requiredField(
    value: string | null | undefined
): string[] | undefined {
    if (value == null || String(value).trim() === "") {
        return [REQUIRED_MESSAGE];
    }
    return undefined;
}

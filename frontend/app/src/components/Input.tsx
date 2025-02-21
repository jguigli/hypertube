
export default function Input(
    props: {
        type: string;
        placeholder: string;
        value: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        required: boolean;
        id?: string;
    }) {
    return (
        <input
            type={props.type}
            placeholder={props.placeholder}
            value={props.value}
            onChange={props.onChange}
            required={props.required}
            className="border border-gray-300 rounded-md p-2 w-full"
            id={props.id}
        />
    );
}
import TextField from '@mui/material/TextField';

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
        <TextField
            type={props.type}
            placeholder={props.placeholder}
            value={props.value}
            onChange={props.onChange}
            required={props.required}
            id={props.id}
            // variant="outlined"
            fullWidth
            size='small'
        />
    );
}
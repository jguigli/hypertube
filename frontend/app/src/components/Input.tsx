import { AttachFile, Close, Visibility, VisibilityOff } from '@mui/icons-material';
import { IconButton, InputAdornment, OutlinedInput } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { MuiFileInput } from 'mui-file-input'
import { useTranslation } from 'react-i18next';

export default function Input(
    props: {
        type?: string;
        placeholder?: string;
        value?: string;
        onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
        required?: boolean;
        id?: string;
        autocomplete?: string;
        disabled?: boolean;
    }) {

    return (
        <TextField
            type={props.type}
            placeholder={props.placeholder}
            value={props.value}
            onChange={props.onChange}
            required={props.required}
            id={props.id}
            fullWidth
            size='small'
            variant='outlined'
            autoComplete={props.autocomplete ? (props.autocomplete) : 'off'}
            disabled={props.disabled ? props.disabled : false}
            className='overflow-hidden'
        />
    );
}

export function PasswordInput(
    props: {
        placeholder: string;
        value: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        required: boolean;
        id?: string;
        autocomplete?: string;
    }) {

    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    return (
        <OutlinedInput
            id={props.id}
            type={showPassword ? 'text' : 'password'}
            endAdornment={
                <InputAdornment position="end">
                    <IconButton
                        aria-label={
                            showPassword ? 'hide the password' : 'display the password'
                        }
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        tabIndex={-1} // Add this line to prevent tab selection
                    >
                        {showPassword ? <VisibilityOff color='disabled' /> : <Visibility color="disabled" />}
                    </IconButton>
                </InputAdornment>
            }
            onChange={props.onChange}
            value={props.value}
            required={props.required}
            placeholder={props.placeholder}
            size='small'
            autoComplete={props.autocomplete ? (props.autocomplete) : 'off'}
        />
    );
}

export function FileInput(
    props: {
        file: File | null;
        onChange: (e: File | null) => void;
    }) {
        const { t } = useTranslation();
    return (
        <MuiFileInput
            value={props.file}
            placeholder={props.file ? props.file.name : t('Choose a file')}
            size='small'
            InputProps={{
                inputProps: {
                    accept: 'image/*'
                },
                startAdornment: <AttachFile />
            }}
            clearIconButtonProps={{
                title: "Remove",
                children: <Close fontSize="small" />
            }}
            onChange={(e) => { props.onChange(e); }}
            className='overflow-hidden'
        />
    );
}
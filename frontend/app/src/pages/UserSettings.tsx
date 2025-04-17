import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import Input, { FileInput } from "../components/Input";
import CustomCard from "../components/Card";
import { Avatar, Button, InputLabel, Typography } from "@mui/material";
import UserService from "../services/UserService";
import { useTranslation } from 'react-i18next';

export default function UserSettings() {
    const { user, changeUserInfo, getToken } = useAuth();

    const [username, setUsername] = useState(user.username || "");
    const [email, setEmail] = useState(user.email || "");
    const [firstName, setFirstName] = useState(user.firstName || "");
    const [lastName, setLastName] = useState(user.lastName || "");
    const [avatar, setAvatar] = useState<string | undefined>(user.avatar || undefined);
    const [newAvatar, setNewAvatar] = useState<File | null>(null);
    const userService = new UserService();

    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [firstNameError, setFirstNameError] = useState<string | null>(null);
    const [lastNameError, setLastNameError] = useState<string | null>(null);
    const { t } = useTranslation();

    const handleAvatarChange = async (file: File | null) => {
        const token = getToken();
        if (!token) {
            alert(t("You are not authenticated"));
            return;
        } else if (!file) {
            alert(t("Please select a file"));
            return;
        }

        const response = await userService.setPicture(token, file);
        if (!response.success) {
            alert(t("An error occurred while uploading the avatar") + response.error || t("An unexpected error occurred"));
            return;
        }

        if (response.avatar) {
            setAvatar(response.avatar);
            setNewAvatar(null);
            user.avatar = response.avatar;
            changeUserInfo({ ...user, avatar: response.avatar });
        }

        alert(t("Avatar updated successfully"));
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const token = getToken();
        if (!token) {
            alert(t("You are not authenticated"));
            return;
        }

        const response = await userService.setInformations(token, email, username, firstName, lastName);
        if (!response.success) {
            if (response.error === "Username already taken") {
                setUsernameError(t("Username already taken"));
            } else if (response.error === "Email already taken") {
                setEmailError(t("Email already taken"));
            } else if (response.error === "Invalid email format") {
                setEmailError(t("Invalid email format"));
            } else if (response.error === "First name cannot be empty.") {
                setFirstNameError(t("First name cannot be empty."));
            } else if (response.error === "Last name cannot be empty.") {
                setLastNameError(t("Last name cannot be empty."));
            } else {
                alert(t("An error occurred while updating the user information: ") + response.error || t("An unexpected error occurred"));
            }
            return;
        }
        changeUserInfo({ ...user, username, email, firstName, lastName });
        alert(t("User information updated successfully"));
    }

    return (
        <CustomCard additionalClasses="flex flex-col align-center space-y-5 p-5 md:w-[500px] max-w-[100%]">
            <Typography variant="h4" className="font-bold text-center sm:text-lg md:text-2xl">
                {t("Customize your profile")}
            </Typography>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4 my-5 items-center w-full">
                <Avatar src={avatar || ""}
                    alt="Avatar"
                    sx={{ width: { xs: 60, sm: 100 }, height: { xs: 60, sm: 100 } }}
                    className="m-auto mb-5"
                />
                <div className="flex flex-col gap-2 w-full">
                    <InputLabel htmlFor="username_profile">{t("Username")}:</InputLabel>
                    <Input
                        value={username}
                        placeholder={t("Your new username")}
                        type="text"
                        onChange={(e) => {
                            setUsername(e.target.value);
                            setUsernameError(null);
                        }}
                        required
                        id="username_profile"
                    />
                    {usernameError && <Typography variant="body2" className="text-red-500">{usernameError}</Typography>}
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <InputLabel htmlFor="email_profile">{t("Email")}:</InputLabel>
                    <Input
                        value={email}
                        placeholder={t("Your new email")}
                        type="email"
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setEmailError(null);
                        }}
                        required
                        id="email_profile"
                    />
                    {emailError && <Typography variant="body2" className="text-red-500">{emailError}</Typography>}
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <InputLabel htmlFor="firstName_profile">{t("First Name")}:</InputLabel>
                    <Input
                        value={firstName}
                        placeholder={t("Your new first name")}
                        type="text"
                        onChange={(e) => {
                            setFirstName(e.target.value);
                            setFirstNameError(null);
                        }}
                        required
                        id="firstName_profile"
                    />
                    {firstNameError && <Typography variant="body2" className="text-red-500">{firstNameError}</Typography>}
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <InputLabel htmlFor="lastName_profile">{t("Last Name")}:</InputLabel>
                    <Input
                        value={lastName}
                        placeholder={t("Your new last name")}
                        type="text"
                        onChange={(e) => {
                            setLastName(e.target.value);
                            setLastNameError(null);
                        }}
                        required
                        id="lastName_profile"
                    />
                    {lastNameError && <Typography variant="body2" className="text-red-500">{lastNameError}</Typography>}
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <InputLabel htmlFor="avatar_profile">{t("Avatar")}:</InputLabel>
                    <FileInput file={newAvatar} onChange={handleAvatarChange} />
                </div>
                <div className="flex gap-5 w-full items-center ">
                    <Button variant="contained" className="w-full" type="submit">{t("Save")}</Button>
                </div>
            </form>
        </CustomCard>
    );
}

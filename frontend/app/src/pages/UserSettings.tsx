import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import Input, { FileInput } from "../components/Input";
import CustomCard from "../components/Card";
import { Avatar, Button, InputLabel, Typography } from "@mui/material";
import UserService from "../services/UserService";

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

    const handleAvatarChange = async (file: File | null) => {
        const token = getToken();
        if (!token) {
            alert("You are not authenticated");
            return;
        } else if (!file) {
            alert("Please select a file");
            return;
        }

        const response = await userService.setPicture(token, file);
        if (!response.success) {
            alert("An error occurred while uploading the avatar" + response.error || "An unexpected error occurred");
            return;
        }

        if (response.avatar) {
            setAvatar(response.avatar);
            setNewAvatar(null);
            user.avatar = response.avatar;
            changeUserInfo({ ...user, avatar: response.avatar });
        }

        alert("Avatar updated successfully");
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const token = getToken();
        if (!token) {
            alert("You are not authenticated");
            return;
        }

        const response = await userService.setInformations(token, email, username, firstName, lastName, user.language);
        if (!response.success) {
            if (response.error === "Username already taken") {
                setUsernameError("Username already taken");
            } else if (response.error === "Email already taken") {
                setEmailError("Email already taken");
            } else if (response.error === "Invalid email format") {
                setEmailError("Invalid email format");
            } else {
                alert("An error occurred while updating the user information" + response.error || "An unexpected error occurred");
            }
            return;
        }
        changeUserInfo({ ...user, email, firstName, lastName });
        alert("User information updated successfully");
    }

    return (
        <CustomCard additionalClasses="flex flex-col align-center w-[500px] space-y-5 p-5">
            <Typography variant="h4" className="font-bold text-center">
                Customize your profile
            </Typography>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4 my-5 items-center w-full">
                <Avatar src={avatar} alt="Avatar" sx={{ width: 100, height: 100 }} className="m-auto" />
                <div className="flex flex-col gap-2 w-full">
                    <InputLabel htmlFor="username_profile">Username:</InputLabel>
                    <Input
                        value={username}
                        placeholder="Your new username"
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
                    <InputLabel htmlFor="email_profile">Email:</InputLabel>
                    <Input
                        value={email}
                        placeholder="Your new email"
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
                    <InputLabel htmlFor="firstName_profile">First name:</InputLabel>
                    <Input
                        value={firstName}
                        placeholder="Your new first name"
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
                    <InputLabel htmlFor="lastName_profile">Last name:</InputLabel>
                    <Input
                        value={lastName}
                        placeholder="Your new last name"
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
                    <InputLabel htmlFor="avatar_profile">Avatar:</InputLabel>
                    <FileInput file={newAvatar} onChange={handleAvatarChange} />
                </div>
                <div className="flex gap-5 w-full items-center ">
                    <Button variant="contained" className="w-full" type="submit">Save</Button>
                </div>
            </form>
        </CustomCard>
    );
}

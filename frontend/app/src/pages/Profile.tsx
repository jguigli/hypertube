import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import Input, { FileInput } from "../components/Input";
import CustomCard from "../components/Card";
import { Avatar, Button, InputLabel, Typography } from "@mui/material";

export default function Profile() {

    const params = useParams();
    const { user } = useAuth();

    const [username, setUsername] = useState(user?.username || "");
    const [email, setEmail] = useState(user?.email || "");
    const [firstName, setFirstName] = useState(user?.firstName || "");
    const [lastName, setLastName] = useState(user?.lastName || "");
    const [avatar, setAvatar] = useState<string | undefined>(user?.avatar || undefined);
    const [newAvatar, setNewAvatar] = useState<File | null>(null);

    let param_username = params.username;

    const handleAvatarChange = (file: File | null) => {
        setNewAvatar(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <CustomCard additionalClasses="flex flex-col align-center w-[500px] space-y-5 p-5">
            {param_username === user?.username ? (
                <>
                    <Typography variant="h4" className="font-bold text-center">
                        Customize your profile
                    </Typography>

                    <div className="flex flex-col space-y-4 my-5 items-center w-full">

                        <Avatar src={avatar}
                            alt="Avatar"
                            sx={{ width: 100, height: 100 }}
                        />



                        <div className="flex flex-col gap-2 w-full">
                            <InputLabel htmlFor="username_profile">Username:</InputLabel>
                            <Input
                                value={username}
                                placeholder="Your new username"
                                type="text"
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                id="username_profile"
                            />
                        </div>


                        <div className="flex flex-col gap-2 w-full">
                            <InputLabel htmlFor="email_profile">Email:</InputLabel>
                            <Input
                                value={email}
                                placeholder="Your new email"
                                type="email"
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                id="email_profile"
                            />
                        </div>


                        <div className="flex flex-col gap-2 w-full">
                            <InputLabel htmlFor="firstName_profile">First name:</InputLabel>
                            <Input
                                value={firstName}
                                placeholder="Your new first name"
                                type="text"
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                id="firstName_profile"
                            />
                        </div>

                        <div className="flex flex-col gap-2 w-full">
                            <InputLabel htmlFor="lastName_profile">Last name:</InputLabel>
                            <Input
                                value={lastName}
                                placeholder="Your new last name"
                                type="text"
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                id="lastName_profile"
                            />
                        </div>

                        <div className="flex flex-col gap-2 w-full">
                            <InputLabel htmlFor="avatar_profile">Avatar:</InputLabel>
                            <FileInput
                                file={newAvatar}
                                onChange={handleAvatarChange}
                            />
                        </div>

                        <div className="flex gap-5 w-full items-center ">
                            <Button variant="contained" className="w-full" type="submit">Save</Button>
                        </div>

                    </div>
                </>

            ) : (
                <p>This is the profile of {param_username}</p>
            )}
        </CustomCard>
    )
}

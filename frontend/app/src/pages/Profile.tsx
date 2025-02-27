import { Avatar, InputLabel, Typography } from "@mui/material";
import CustomCard from "../components/Card";
import { useParams } from "react-router-dom";
import User from "../types/User";
import { useAuth } from "../contexts/AuthContext";


export default function PublicProfile() {

    const username = useParams<{ username: string }>().username;

    if (!username) {
        return <div>User not found</div>;
    }

    const { user } = useAuth();

    const fakeUserPublicData: User = {
        id: user.id ? user.id : "0",
        username: user.username ? user.username : "john_doe",
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        language: user.language,
        is_logged_in: user.is_logged_in
    };


    return (
        <CustomCard additionalClasses="flex flex-col align-center w-[500px] space-y-5 p-5">
            <Typography variant="h4" className="font-bold text-center">
                Public Profile
            </Typography>
            <div className="flex flex-col space-y-4 my-5 items-center w-full">
                <Avatar src={fakeUserPublicData.avatar}
                    alt="Avatar"
                    sx={{ width: 100, height: 100 }}
                />
                <div className="flex flex-col gap-2 w-full">
                    <InputLabel htmlFor="username_profile">Username:</InputLabel>
                    <Typography variant="body1" color="secondary" className="font-bold border border-gray-600 p-2 rounded-md">{fakeUserPublicData.username}</Typography>
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <InputLabel htmlFor="first_name_profile">First Name:</InputLabel>
                    <Typography variant="body1" color="secondary" className="font-bold border border-gray-600 p-2 rounded-md">{fakeUserPublicData.firstName}</Typography>
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <InputLabel htmlFor="last_name_profile">Last Name:</InputLabel>
                    <Typography variant="body1" color="secondary" className="font-bold border border-gray-600 p-2 rounded-md">{fakeUserPublicData.lastName}</Typography>
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <InputLabel htmlFor="language_profile">Language:</InputLabel>
                    <Typography variant="body1" color="secondary" className="font-bold border border-gray-600 p-2 rounded-md">{fakeUserPublicData.language}</Typography>
                </div>

            </div>
        </CustomCard>
    );
}
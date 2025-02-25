import { Avatar, InputLabel, TextField } from "@mui/material";
import CustomCard from "../components/Card";
import { useParams } from "react-router-dom";
import User from "../types/User";
import Input from "../components/Input";


export default function ProfileView() {

    const username = useParams<{ username: string }>().username;

    if (!username) {
        return <div>User not found</div>;
    }

    // Fetch user data from the backend
    const fakeUserPublicData: User = {
        id: "0",
        username: username ? username : "john_doe",
        firstName: "John",
        lastName: "Doe",
        avatar: "https://randomuser.me/api/portraits/women/76.jpg"
    };


    return (
        <CustomCard additionalClasses="flex flex-col align-center w-[500px] space-y-5 p-5">

            <div className="flex flex-col space-y-4 my-5 items-center w-full">

                <Avatar src={fakeUserPublicData.avatar}
                    alt="Avatar"
                    sx={{ width: 100, height: 100 }}
                />

                <div className="flex flex-col gap-2 w-full">
                    <InputLabel htmlFor="username_profile">Username:</InputLabel>
                    <TextField
                        type="text"
                        value={fakeUserPublicData.username}
                        fullWidth
                        size='small'
                        variant='outlined'
                        disabled={true}
                        sx={{
                            color: '#fff'
                        }}
                        color="secondary"
                    />
                    {/* <Input
                        value={fakeUserPublicData.username}
                        type="text"
                        required
                        disabled
                    /> */}
                </div>

                <div className="flex flex-col gap-2 w-full">
                    <InputLabel htmlFor="first_name_profile">First Name:</InputLabel>
                    <Input
                        value={fakeUserPublicData.firstName}
                        type="text"
                        required
                        disabled
                    />
                </div>

                <div className="flex flex-col gap-2 w-full">
                    <InputLabel htmlFor="last_name_profile">Last Name:</InputLabel>
                    <Input
                        value={fakeUserPublicData.lastName}
                        type="text"
                        required
                        disabled
                    />
                </div>

            </div>

        </CustomCard>
    )
}

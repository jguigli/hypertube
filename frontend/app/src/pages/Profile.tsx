import { Avatar, Button, InputLabel, Typography } from "@mui/material";
import CustomCard from "../components/Card";
import { Link, useParams } from "react-router-dom";
import User from "../types/User";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import UserService from "../services/UserService";
import { useActiveLink } from "../contexts/ActiveLinkContext";
import { useTranslation } from 'react-i18next';


export default function PublicProfile() {

    const username = useParams<{ username: string }>().username;
    const { t } = useTranslation();

    if (!username) {
        return <div>{t("User not found")}</div>;
    }

    const { user, getToken } = useAuth();
    const userService = new UserService();

    const [profileUser, setProfileUser] = useState<User>(user);
    const [userFound, setUserFound] = useState(true);
    const { setActiveLink } = useActiveLink();

    useEffect(() => {
        const fetchData = async () => {

            if (username === user.username) {
                setProfileUser(user);
            } else {

                // GET /users
                const token = getToken();
                if (!token) {
                    alert("You are not authenticated");
                    return;
                }
                const response = await userService.getUsers(token);
                if (!response.success || !response.users) {
                    alert(t("An error occurred while fetching the list of users") + (response.error || t("An unexpected error occurred")));
                    return;
                }
                const users = response.users;
                const correspondingUserID = users.find((u: any) => u.user_name === username)?.id;
                if (!correspondingUserID) {
                    alert(t("User not found") + ": " + username);
                    setUserFound(false);
                    return;
                }

                setUserFound(true);

                // GET /users/:id
                const fetchedProfileUser = await userService.getUser(correspondingUserID, token);
                if (!fetchedProfileUser.success || !fetchedProfileUser.user) {
                    alert(t("An error occurred while fetching the user infos") + (fetchedProfileUser.error || t("An unexpected error occurred")));
                    return;
                }

                // GET /users/:id/picture
                const fetchedProfileUserPicture = await userService.getPictureById(correspondingUserID, token);
                if (fetchedProfileUserPicture.success && fetchedProfileUserPicture.avatar) {
                    fetchedProfileUser.user.avatar = fetchedProfileUserPicture.avatar;
                }

                const resultUser: User = {
                    username: fetchedProfileUser.user.username,
                    firstName: fetchedProfileUser.user.firstName,
                    lastName: fetchedProfileUser.user.lastName,
                    language: fetchedProfileUser.user.language,          // useless but required for the type
                    is_logged_in: fetchedProfileUser.user.is_logged_in,  // useless but required for the type
                    avatar: fetchedProfileUser.user.avatar
                };

                setProfileUser(resultUser);
            }
        };

        fetchData();
    }, [username]);

    return (
        <CustomCard additionalClasses="flex flex-col align-center space-y-5 p-5 md:w-[500px] max-w-[100%]">
            {
                !userFound ? (
                    <>
                    <Typography variant="h4" className="font-bold text-center">{t("User not found")}</Typography>
                    <Link to="/" className="w-full" onClick={() => setActiveLink("/")}>
                        <Button variant="contained" color="primary" className="w-full">{t("Go back to home")}</Button>
                    </Link>
                    </>
                ) : (

                    <>
                        <Typography variant="h4" className="font-bold text-center">
                            {t("Public Profile")}
                        </Typography>
                        <div className="flex flex-col space-y-4 my-5 items-center w-full">
                            <Avatar src={profileUser.avatar || ""}
                                alt="Avatar"
                                sx={{ width: { xs: 60, sm: 100 }, height: { xs: 60, sm: 100 } }}
                                className="m-auto mb-5"
                            />
                            <div className="flex flex-col gap-2 w-full">
                                <InputLabel htmlFor="username_profile">{t("Username")}:</InputLabel>
                                <Typography variant="body1" color="secondary" className="font-bold border border-gray-600 p-2 rounded-md overflow-hidden text-sm sm:text-base">{profileUser.username}</Typography>
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <InputLabel htmlFor="first_name_profile">{t("First Name")}:</InputLabel>
                                <Typography variant="body1" color="secondary" className="font-bold border border-gray-600 p-2 rounded-md overflow-hidden text-sm sm:text-base">{profileUser.firstName}</Typography>
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <InputLabel htmlFor="last_name_profile">{t("Last Name")}:</InputLabel>
                                <Typography variant="body1" color="secondary" className="font-bold border border-gray-600 p-2 rounded-md overflow-hidden text-sm sm:text-base">{profileUser.lastName}</Typography>
                            </div>
                        </div>
                    </>
                )
            }
        </CustomCard>
    );
}
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { IconButton, InputBase, Typography } from "@mui/material";
import React from "react";
import { MenuItem } from "@mui/material";
import { useSearch } from "../contexts/SearchContext.tsx";
import { Search } from "@mui/icons-material";
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';


function Logo() {
    return (
        <Link to="/" id="logo">
            <Typography variant="h6">Hypertube</Typography>
        </Link>
    );
}

function SearchBar() {

    const { searchQuery, setSearchQuery } = useSearch();

    return (
        <div className="flex flex-row items-center w-full bg-gray-800 rounded-md mx-4 max-w-[400px]">
            <form onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-row items-center w-full">
                    <InputBase
                        sx={{ ml: 2, flex: 1, color: 'inherit' }}
                        placeholder="Search movies"
                        value={searchQuery}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            setSearchQuery(event.target.value);
                        }}
                        inputProps={{ 'aria-label': 'search movies' }}
                    />
                    <IconButton type="submit" sx={{ p: '5px', mr: 2 }} aria-label="search">
                        <Search />
                    </IconButton>
                </div>
            </form>
        </div>
    );
}

export function LanguageSelection() {

    const { user, changeUserLanguage } = useAuth();

    const handleChange = (event: SelectChangeEvent) => {
        const language = event.target.value;
        if (language === "en" || language === "fr") {
            changeUserLanguage(language);
        }
    };

    return (
        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <InputLabel id="demo-select-small-label">Language</InputLabel>
            <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={user.language}
                label="Language"
                onChange={handleChange}
                size="small"
            >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="fr">French</MenuItem>
            </Select>
        </FormControl>
    );
}

// function UserMenu() {

//     const { user, logout } = useAuth();
//     const { setSearchQuery } = useSearch();
//     const navigate = useNavigate();
//     const [anchorEl, setAnchorEl] = useState<null | Element>(null);
//     const open = Boolean(anchorEl);

//     const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
//         event.preventDefault();
//         setAnchorEl(event.currentTarget);
//     };

//     const handleClose = () => {
//         setAnchorEl(null);
//     };

//     return (
//         <>
//             <IconButton
//                 id="account-menu-button"
//                 onClick={handleClick}
//                 size="small"
//                 sx={{ ml: 2 }}
//                 aria-controls={open ? 'account-menu' : undefined}
//                 aria-haspopup="true"
//                 aria-expanded={open ? 'true' : undefined}
//                 onMouseEnter={handleClick}
//             >
//                 {user ? (
//                     <Avatar sx={{ width: 32, height: 32, bgcolor: "secondary.main" }} src={user.avatar} />
//                 ) : (
//                     <Avatar sx={{ width: 32, height: 32, bgcolor: "secondary.main" }} />

//                 )}
//             </IconButton>

//             <Menu
//                 id="account-menu"
//                 anchorEl={anchorEl}
//                 open={open}
//                 onClose={handleClose}
//                 MenuListProps={{ 'aria-labelledby': 'account-menu-button' }}
//             >
//                 {user && (
//                     <MenuItem onClick={() => {
//                         handleClose();
//                         navigate(`/profile/${user.username}`);
//                     }}>
//                         <ListItemIcon>
//                             <AccountCircleIcon />
//                         </ListItemIcon>
//                         <ListItemText>Profile</ListItemText>
//                     </MenuItem>
//                 )}

//                 {user && (
//                     <MenuItem onClick={() => {
//                         logout();
//                         setSearchQuery("");
//                         handleClose();
//                         navigate("/");
//                     }}>
//                         <ListItemIcon>
//                             <LogoutIcon />
//                         </ListItemIcon>
//                         <ListItemText>Logout</ListItemText>
//                     </MenuItem>
//                 )}

//                 {!user && (
//                     <MenuItem onClick={() => {
//                         handleClose();
//                         navigate("/login");
//                     }}>
//                         <ListItemIcon>
//                             <LoginOutlined />
//                         </ListItemIcon>
//                         <ListItemText>Login</ListItemText>
//                     </MenuItem>
//                 )}

//                 {!user && (
//                     <MenuItem onClick={() => {
//                         handleClose();
//                         navigate("/register");
//                     }}>
//                         <ListItemIcon>
//                             <AppRegistrationOutlined />
//                         </ListItemIcon>
//                         <ListItemText>Register</ListItemText>
//                     </MenuItem>
//                 )}

//             </Menu>
//         </>
//     );
// }


export default function Navbar() {
    return (
        <nav
            id="navbar"
            className="flex flex-row justify-between items-center max-h-[50px] w-full p-3 bg-gray-950 text-white sticky top-0 z-50 border-b border-gray-500/50"
        >
            <Logo />
            <SearchBar />
            <div className="flex flex-row items-center">
                <LanguageSelection />
                {/* <UserMenu /> */}
            </div>
        </nav>
    );
}

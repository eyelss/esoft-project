import { Card, CardContent, IconButton, CardActionArea, Typography, Alert, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../features/authSlice";
import AddIcon from '@mui/icons-material/Add';
import LockIcon from '@mui/icons-material/Lock';

function EmptyCard() {
    const navigate = useNavigate();
    const user = useSelector(selectUser);

    const handleClick = () => {
        if (user) {
            navigate('/recipe');
        } else {
            navigate('/login');
        }
    };

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardActionArea 
                onClick={handleClick}
                sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 200
                }}
            >
                <CardContent sx={{ textAlign: 'center' }}>
                    {user ? (
                        // Authenticated user - show create recipe option
                        <>
                            <Box justifySelf="center"
                                sx={{ 
                                    mb: 2,
                                    width: 64,
                                    height: 64,
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    }
                                }}
                            >
                                <AddIcon 
                                    sx={{ fontSize: 32 }} 
                                />
                            </Box>
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                                Create New Recipe
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Start building your recipe
                            </Typography>
                        </>
                    ) : (
                        // Non-authenticated user - show auth reminder
                        <>
                            <Box justifySelf="center"
                                sx={{ 
                                    mb: 2,
                                    width: 64,
                                    height: 64,
                                    backgroundColor: 'grey.300',
                                    color: 'grey.600',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    '&:hover': {
                                        backgroundColor: 'grey.400',
                                        color: 'grey.700',
                                    }
                                }}
                            >
                                <LockIcon sx={{ fontSize: 32 }} />
                            </Box>
                            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                                Sign In to Create
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Click to login and start building recipes
                            </Typography>
                            <Alert severity="info" sx={{ mt: 2, fontSize: '0.75rem' }}>
                                You need to be logged in to create recipes
                            </Alert>
                        </>
                    )}
                </CardContent>
            </CardActionArea>
        </Card>
    );
}

export default EmptyCard;
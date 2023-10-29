import * as React from 'react';
import { CssVarsProvider, useColorScheme } from '@mui/joy/styles';
import GlobalStyles from '@mui/joy/GlobalStyles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormLabel, { formLabelClasses } from '@mui/joy/FormLabel';
import IconButton, { IconButtonProps } from '@mui/joy/IconButton';
import Input from '@mui/joy/Input';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {useState} from "react";
import Alert from '@mui/joy/Alert';
//import Checkbox from "@mui/joy/Checkbox";

interface FormElements extends HTMLFormControlsCollection {
    fullName: HTMLInputElement;
    email: HTMLInputElement;
    password: HTMLInputElement;
    confirmPassword : HTMLInputElement;
}
interface SignUpFormElement extends HTMLFormElement {
    readonly elements: FormElements;
}

function ColorSchemeToggle({ onClick, ...props }: IconButtonProps) {
    const { mode, setMode } = useColorScheme();
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) {
        return <IconButton size="sm" variant="outlined" color="neutral" disabled />;
    }
    return (
        <IconButton
            id="toggle-mode"
            size="sm"
            variant="outlined"
            color="neutral"
            aria-label="toggle light/dark mode"
            {...props}
            onClick={(event) => {
                if (mode === 'light') {
                    setMode('dark');
                } else {
                    setMode('light');
                }
                onClick?.(event);
            }}
        >
            {mode === 'light' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
        </IconButton>
    );
}

export default function SignUp() {

    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    //const [showPassword, setshowPassword] = useState(false);


    const handleSubmit = async (event: React.FormEvent<SignUpFormElement>) => {
        event.preventDefault();
        const formElements = event.currentTarget.elements;
        const data = {
            name: formElements.fullName.value,
            email: formElements.email.value,
            password: formElements.password.value,
        };
        const password = formElements.password.value;
        // Password validation using regex
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        const isPasswordValid = passwordRegex.test(password);
        const confirmPassword = formElements.confirmPassword.value;

        alert(JSON.stringify(data, null, 2)); // Test purpose to be removed.

        if (!isPasswordValid)
        {
            setPasswordError('Password must have at least 8 characters, 1 symbol, 1 uppercase letter, 1 lowercase letter, and 1 digit.');
        }
        else
        {
            setPasswordError('');
        }

        if (isPasswordValid && password !== confirmPassword)
        {
            setConfirmPasswordError('Passwords do not match');
        }
        else
        {
            setConfirmPasswordError('');
        }


        if (!passwordError && !confirmPasswordError)
        {
            try {
                const response = await axios.post('/api/signup', data, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const responseData = response.data;
                console.log(responseData);

            } catch (error) {
                console.error('Problem with Axios operation', error);
            }
        }
        else
        {
            alert("retry password")
        }

    };


    return (
        <CssVarsProvider defaultMode="dark" disableTransitionOnChange>
            <CssBaseline />
            <GlobalStyles
                styles={{
                    ':root': {
                        '--Collapsed-breakpoint': '769px', // form will stretch when viewport is below `769px`
                        '--Cover-width': '50vw', // must be `vw` only
                        '--Form-maxWidth': '800px',
                        '--Transition-duration': '0.4s', // set to `none` to disable transition
                    },
                }}
            />
            <Box
                sx={(theme) => ({
                    width:
                        'clamp(100vw - var(--Cover-width), (var(--Collapsed-breakpoint) - 100vw) * 999, 100vw)',
                    transition: 'width var(--Transition-duration)',
                    transitionDelay: 'calc(var(--Transition-duration) + 0.1s)',
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    backdropFilter: 'blur(12px)',
                    backgroundColor: 'rgba(255 255 255 / 0.2)',
                    [theme.getColorSchemeSelector('dark')]: {
                        backgroundColor: 'rgba(19 19 24 / 0.4)',
                    },
                })}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: '100dvh',
                        width:
                            'clamp(var(--Form-maxWidth), (var(--Collapsed-breakpoint) - 100vw) * 999, 100%)',
                        maxWidth: '100%',
                        px: 2,
                    }}
                >
                    <Box
                        component="header"
                        sx={{
                            py: 3,
                            display: 'flex',
                            alignItems: 'left',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Box
                            sx={{
                                gap: 2,
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <IconButton variant="soft" color="primary" size="sm">
                                <BadgeRoundedIcon />
                            </IconButton>
                            <Typography level="title-lg">Company logo</Typography>
                        </Box>
                        <ColorSchemeToggle />
                    </Box>
                    <Box
                        component="main"
                        sx={{
                            my: 'auto',
                            py: 2,
                            pb: 5,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            width: 400,
                            maxWidth: '100%',
                            mx: 'auto',
                            borderRadius: 'sm',
                            '& form': {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                            },
                            [`& .${formLabelClasses.asterisk}`]: {
                                visibility: 'hidden',
                            },
                        }}
                    >
                        {/* gap reduce to either 2 or 4?*/}
                        <Stack gap={4} sx={{ mt: 2, textAlign: 'center' }}>
                            <Stack gap={1}>
                                <Typography level="h3">Sign up</Typography>
                            </Stack>
                            <form onSubmit={handleSubmit}>
                                <FormControl required>
                                    <FormLabel>Full Name</FormLabel>
                                    <Input type="text" name="fullName" />
                                </FormControl>
                                <FormControl required>
                                    <FormLabel>Email</FormLabel>
                                    <Input type="email" name="email" />
                                </FormControl>
                                <FormControl required>
                                    <FormLabel>Password</FormLabel>
                                    {/*<Input type={showPassword ? "text" : "password"}*/}
                                    {/*       name="password"*/}
                                    {/*/>*/}
                                    <Input type="password" name="password" />
                                </FormControl>
                                <FormControl required>
                                    <FormLabel>Confirm Password</FormLabel>
                                    {/*<Input type={showPassword ? "text" : "password"} name="confirmPassword" />*/}
                                    <Input type="password" name="confirmPassword" />
                                </FormControl>
                                {passwordError && <Alert color="danger" variant="soft">{passwordError}</Alert>}
                                {confirmPasswordError && <Alert color="danger" variant="soft">{confirmPasswordError}</Alert>}
                                <Stack gap={2} sx={{ mt: 2 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        {/*<Checkbox size="sm" name="passwordCheckbox" label="Show password"/>*/}
                                    </Box>
                                    <Button type="submit" fullWidth>
                                        Sign up
                                    </Button>
                                    <Link to={"/"}>
                                        Already have an account? Sign in
                                    </Link>
                                </Stack>
                            </form>
                        </Stack>
                    </Box>
                    <Box component="footer" sx={{ py: 3 }}>
                        <Typography level="body-xs" textAlign="center">
                            © Your company {new Date().getFullYear()}
                        </Typography>
                    </Box>
                </Box>
            </Box>
            <Box
                sx={(theme) => ({
                    height: '100%',
                    position: 'fixed',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    left: 'clamp(0px, (100vw - var(--Collapsed-breakpoint)) * 999, 100vw - var(--Cover-width))',
                    transition:
                        'background-image var(--Transition-duration), left var(--Transition-duration) !important',
                    transitionDelay: 'calc(var(--Transition-duration) + 0.1s)',
                    backgroundColor: 'background.level1',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundImage:
                        'url(https://images.unsplash.com/photo-1527181152855-fc03fc7949c8?auto=format&w=1000&dpr=2)',
                    [theme.getColorSchemeSelector('dark')]: {
                        backgroundImage:
                            'url(https://images.unsplash.com/photo-1572072393749-3ca9c8ea0831?auto=format&w=1000&dpr=2)',
                    },
                })}
            />
        </CssVarsProvider>
    );
}
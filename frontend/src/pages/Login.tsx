import React, { useState } from 'react';
import Axios from 'axios';
import { CssVarsProvider, useColorScheme } from '@mui/joy/styles';
import GlobalStyles from '@mui/joy/GlobalStyles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Checkbox from '@mui/joy/Checkbox';
import FormControl from '@mui/joy/FormControl';
import FormLabel, { formLabelClasses } from '@mui/joy/FormLabel';
import IconButton, { IconButtonProps } from '@mui/joy/IconButton';
import Input from '@mui/joy/Input';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '@mui/joy/Alert';
import Swal from 'sweetalert2';
import CircularProgress from '@mui/joy/CircularProgress';
import { useAuth } from '../components/AuthContext';


interface FormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
  password: HTMLInputElement;
  persistent: HTMLInputElement;
}
interface SignInFormElement extends HTMLFormElement {
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

function Login() {
  const navigate = useNavigate();

  // State to store user input
  const [email, setEmail] = useState('');
  //const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  //const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  


  // To reset previous error messages
  // const clearErrors = () => {
  //   setEmailError('');
  //   setPasswordError('');
  // };
  
  const handleLogin = async (event: React.FormEvent<SignInFormElement>) => {
    event.preventDefault();
    const formElements = event.currentTarget.elements;
    const data = {
      email: formElements.email.value,
      password: formElements.password.value,
      persistent: formElements.persistent.checked,
    };
    //alert(JSON.stringify(data, null, 2));
  
    // Clear any previous errors
    //clearErrors();
    setError('');

    try {
      setLoading(true);
      const requestData = {email, password}; // Combine email and password in one object
      const requestHeaders = {'Content-Type': 'application/json'};

      const response = await Axios.post('/api/login', requestData, {headers: requestHeaders});
      // Handle the response - redirect to the dashboard
      // console.log('Login successful: ', response.data);
      // // Code to redirect to the dashboard goes here
      // navigate('/dashboard');
      if (response.status === 200) {
        // Login successful
        console.log('Login successful: ', response.data);
        login();

        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true
        });
        Toast.fire({
          icon: 'success',
          title: 'signed in successfully!'
        })

        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);

      //   Swal.fire({
      //     position: 'top-end',
      //     title: 'Success',
      //     text: 'successfully logged in!',
      //     icon: 'success',
      //   }).then(function (result) {
      //     if (result.value) {
      //       // code to redirect to dashboard goes here
      //         navigate('/dashboard');
      //     }
      // })
       
      } else {
        // Handle other types of errors
        console.error('Unknown error:', response);
      }
    } catch (error: any) { // Specify 'error' as 'any' type
      if (error.response) {
        // The error object has a response, meaning it's an error response from the server.
        const { status, data } = error.response;

        if (status === 400) {
          // Bad request (e.g., email and password do not match)
          // Assuming the API returns a message in the response
          if (data.message === 'Invalid username or password') {
            // setEmailError('invalid_email_password_error');
            // setPasswordError('invalid_email_password_error');
            setError('Invalid username or password');
          } else {
            // Handle other bad request errors if needed
            // Display an appropriate error message for each case
            console.error('Bad request error:', data);
          }
        } else {
          // Handle other HTTP status codes if needed
          console.error('HTTP error:', error.response);
        }
      } else {
        // Handle network or request error
        console.error('Network or request error:', error);
       }
    } finally {
      setLoading(false);
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
              <Typography level="title-lg">ISP Comparison</Typography>
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
            <Typography level="h2">Hello there 👋</Typography>

            <Stack gap={4} sx={{ mt: 2 }}>
              <form onSubmit={handleLogin}>
                <FormControl required>
                  <FormLabel>Email</FormLabel>
                  <Input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </FormControl>
                <FormControl required>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                </FormControl>
                {error && <Alert color="danger" variant="soft">{error}</Alert>}
                
                

                <Stack gap={4} sx={{ mt: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Checkbox size="sm" label="Remember me" name="persistent" />
                    <Link to="/forgetPassword">
                      Forgot your password?
                    </Link>
                  </Box>
                  <Button disabled={loading} type="submit" fullWidth>
                  {loading ? <CircularProgress /> : 'Sign in'}
                  </Button>
                  <Link to="/Signup">
                      Don't have an account? Sign up!
                    </Link>
                </Stack>
              </form>
            </Stack>
          </Box>
          <Box component="footer" sx={{ py: 3 }}>
            <Typography level="body-xs" textAlign="center">
              © ISP Comparison {new Date().getFullYear()}
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

export default Login;
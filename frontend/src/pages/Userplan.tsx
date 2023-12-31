import React, { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { CssVarsProvider, useColorScheme } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import IconButton from '@mui/joy/IconButton';
import Button from '@mui/joy/Button';
import List from '@mui/joy/List';
import ListSubheader from '@mui/joy/ListSubheader';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import ListItemContent from '@mui/joy/ListItemContent';
import {DialogContent, DialogTitle, DialogActions, Modal, ModalDialog, Select, selectClasses} from "@mui/joy";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Divider from '@mui/joy/Divider';
import Option from '@mui/joy/Option';
import Grid from "@mui/joy/Grid";

// Icons import
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import MenuIcon from '@mui/icons-material/Menu';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import {Add, Delete, Edit, KeyboardArrowDown} from "@mui/icons-material";
import CalculateIcon from '@mui/icons-material/Calculate';
import LogoutIcon from '@mui/icons-material/Logout';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';



// custom
import Layout from '../components/Layout';
import { useAuth } from '../components/AuthContext';

function ColorSchemeToggle() {
    const { mode, setMode } = useColorScheme();
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) {
        return <IconButton size="sm" variant="soft" color="neutral" />;
    }
    return (
        <IconButton
            id="toggle-mode"
            size="sm"
            variant="soft"
            color="neutral"
            onClick={() => {
                if (mode === 'light') {
                    setMode('dark');
                } else {
                    setMode('light');
                }
            }}
        >
            {mode === 'light' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
        </IconButton>
    );
}

function TeamNav() {
    return (
        <List size="sm" sx={{ '--ListItem-radius': '8px', '--List-gap': '4px' }}>
            <ListItem nested>
                <ListSubheader>
                    Browse
                    <IconButton
                        size="sm"
                        variant="plain"
                        color="primary"
                        sx={{ '--IconButton-size': '24px', ml: 'auto' }}
                    >
                        <KeyboardArrowDownRoundedIcon fontSize="small" color="primary" />
                    </IconButton>
                </ListSubheader>
                <List
                    aria-labelledby="nav-list-browse"
                    sx={{
                        '& .JoyListItemButton-root': { p: '8px' },
                    }}
                >
                </List>
            </ListItem>
        </List>
    );
}


interface UserPlans {
    grand_total_premiums: number | null,
    total_payable_by_cash: number | null,
    total_payable_by_medisave: number | null,
    user_plans: UserPlan[]
}

interface UserPlan {
    age_next_birthday: number,
    id: number,
    insured_dob: string,
    insured_name: string,
    medishield_life_premium: number,
    payable_by_cash: number,
    payable_by_medisave: number,
    plan_id: number,
    plan_name: string,
    plan_premium: number,
    rider_id: number,
    rider_name: string,
    rider_premium: number,
    total_premium: number,
    company_id: number
}


export default function TeamExample() {
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [openAddPlan, setOpenAddPlan] = useState<boolean>(false);
    const [openDeletePlan, setOpenDeletePlan] = useState<boolean>(false);
    const [openEditPlan, setOpenEditPlan] = useState<boolean>(false);
    const [planToDelete, setPlanToDelete] = useState<number>();
    const [userPlans, setUserPlans] = useState<UserPlans>({
        grand_total_premiums: null,
        total_payable_by_cash: null,
        total_payable_by_medisave: null,
        user_plans: []
    });

    const[id, setID] = useState<number>();
    const[name,setName] = useState('');
    const[dob,setDOB] = useState('');

    const [selectedCompany, setSelectedCompany] = useState<any>(null);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [selectedRider, setSelectedRider] = useState<any>('');
    const [filterData, setFilterData] = useState<any>({});


    const addPlan = async () => {
        const response = await fetch('/api/user_plans',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                "plan_id": selectedPlan,
                "rider_id": selectedRider,
                "insured_name": name,
                "insured_dob": dob
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log(responseData);

        fetchUserPlans();
    }

    const editPlan = async () => {
        const response = await fetch('/api/user_plans',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                "plan_id": selectedPlan,
                "rider_id": selectedRider,
                "insured_name": name,
                "insured_dob": dob,
                "id": id
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log(responseData);

        fetchUserPlans();
    }

    const deletePlan = async (userPlanID: number) => {
        const response = await fetch(`/api/user_plans/${userPlanID}`, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log(responseData);

        fetchUserPlans();
    }

    const clearField = () => {
        setName('');
        setDOB('');
        setSelectedCompany(null);
        setSelectedPlan(null);
        setSelectedRider(null);
    };

    const getFilter = async () => {
        const response = await fetch('/api/get_filter', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                "company_ids": selectedCompany ? [selectedCompany]: [],
                "plan_ids": selectedPlan ? [selectedPlan]: []
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log(responseData);
        setFilterData(responseData.data)
    }

    const fetchUserPlans = () => {
        fetch('/api/user_plans') // Replace with the actual API endpoint
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                console.log(data.status);
                console.log(data.data);

                setUserPlans(data.data);

                console.log('i fire once');
            })
            .catch((error) => {
                console.error('Error fetching user plans:', error);
            });
    }

    useEffect(() => {

        fetchUserPlans();

        (async() => {
            await getFilter();
        })();

    }, [selectedCompany, selectedPlan]);

    const navigate = useNavigate();

    const navigateToCopaymentCalculator = () => {
        // navigate to the calculator route
        navigate('/copaymentCalculator');
    };

    const navigateToMyPlans = () => {
        // navigate to the calculator route
        navigate('/userplan');
    };

    const navigateToDashboard = () => {
        // navigate to the calculator route
        navigate('/dashboard');
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/logout', {
                method: 'GET',

            });
            if (response.ok) {
                console.log('Logout successful');
                navigate('/');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout')
        }
    };

    const { isLoggedIn } = useAuth();

    if (isLoggedIn === null) {
        return <Navigate to="/userplan"/>;
    }

    if (!isLoggedIn) {
        return <Navigate to="/"/>;
        // console.log("I am supposed to be here");
    }


    return (
        <CssVarsProvider disableTransitionOnChange>
            <CssBaseline />

            <Layout.Root
                sx={{
                    ...(drawerOpen && {
                        height: '100vh',
                        overflow: 'hidden',
                    }),
                }}
            >
                <Layout.Header>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 1.5,
                        }}
                    >
                        <IconButton
                            variant="outlined"
                            size="sm"
                            onClick={() => setDrawerOpen(true)}
                            sx={{ display: { sm: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <IconButton
                            size="sm"
                            variant="soft"
                            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                        >
                            <GroupRoundedIcon />
                        </IconButton>
                        <Typography component="h1" fontWeight="xl">
                            Team
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                    <Button startDecorator={<GridViewRoundedIcon/>} variant="plain" sx={{ color: '#455a64'}} onClick={navigateToDashboard}>Dashboard</Button>
                    <Button startDecorator={<ArticleRoundedIcon/>} variant="plain" sx={{ color: '#455a64'}} onClick={navigateToMyPlans}>My Plans</Button>
                    <Button startDecorator={<CalculateIcon/>} variant="plain" sx={{ color: '#455a64'}} onClick={navigateToCopaymentCalculator}>Copayment Calculator</Button>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5 }}>
                        <IconButton
                            size="sm"
                            variant="outlined"
                            color="neutral"
                            sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
                        >
                            <SearchRoundedIcon />
                        </IconButton>

                        <IconButton
                            size="sm"
                            variant="soft"
                            color="neutral"
                            component="a"
                            onClick={handleLogout}

                        >
                            <LogoutIcon />
                        </IconButton>

                        <ColorSchemeToggle />
                    </Box>
                </Layout.Header>

                <Layout.Main>

                    <Button
                        variant="outlined"
                        color="neutral"
                        startDecorator={<Add />}
                        onClick={() => setOpenAddPlan(true)}
                    >
                        Add Plan
                    </Button>

                    <Modal open={openAddPlan} onClose={() => {
                        setOpenAddPlan(false);
                        clearField();
                    }}>
                        <ModalDialog>
                            <DialogTitle>Add new plan</DialogTitle>
                            <DialogContent>Fill in the information of the plan.</DialogContent>
                            <form
                                onSubmit={async (event: React.FormEvent<HTMLFormElement>) => {
                                    event.preventDefault();
                                    await addPlan();
                                    setOpenAddPlan(false)
                                    clearField();

                                }}
                            >
                                <Box>
                                    <Grid
                                        container
                                        rowSpacing={1}
                                        columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                                        sx={{ width: '100%' }}
                                    >
                                        <Grid xs={6}>
                                            <FormControl sx={{width: 240}}>
                                                <FormLabel>Insured Name</FormLabel>
                                                <Input
                                                    type="text"
                                                    name="Name"
                                                    value={name}
                                                    onChange={(e) => {setName(e.target.value); console.log(e.target.value)}}
                                                    required
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid xs={6}>
                                            <FormControl sx={{width: 240}}>
                                                <FormLabel>Insured Date of birth</FormLabel>
                                                <Input
                                                    type="date"
                                                    name="Insured Date of birth"
                                                    value={dob}
                                                    onChange={(e) => {setDOB(e.target.value); console.log(e.target.value)}}
                                                    required
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid xs={6}>
                                            <FormControl>
                                                <FormLabel>Company</FormLabel>
                                                <Select
                                                    placeholder="Select a company"
                                                    value={selectedCompany}
                                                    onChange={(e:any, value:any) => {setSelectedCompany(value); console.log(value)}}
                                                    indicator={<KeyboardArrowDown />}
                                                    required
                                                    sx={{
                                                        width: 240,
                                                        [`& .${selectClasses.indicator}`]: {
                                                            transition: '0.2s',
                                                            [`&.${selectClasses.expanded}`]: {
                                                                transform: 'rotate(-180deg)',
                                                            },
                                                        },
                                                    }}
                                                    >
                                                    {(filterData.companies || []).map((company: any) => (
                                                        <Option key={company.id} value={company.id}>
                                                            {company.name}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid xs={6}>
                                            <FormControl>
                                                <FormLabel>Plan</FormLabel>
                                                <Select
                                                    placeholder="Select a Plan"
                                                    value={selectedPlan}
                                                    onChange={(e:any, value:any) => {setSelectedPlan(value); console.log(value)}}
                                                    indicator={<KeyboardArrowDown />}
                                                    required
                                                    sx={{
                                                        width: 240,
                                                        [`& .${selectClasses.indicator}`]: {
                                                            transition: '0.2s',
                                                            [`&.${selectClasses.expanded}`]: {
                                                                transform: 'rotate(-180deg)',
                                                            },
                                                        },
                                                    }}
                                                >
                                                    {(filterData.plans || []).map((plan: any) => (
                                                        <Option key={plan.id} value={plan.id}>
                                                            {plan.name}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid xs={6}>
                                            <FormControl>
                                                <FormLabel>Rider</FormLabel>
                                                <Select
                                                    placeholder="Select a Rider"
                                                    value={selectedRider}
                                                    onChange={(e:any, value:any) => {setSelectedRider(value); console.log(value)}}
                                                    indicator={<KeyboardArrowDown />}
                                                    required
                                                    sx={{
                                                        width: 240,
                                                        [`& .${selectClasses.indicator}`]: {
                                                            transition: '0.2s',
                                                            [`&.${selectClasses.expanded}`]: {
                                                                transform: 'rotate(-180deg)',
                                                            },
                                                        },
                                                    }}
                                                >
                                                    {(filterData.riders || []).map((rider: any) => (
                                                        <Option key={rider.id} value={rider.id}>
                                                            {rider.name}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid xs={12} sx={{display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                                            <Button variant="solid" color="danger" onClick={() => {
                                                setOpenAddPlan(false);
                                                clearField();
                                                }}>
                                                Cancel
                                            </Button>

                                            <Button type="submit" variant="plain" color="neutral">
                                                Confirm
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </form>
                        </ModalDialog>
                    </Modal>


                    <Modal open={openEditPlan} onClose={() => {
                        setOpenEditPlan(false);
                        clearField();
                    }}>
                        <ModalDialog>
                            <DialogTitle>Edit plan</DialogTitle>
                            <DialogContent>Edit the information of the plan.</DialogContent>
                            <form
                                onSubmit={async (event: React.FormEvent<HTMLFormElement>) => {
                                    event.preventDefault();
                                    await editPlan();
                                    setOpenEditPlan(false)
                                    clearField();

                                }}
                            >
                                <Box>
                                    <Grid
                                        container
                                        rowSpacing={1}
                                        columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                                        sx={{ width: '100%' }}
                                    >
                                        <Grid xs={6}>
                                            <FormControl sx={{width: 240}}>
                                                <FormLabel>Insured Name</FormLabel>
                                                <Input
                                                    type="text"
                                                    name="Name"
                                                    value={name}
                                                    onChange={(e) => {setName(e.target.value); console.log(e.target.value)}}
                                                    required
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid xs={6}>
                                            <FormControl sx={{width: 240}}>
                                                <FormLabel>Insured Date of birth</FormLabel>
                                                <Input
                                                    type="date"
                                                    name="Insured Date of birth"
                                                    value={dob}
                                                    onChange={(e) => {setDOB(e.target.value); console.log(e.target.value)}}
                                                    required
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid xs={6}>
                                            <FormControl>
                                                <FormLabel>Company</FormLabel>
                                                <Select
                                                    placeholder="Select a company"
                                                    value={selectedCompany}
                                                    onChange={(e:any, value:any) => {setSelectedCompany(value); console.log(value)}}
                                                    indicator={<KeyboardArrowDown />}
                                                    required
                                                    sx={{
                                                        width: 240,
                                                        [`& .${selectClasses.indicator}`]: {
                                                            transition: '0.2s',
                                                            [`&.${selectClasses.expanded}`]: {
                                                                transform: 'rotate(-180deg)',
                                                            },
                                                        },
                                                    }}
                                                >
                                                    {(filterData.companies || []).map((company: any) => (
                                                        <Option key={company.id} value={company.id}>
                                                            {company.name}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid xs={6}>
                                            <FormControl>
                                                <FormLabel>Plan</FormLabel>
                                                <Select
                                                    placeholder="Select a Plan"
                                                    value={selectedPlan}
                                                    onChange={(e:any, value:any) => {setSelectedPlan(value); console.log(value)}}
                                                    indicator={<KeyboardArrowDown />}
                                                    required
                                                    sx={{
                                                        width: 240,
                                                        [`& .${selectClasses.indicator}`]: {
                                                            transition: '0.2s',
                                                            [`&.${selectClasses.expanded}`]: {
                                                                transform: 'rotate(-180deg)',
                                                            },
                                                        },
                                                    }}
                                                >
                                                    {(filterData.plans || []).map((plan: any) => (
                                                        <Option key={plan.id} value={plan.id}>
                                                            {plan.name}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid xs={6}>
                                            <FormControl>
                                                <FormLabel>Rider</FormLabel>
                                                <Select
                                                    placeholder="Select a Rider"
                                                    value={selectedRider}
                                                    onChange={(e:any, value:any) => {setSelectedRider(value); console.log(value)}}
                                                    indicator={<KeyboardArrowDown />}
                                                    required
                                                    sx={{
                                                        width: 240,
                                                        [`& .${selectClasses.indicator}`]: {
                                                            transition: '0.2s',
                                                            [`&.${selectClasses.expanded}`]: {
                                                                transform: 'rotate(-180deg)',
                                                            },
                                                        },
                                                    }}
                                                >
                                                    {(filterData.riders || []).map((rider: any) => (
                                                        <Option key={rider.id} value={rider.id}>
                                                            {rider.name}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid xs={12} sx={{display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                                            <Button variant="solid" color="danger" onClick={() => {
                                                setOpenEditPlan(false);
                                                clearField();
                                            }}>
                                                Cancel
                                            </Button>

                                            <Button type="submit" variant="plain" color="neutral">
                                                Confirm
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </form>
                        </ModalDialog>
                    </Modal>

                    <Modal open={openDeletePlan} onClose={() => {
                        setOpenDeletePlan(false);
                    }}>
                        <ModalDialog variant="outlined" role="alertdialog">
                            <DialogTitle>
                                <WarningRoundedIcon />
                                Confirmation
                            </DialogTitle>
                            <Divider />
                            <DialogContent>
                                Are you sure you want to delete this plan?
                            </DialogContent>
                            <DialogActions>
                                <Button variant="solid" color="danger" onClick={() => {
                                    setOpenDeletePlan(false);
                                    deletePlan(planToDelete!);
                                    console.log("plan to delete NOW", planToDelete);
                                }}>
                                    Delete plan
                                </Button>
                                <Button variant="plain" color="neutral" onClick={() => setOpenDeletePlan(false)}>
                                    Cancel
                                </Button>
                            </DialogActions>
                        </ModalDialog>
                    </Modal>

                    <Box sx={{ flexGrow: 1 , width: '98.2vw', margin: '10px'}}>
                        <Grid
                            container
                            spacing={2}
                            direction={'row'}
                            sx={{
                                '--Grid-borderWidth': '1px',
                                borderTop: 'var(--Grid-borderWidth) solid',
                                borderLeft: 'var(--Grid-borderWidth) solid',
                                borderColor: 'divider',
                                '& > div': {
                                    borderRight: 'var(--Grid-borderWidth) solid',
                                    borderBottom: 'var(--Grid-borderWidth) solid',
                                    borderColor: 'divider',
                                    margin: '8px',
                                },
                            }}
                        >
                            {userPlans.user_plans.map((userPlan, index) => (
                                <Grid xs={8} sm={6} md={3.5} key={index} sx={{ border: '1px solid #ddd', borderRadius: '4px', padding: '8px' }}>
                                    <List>
                                        <React.Fragment>
                                            <ListItem
                                                endAction={
                                                <div>
                                                    <IconButton aria-label="Edit" size="sm" color="primary" onClick={() => {
                                                        setOpenEditPlan(true);
                                                        setID(userPlan.id);
                                                        setName(userPlan.insured_name);
                                                        setDOB(userPlan.insured_dob);
                                                        setSelectedCompany(userPlan.company_id);
                                                        setSelectedPlan(userPlan.plan_id);
                                                        setSelectedRider(userPlan.rider_id);
                                                        console.log("plan clicked", userPlan.id)
                                                    }}>
                                                        <Edit />
                                                    </IconButton>
                                                    <IconButton aria-label="Delete" size="sm" color="danger" onClick={() => {
                                                        setOpenDeletePlan(true);
                                                        setPlanToDelete(userPlan.id);
                                                        console.log("plan id", userPlans.user_plans)
                                                        console.log("plan clicked", userPlan.id)
                                                        console.log("plan to delete",planToDelete);
                                                    }}>
                                                        <Delete />
                                                    </IconButton>
                                                </div>
                                            }>
                                                <Typography>
                                                    Name: {userPlan.insured_name}
                                                </Typography>
                                            </ListItem>
                                            <ListItem sx={{ borderBottom: '1px solid #ddd' }}>
                                                <Typography>
                                                    Age: {userPlan.age_next_birthday}
                                                </Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Typography>
                                                    Medishield Life Premium: ${userPlan.medishield_life_premium}
                                                </Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Typography>
                                                    {userPlan.plan_name}: ${userPlan.plan_premium}
                                                </Typography>
                                            </ListItem>
                                            <ListItem sx={{ borderBottom: '1px solid #ddd' }}>
                                                <Typography>
                                                    {userPlan.rider_name}: ${userPlan.rider_premium}
                                                </Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Typography>
                                                    Payable by Cash: ${userPlan.payable_by_cash}
                                                </Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Typography>
                                                    Payable by Medisave: ${userPlan.payable_by_medisave}
                                                </Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Typography>
                                                    Total Premium: ${userPlan.total_premium}
                                                </Typography>
                                            </ListItem>
                                        </React.Fragment>

                                    </List>
                                </Grid>
                            ))}

                        </Grid>
                    </Box>

                    <Box sx={{width: '75.2vw', margin: '10px'}}>
                        <List orientation="horizontal">
                            <ListItem>
                                <Typography>
                                    Grand total premiums: ${userPlans.grand_total_premiums}
                                </Typography>
                            </ListItem>
                            <ListItem>
                                <Typography>
                                    Total payable by cash: ${userPlans.total_payable_by_cash}
                                </Typography>
                            </ListItem>
                            <ListItem>
                                <Typography>
                                    Total payable by medisave: ${userPlans.total_payable_by_medisave}
                                </Typography>
                            </ListItem>
                        </List>
                    </Box>
                </Layout.Main>
            </Layout.Root>
        </CssVarsProvider>
    );
}

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import {DialogContent, DialogTitle, DialogActions, Modal, ModalDialog, Tooltip, Select, selectClasses} from "@mui/joy";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Option from '@mui/joy/Option';

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
import {Add, Delete, KeyboardArrowDown} from "@mui/icons-material";
import CalculateIcon from '@mui/icons-material/Calculate';
import LogoutIcon from '@mui/icons-material/Logout';



// custom
import Menu from '../components/Menu';
import Layout from '../components/Layout';
import Grid from "@mui/joy/Grid";

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
                    <ListItem>
                        <ListItemButton selected>
                            <ListItemDecorator>
                                <PeopleRoundedIcon fontSize="small" />
                            </ListItemDecorator>
                            <ListItemContent>Ward</ListItemContent>
                        </ListItemButton>
                    </ListItem>
                    <ListItem>
                        <ListItemButton>
                            <ListItemDecorator sx={{ color: 'neutral.500' }}>
                                <AssignmentIndRoundedIcon fontSize="small" />
                            </ListItemDecorator>
                            <ListItemContent>My Plans</ListItemContent>
                        </ListItemButton>
                    </ListItem>
                    <ListItem>
                        <ListItemButton>
                            <ListItemDecorator sx={{ color: 'neutral.500' }}>
                                <ArticleRoundedIcon fontSize="small" />
                            </ListItemDecorator>
                            <ListItemContent>Rider</ListItemContent>
                        </ListItemButton>
                    </ListItem>
                    <ListItem>
                        <ListItemButton>
                            <ListItemDecorator sx={{ color: 'neutral.500' }}>
                                <ArticleRoundedIcon fontSize="small" />
                            </ListItemDecorator>
                            <ListItemContent>Add plan</ListItemContent>
                        </ListItemButton>
                    </ListItem>
                    <ListItem>
                        <ListItemButton>
                            <ListItemDecorator sx={{ color: 'neutral.500' }}>
                                <ArticleRoundedIcon fontSize="small" />
                            </ListItemDecorator>
                            <ListItemContent>Delete Plan</ListItemContent>
                        </ListItemButton>
                    </ListItem>
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
    total_premium: number
}


export default function TeamExample() {
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [openAddPlan, setopenAddPlan] = useState<boolean>(false);
    const [openDeletePlan, setDeletePlan] = useState<boolean>(false);
    const [planToDeleteIndex, setPlanToDeleteIndex] = useState(null);
    const [planToDelete, setPlanToDelete] = useState({
        plan_id: null,
        user_id: null
    })
    const [userPlans, setUserPlans] = useState<UserPlans>({
        grand_total_premiums: null,
        total_payable_by_cash: null,
        total_payable_by_medisave: null,
        user_plans: []
    });

    const[name,setName] = useState('');
    const[dob,setDOB] = useState('');

    const [selectedCompany, setSelectedCompany] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedRider, setSelectedRider] = useState('');
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
    }



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

    useEffect(() => {

        fetch('/api/user_plans') // Replace with the actual API endpoint
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                console.log(data.status);
                console.log(data.data);
                if (typeof data === 'object' && data !== null) {
                    Object.keys(data.data).forEach((key) => {
                        // Check the data type of each property
                        console.log(`${key}: ${typeof data[key]}`);
                        console.log('hello heee');
                    });
                } else {
                    console.error('Data is not an object.');
                }

                setUserPlans(data.data);

                console.log('i fire once');
            })
            .catch((error) => {
                console.error('Error fetching user plans:', error);
            });




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


    return (
        <CssVarsProvider disableTransitionOnChange>
            <CssBaseline />
            {drawerOpen && (
                <Layout.SideDrawer onClose={() => setDrawerOpen(false)}>
                    <TeamNav />
                </Layout.SideDrawer>
            )}
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
                            
                        >
                            <LogoutIcon />
                        </IconButton>

                        <ColorSchemeToggle />
                    </Box>
                </Layout.Header>
                <Layout.SideNav>
                    <TeamNav />
                </Layout.SideNav>

                {/*Layout.SidePane*/}
                {/* Code here */}

                <Layout.Main>

                    <Button
                        variant="outlined"
                        color="neutral"
                        startDecorator={<Add />}
                        onClick={() => setopenAddPlan(true)}
                    >
                        Add Plan
                    </Button>
                    <Modal open={openAddPlan} onClose={() => {
                        setopenAddPlan(false);
                        setSelectedCompany(null); // Clear selectedCompany
                        setSelectedPlan(null); // Clear selectedPlan
                        setSelectedRider(''); // Clear selectedRider
                    }}>
                        <ModalDialog>
                            <DialogTitle>Add new plan</DialogTitle>
                            <DialogContent>Fill in the information of the plan.</DialogContent>
                            <form
                                onSubmit={async (event: React.FormEvent<HTMLFormElement>) => {
                                    event.preventDefault();
                                    await addPlan();
                                    setopenAddPlan(false);

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
                                                <FormLabel>Insured name</FormLabel>
                                                <Input
                                                    type="text"
                                                    name="Name"
                                                    value={name}
                                                    onChange={(e) => {setName(e.target.value); console.log(e.target.value)}}
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
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid xs={6}>
                                            <FormControl>
                                                <FormLabel>company id</FormLabel>
                                                <Select
                                                    placeholder="Select a company"
                                                    value={selectedCompany}
                                                    onChange={(e:any, value:any) => {setSelectedCompany(value); console.log(value)}}
                                                    indicator={<KeyboardArrowDown />}
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
                                                <FormLabel>plan id</FormLabel>
                                                <Select
                                                    placeholder="Select a Plan"
                                                    value={selectedPlan}
                                                    onChange={(e:any, value:any) => {setSelectedPlan(value); console.log(value)}}
                                                    indicator={<KeyboardArrowDown />}
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
                                                <FormLabel>rider id</FormLabel>
                                                <Select
                                                    placeholder="Select a Rider"
                                                    value={selectedRider}
                                                    onChange={(e:any, value:any) => {setSelectedRider(value); console.log(value)}}
                                                    indicator={<KeyboardArrowDown />}
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
                                                setopenAddPlan(false);
                                                setSelectedCompany(null); // Clear selectedCompany
                                                setSelectedPlan(null); // Clear selectedPlan
                                                setSelectedRider(''); // Clear selectedRider
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


                    <Box sx={{ flexGrow: 1 , width: '75.2vw', margin: '10px'}}>
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
                                                <IconButton aria-label="Delete" size="sm" color="danger">
                                                    <Delete />
                                                </IconButton>
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
                                                    Plan Name: {userPlan.plan_name}
                                                </Typography>
                                            </ListItem>
                                            <ListItem sx={{ borderBottom: '1px solid #ddd' }}>
                                                <Typography>
                                                    Rider Name: {userPlan.rider_name}
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

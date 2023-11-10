import React, { useEffect, useState } from 'react';
import { CssVarsProvider, useColorScheme } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Chip from '@mui/joy/Chip';
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
import Sheet from '@mui/joy/Sheet';
import Table from '@mui/joy/Table';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

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
import BookRoundedIcon from '@mui/icons-material/BookRounded';

// custom
import Menu from '../components/Menu';
import Layout from '../components/Layout';

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
                </List>
            </ListItem>
        </List>
    );
}

// Table
function createData(
    companyName: string,
    ward: string,
    plans: string,
    riders: string,
) {
    return { companyName, ward, plans, riders };
}

const rows = [
    createData('AIA', 'A', 'testing1', 'testing2'),
    createData('Prudential', 'B1', 'testing3', 't4'),
    createData('NTUC', 'C', 't5', 't6'),
    createData('Great Eastern', 'Premium', 't7', 't8'),
];

function rowData(props: { row: ReturnType<typeof createData>; initialOpen?: boolean }){
    const { row } = props;
    const [open, setOpen] = React.useState(props.initialOpen || false);

    return(
        <React.Fragment>
            <tr>
                <td>
                    <IconButton
                        aria-label="expand row"
                        variant="plain"
                        color="neutral"
                        size="sm"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </td>
            </tr>
        </React.Fragment>
    );

}

interface UserPlans {
    grand_total_premiums: number | null,
    total_payable_by_cash: number | null,
    total_payable_by_medisave: number | null,
    user_plans: {
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
        rider_name: null,
        rider_premium: number,
        total_premium: number
    } []
}

export default function TeamExample() {
    const [drawerOpen, setDrawerOpen] = React.useState(false);

    const [userPlans, setUserPlans] = React.useState<UserPlans>({
            grand_total_premiums: null,
            total_payable_by_cash: null,
            total_payable_by_medisave: null,
            user_plans: []
    });

    useEffect(() => {
        // Make an API request to fetch user plans data
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
                    });
                } else {
                    console.error('Data is not an object.');
                }

                setUserPlans(data.data);

                //setUserPlans(data);
                console.log('i fire once');
            })
            .catch((error) => {
                console.error('Error fetching user plans:', error);
            });
    }, []);


    //const updatePlan = test;
    //const deletePlan = test;

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
                    <Input
                        size="sm"
                        variant="outlined"
                        placeholder="Search anything…"
                        startDecorator={<SearchRoundedIcon color="primary" />}
                        endDecorator={
                            <IconButton variant="outlined" color="neutral">
                                <Typography fontWeight="lg" fontSize="sm" textColor="text.icon">
                                    ⌘ + k
                                </Typography>
                            </IconButton>
                        }
                        sx={{
                            flexBasis: '500px',
                            display: {
                                xs: 'none',
                                sm: 'flex',
                            },
                            boxShadow: 'sm',
                        }}
                    />
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
                            href="/blog/first-look-at-joy/"
                        >
                            <BookRoundedIcon />
                        </IconButton>
                        <Menu
                            id="app-selector"
                            control={
                                <IconButton
                                    size="sm"
                                    variant="soft"
                                    color="neutral"
                                    aria-label="Apps"
                                >
                                    <GridViewRoundedIcon />
                                </IconButton>
                            }
                            menus={[
                                {
                                    label: 'Email',
                                    href: '/joy-ui/getting-started/templates/email/',
                                },
                                {
                                    label: 'Team',
                                    active: true,
                                    href: '/joy-ui/getting-started/templates/team/',
                                    'aria-current': 'page',
                                },
                                {
                                    label: 'Files',
                                    href: '/joy-ui/getting-started/templates/files/',
                                },
                            ]}
                        />
                        <ColorSchemeToggle />
                    </Box>
                </Layout.Header>
                <Layout.SideNav>
                    <TeamNav />
                </Layout.SideNav>

                {/*Layout.SidePane*/}
                {/* Code here */}

                <Layout.Main>
                    <Sheet variant="outlined" style={{ width: '75.2vw' }}>
                        <Table variant="soft" borderAxis="bothBetween" style={{ width: '75vw' }}>
                            <thead>
                            <tr>
                                <th style={{ width: '10%' }}>Insured name</th>
                                <th>Medishield life premium</th>
                                <th>Payable by cash</th>
                                <th>Payable by medisave</th>
                                <th>Plan name</th>
                                <th>Plan premium</th>
                                <th>Rider name</th>
                                <th>Rider premium</th>
                                <th>Total premium</th>
                            </tr>
                            </thead>

                            <tbody>
                                {userPlans.user_plans.map((userPlan, index) => (
                                    <tr key={index}>
                                        <td>{index}</td>
                                        <td>{userPlan.age_next_birthday}</td>
                                        <td>{userPlan.insured_name}</td>
                                        <td>{userPlan.medishield_life_premium}</td>
                                        <td>{userPlan.payable_by_cash}</td>
                                        <td>{userPlan.payable_by_medisave}</td>
                                        <td>{userPlan.plan_id}</td>
                                        <td>{userPlan.plan_name}</td>
                                        <td>{userPlan.plan_premium}</td>
                                        <td>{userPlan.rider_id}</td>
                                        <td>{userPlan.rider_name}</td>
                                        <td>{userPlan.rider_premium}</td>
                                        <td>{userPlan.total_premium}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th>Totals</th>
                                    <td>${userPlans.grand_total_premiums}</td>
                                    <td>${userPlans.total_payable_by_cash}</td>
                                    <td>${userPlans.total_payable_by_medisave}</td>
                                </tr>
                            </tfoot>
                        </Table>
                    </Sheet>
                </Layout.Main>
            </Layout.Root>
        </CssVarsProvider>
    );
}

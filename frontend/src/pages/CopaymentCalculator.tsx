import * as React from 'react';
import axios from 'axios';
import { CssVarsProvider, useColorScheme } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import IconButton from '@mui/joy/IconButton';
import List from '@mui/joy/List';
import ListSubheader from '@mui/joy/ListSubheader';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import ListItemContent from '@mui/joy/ListItemContent';
import Sheet from '@mui/joy/Sheet';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import CardActions from '@mui/joy/CardActions';

import Divider from '@mui/joy/Divider';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';

import InfoOutlined from '@mui/icons-material/InfoOutlined';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import Checkbox from '@mui/joy/Checkbox';



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
import AssistWalkerIcon from '@mui/icons-material/AssistWalker';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import CalculateIcon from '@mui/icons-material/Calculate';

// custom
import Menu from '../components/Menu';
import Layout from '../components/Layout';

interface FormElements extends HTMLFormControlsCollection {
    total_bill: HTMLInputElement;
    plan_id: HTMLInputElement;
    rider_id: HTMLInputElement;
    age: HTMLInputElement;
    ward_type: HTMLInputElement;
}

interface CalculateFormElement extends HTMLFormElement {
    readonly elements: FormElements;
}

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

// Navigation panel

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
                        <ListItemDecorator>
                            <PeopleRoundedIcon fontSize="small" />
                        </ListItemDecorator>
                        <ListItemContent>Ward</ListItemContent>
                    </ListItem>
                    <ListItem>
                        <ListItemButton>
                            <ListItemDecorator sx={{ color: 'neutral.500' }}>
                                <ArticleRoundedIcon fontSize="small" />
                            </ListItemDecorator>
                            <ListItemContent>Plan</ListItemContent>
                            <Chip
                                variant="soft"
                                color="neutral"
                                size="sm"
                                sx={{ borderRadius: 'sm' }}
                            >
                                Beta
                            </Chip>
                        </ListItemButton>
                    </ListItem>
                    <ListItem>
                        <ListItemButton>
                            <ListItemDecorator sx={{ color: 'neutral.500' }}>
                                <AssignmentIndRoundedIcon fontSize="small" />
                            </ListItemDecorator>
                            <ListItemContent>Rider</ListItemContent>
                        </ListItemButton>
                    </ListItem>
                </List>
            </ListItem>
        </List>
    );
}




export default function TeamExample() {
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [currency] = React.useState('dollar');
    const [total_bill, set_total_bill] = React.useState('');
    const [plan_id, set_plan_id] = React.useState('');
    const [rider_id, set_rider_id] = React.useState('');
    const [age, set_age] = React.useState('');
    const [ward_type, set_ward_type] = React.useState('');

    const handleCopaymentCalculate = async () => {

        const totalBill = parseInt(total_bill, 10);
        const planId = parseInt(plan_id, 10);
        const riderId = parseInt(rider_id, 10); // Parse as an integer
        const ageValue = parseInt(age, 10); // Parse as an integer
        const wardTypeValue = ward_type; // No parsing needed

        const postData = {
            total_bill: totalBill,
            plan_id: planId,
            rider_id: riderId,
            age: ageValue,
            ward_type: wardTypeValue
        }

        try {
            console.log(postData);
            const response = await axios.post('api/co_payment', postData, {headers:{'Content-Type':'application/json'}});
            console.log('Response', response.data);
        } catch (error) {
            console.log('Error', error);
        }
    }


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

                <Layout.Main>
                    <Sheet variant="plain" style={{ width: '75.2vw', padding: '25px', borderRadius: '25px' }}>


                        <form method="POST" onSubmit={(event: React.FormEvent<CalculateFormElement>) => {
                            event.preventDefault();
                            const formElements = event.currentTarget.elements;
                            const data = {
                                total_bill: formElements.total_bill.value,
                                plan_id: formElements.plan_id.value,
                                rider_id: formElements.rider_id.value,
                                age: formElements.age.value,
                                ward_type: formElements.age.value
                            };
                        }}
                        >
                            <Card
                                variant="plain"
                                sx={{
                                    maxHeight: 'max-content',
                                    maxWidth: '100%',
                                    overflow: 'auto',
                                }}
                            >
                                <Typography level="title-lg" startDecorator={<CalculateIcon />}>
                                    Calculate copayment
                                </Typography>
                                <Divider inset="none" />
                                <CardContent
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(2, minmax(80px, 1fr))',
                                        gap: 1.5,
                                    }}
                                >

                                    <FormControl sx={{ gridColumn: '1/-1' }}>
                                        <FormLabel>Total bill</FormLabel>
                                        <Input name="total_bill" type="number" value={total_bill} onChange={(e) => set_total_bill(e.target.value)} variant="soft" startDecorator={{ dollar: '$(SGD)' }[currency]} /> 
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Plan</FormLabel>
                                        <Input name="plan_id" type="number" value={plan_id} onChange={(e) => set_plan_id(e.target.value)} placeholder="AIA Max VitalHealth A" variant="soft" endDecorator={<AssistWalkerIcon />} />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Rider</FormLabel>
                                        <Input name="rider_id" type="number" value={rider_id} onChange={(e) => set_rider_id(e.target.value)} placeholder="HealthShield Gold Max A" variant="soft" endDecorator={<TwoWheelerIcon />} />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>What is your age?</FormLabel>
                                        <Input name="age" type="number" value={age} onChange={(e) => set_age(e.target.value)} placeholder="Type your age" variant="soft" />
                                        
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Ward Type</FormLabel>
                                        <Input name="ward_type" value={ward_type} onChange={(e) => set_ward_type(e.target.value)} placeholder="Private, A, B1 etc." variant="soft" />
                                    </FormControl>

                                 

                                    <CardActions sx={{ gridColumn: '1/-1' }}>
                                        <Button onClick={handleCopaymentCalculate} variant="solid" color="primary">
                                            Calculate
                                        </Button>
                                    </CardActions>


                                </CardContent>
                            </Card>

                        </form>




                    </Sheet>

                </Layout.Main>
            </Layout.Root>
        </CssVarsProvider>
    );
}

export { }
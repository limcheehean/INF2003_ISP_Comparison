import * as React from 'react';
import { ChangeEvent, useState, useEffect } from "react";
import { useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { CssVarsProvider, useColorScheme } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import IconButton from '@mui/joy/IconButton';
import Sheet from '@mui/joy/Sheet';
import Table from '@mui/joy/Table';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/joy/Button';

// Icons import
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import MenuIcon from '@mui/icons-material/Menu';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import BookRoundedIcon from '@mui/icons-material/BookRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import CalculateIcon from '@mui/icons-material/Calculate';
import LogoutIcon from '@mui/icons-material/Logout';

// custom
import Menu from '../components/Menu';
import Layout from '../components/Layout';
import { useAuth } from '../components/AuthContext';
//import "../App.css";

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

// CHECKBOXES
interface FormElements extends HTMLFormControlsCollection {
    company_ids:HTMLInputElement;
    ward_types: HTMLInputElement;
    plan_ids: HTMLInputElement;
}

// TABS
// function TabPanel(props: any) {
//     const { children, value, index, ...other } = props;

//     return (
//         <div
//             role="tabpanel"
//             hidden={value !== index}
//             id={`simple-tabpanel-${index}`}
//             aria-labelledby={`simple-tab-${index}`}
//             {...other}
//         >
//             {value === index && (
//                 <Box sx={{ p: 3 }}>
//                     {children}
//                 </Box>
//             )}
//         </div>
//     );
// }

// LJ table
interface Rider {
rider_id: number;
rider_name: string;
}

interface RiderBenefit {
rider_benefit_id: number;
rider_benefit_name: string;
}

interface RiderBenefitDetail {
rider_id: number;
rider_benefit_id: number;
detail: string;
}

interface JsonData {
riders: Rider[];
rider_benefits: RiderBenefit[];
rider_benefit_details: RiderBenefitDetail[];
}

interface TableComponentProps {
data: JsonData;
}
  
function RiderBenefitTable({ data }: TableComponentProps) {
    return (
        <Table variant="soft" borderAxis="bothBetween" sx={{ tableLayout: 'auto', '& th': { whiteSpace: 'normal'}}}>
            <thead>
            <tr>
                <th>Rider Benefits</th>
                {(data?.riders || []).map((column: any) => (
                    <th key={column.rider_id}>{column.rider_name}</th>
                ))}
            </tr>
            </thead>
            <tbody>
            {(data?.rider_benefits || []).map((row: any) => (
                <tr key={row.rider_benefit_id}>
                <td>{row.rider_benefit_name}</td>
                {(data?.riders || []).map((column: any) => (
                    <td key={column.rider_id}>
                    {
                        data?.rider_benefit_details.find(
                        (d) =>
                            d.rider_id === column.rider_id &&
                            d.rider_benefit_id === row.rider_benefit_id
                        )?.detail
                    }
                    </td>
                ))}
                </tr>
            ))}
            </tbody>
        </Table>
    );
}

// Alain table
interface Plan {
    plan_id: number;
    plan_name: string;
    }
    
    interface PlanBenefit {
    plan_benefit_id: number;
    plan_benefit_name: string;
    }
    
    interface PlanBenefitDetail {
    plan_id: number;
    plan_benefit_id: number;
    detail: string;
    }
    
    interface JsonData {
    plans: Plan[];
    plan_benefits: PlanBenefit[];
    plan_benefit_details: PlanBenefitDetail[];
    }
    
    interface TableComponentProps {
    data: JsonData;
    }
      
    function PlanBenefitTable({ data }: TableComponentProps) {
        return (
            <Table variant="soft" borderAxis="bothBetween" sx={{ tableLayout: 'auto', '& th': { whiteSpace: 'normal'}}}>
                <thead>
                <tr>
                    <th>Plan Benefits</th>
                    {(data?.plans || []).map((column: any) => (
                        <th key={column.plan_id}>{column.plan_name}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {(data?.plan_benefits || []).map((row: any) => (
                    <tr key={row.plan_benefit_id}>
                    <td>{row.plan_benefit_name}</td>
                    {(data?.plans || []).map((column: any) => (
                        <td key={column.plan_id}>
                        {
                            data?.plan_benefit_details.find(
                            (d) =>
                                d.plan_id === column.plan_id &&
                                d.plan_benefit_id === row.plan_benefit_id
                            )?.detail
                        }
                        </td>
                    ))}
                    </tr>
                ))}
                </tbody>
            </Table>
        );
    }

export default function TeamExample() {
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [filterData, setFilterData] = React.useState<any>({});
    const [selectedFilter, setSelectedFilter] = useState<any>({});
    const [comparePremiumsData, setComparePremiumsData] = useState<any>({});
    const [riderBenefits, setRiderBenefits] = useState<any>({});
    const [planBenefits, setPlanBenefits] = useState<any>({});
    const [selectedColumns, setSelectedColumns] = useState<any>({
        "Plan Premium": true,
        "Rider Premium": true,
        "Total Premium": true,
        "Cash Outlay": true
    });
    // const [tabValue, setTabValue] = useState(0);
    // const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    //     setTabValue(newValue);
    // };

    // CheckBoxes
    const getFilterData = async () => {
        console.log(selectedFilter)
        console.log(filterData);
        await fetch('/api/get_filter',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(selectedFilter)
        }).then(response => response.json()).then(data => setFilterData(data.data));
    };

    const getComparePremiumsData = async () => {

        const plan_ids = selectedFilter.plan_ids || [];
        const rider_ids = selectedFilter.rider_ids || [];

        console.log(filterData);
        console.log("Plan ids: " + plan_ids)

        if (plan_ids.length === 0)
            return;


        const plans: any = [];

        plan_ids.forEach((plan_id: any) => {
            const riders = filterData.riders.filter((r: any) => rider_ids.includes(r.id) && r.plan_id === plan_id);
            if (riders.length === 0) {
                plans.push({plan_id: plan_id});
                return;
            }
            riders.forEach((rider: any) => plans.push({plan_id: plan_id, rider_id: rider.id}));
        });

        console.log("Plans: " + plans);
        const selectedComparePremiums = {plans: plans};

        console.log(selectedComparePremiums)
        // console.log(comparePremiumsData)
        await fetch('/api/compare_premiums',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(selectedComparePremiums)
        }).then(response => response.json()).then(data => setComparePremiumsData(data.data));

    }

    const clearFilters = () => {
      setFilterData({});
      setSelectedFilter({});
      setRiderBenefits({});
      setPlanBenefits({});
    };

    useEffect(() => {

        (async () => {
            await getFilterData();
        })();

        (async () => {
            await getComparePremiumsData();
        })();

        (async () => {
            await getRiderBenefits();
        })();

        (async () => {
            await getPlanBenefits();
        })();

    }, [selectedFilter])

    // LJ table
    const getRiderBenefits = async () => {

        const selectedRiders = {
            "rider_ids": [
                ...(selectedFilter?.rider_ids || [])
            ]
        }
        
        await fetch('/api/get_rider_benefits',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(selectedRiders)
        })
        .then(response => response.json())
        .then(data => {
            const jsonData: JsonData = data.data; // Typecasting the fetched data
            console.log(data.data);
            setRiderBenefits(jsonData);
        })

    }

    // Alain table
    const getPlanBenefits = async () => {

        const selectedPlans = {
            "plan_ids": [
                ...(selectedFilter?.plan_ids || [])
            ]
        }
        
        await fetch('/api/get_plan_benefits',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(selectedPlans)
        })
        .then(response => response.json())
        .then(data => {
            const jsonData: JsonData = data.data; // Typecasting the fetched data
            console.log(data.data);
            setPlanBenefits(jsonData);
        })

    }

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

    const {isLoggedIn } = useAuth();

    if (!isLoggedIn) {
        return <Navigate to="/"/>;
        // console.log("I am supposed to be here");
    }


    return (
        <CssVarsProvider disableTransitionOnChange>
            <CssBaseline />
            {drawerOpen && (
                <Layout.SideDrawer onClose={() => setDrawerOpen(false)}>
                    {/* <TeamNav /> */}
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
                            onClick={handleLogout}
                        >
                            <LogoutIcon />
                        </IconButton>

                        <ColorSchemeToggle />
                    </Box>
                </Layout.Header>
                <Layout.SideNav>
                    <div>
                        <div>
                        <button onClick={clearFilters}>Clear</button>
                        <button onClick={clearFilters}>Clear</button>
                        <button onClick={clearFilters}>Clear</button>
                        </div>
                        <div>
                            <h2>Companies:</h2>
                            {(filterData?.companies || []).map((company: any) => (
                                <div key={company.id}>
                                    <input
                                        type="checkbox"
                                        value={filterData.company}
                                        checked={(selectedFilter?.company_ids || []).includes(company.id)}
                                        onChange={() => {
                                            let selectedCompanies = selectedFilter?.company_ids || [];
                                            if (selectedCompanies.includes(company.id))
                                                selectedCompanies = selectedCompanies.filter((item: any) => item !== company.id);
                                            else
                                                selectedCompanies.push(company.id)
                                            setSelectedFilter({...selectedFilter, company_ids: selectedCompanies})
                                        }}
                                    />
                                    <label>{company.name}</label>
                                </div>
                            ))}
                        </div>
                        <div>
                            <h2>Ward Types:</h2>
                            {(filterData?.wards || []).map((wardType: any) => (
                                <div key={wardType}>
                                    <input
                                        type="checkbox"
                                        value={wardType}
                                        onChange={() => {
                                            let selectedWardTypes = selectedFilter?.ward_types || [];
                                            if (selectedWardTypes.includes(wardType))
                                                selectedWardTypes = selectedWardTypes.filter((item: any) => item !== wardType);
                                            else
                                                selectedWardTypes.push(wardType)
                                            setSelectedFilter({...selectedFilter, ward_types: selectedWardTypes})
                                        }}
                                    />
                                    <label>{wardType}</label>
                                </div>
                            ))}
                        </div>
                        <div>
                            <h2>Plan IDs:</h2>
                            {(filterData?.plans || []).map((plan: any) => (
                                <div key={plan.id}>
                                    <input
                                        type="checkbox"
                                        value={plan.id}
                                        onChange={() => {
                                            let selectedPlans = selectedFilter?.plan_ids || [];
                                            if (selectedPlans.includes(plan.id))
                                                selectedPlans = selectedPlans.filter((item: any) => item !== plan.id);
                                            else
                                                selectedPlans.push(plan.id)
                                            setSelectedFilter({...selectedFilter, plan_ids: selectedPlans})
                                        }}
                                    />
                                    <label>{plan.name}</label>
                                </div>
                            ))}
                          <h2>Rider IDs:</h2>
                          {(filterData?.riders || []).map((rider: any) => (
                            <div key={rider.id}>
                                <input
                                    type="checkbox"
                                    value={rider.id}
                                    onChange={() => {
                                        let selectedRiders = selectedFilter?.rider_ids || [];
                                        if (selectedRiders.includes(rider.id))
                                            selectedRiders = selectedRiders.filter((item: any) => item !== rider.id);
                                        else
                                            selectedRiders.push(rider.id)
                                        console.log("selected Riders is as follows");
                                        console.log(selectedRiders);
                                        setSelectedFilter({...selectedFilter, rider_ids: selectedRiders})
                                    }}
                                />
                                <label>{rider.name}</label>
                            </div>
                          ))}
                        </div>
                        <button onClick={clearFilters}>Clear</button>
                    </div>
                    {/* <TeamNav /> */}
                </Layout.SideNav>
                <Layout.Main>
                    <Box sx={{ width: "72.5vw", overflow: 'auto' }}>
                        <div>
                            {
                                ["Plan Premium", "Rider Premium", "Total Premium", "Cash Outlay"]
                                    .map(columnText =>
                                        <div>
                                            <input
                                                type="checkbox"
                                                value={columnText}
                                                checked={selectedColumns[columnText]}
                                                onChange={e => {
                                                    // At least 1 must be selected
                                                    if (!e.target.checked) {
                                                        const num_selected = Object.values(selectedColumns).filter((value: any) => value === true).length;
                                                        if (num_selected <= 1) {
                                                            e.target.checked = true;
                                                            return;
                                                        }
                                                    }
                                                    setSelectedColumns({...selectedColumns, [columnText]: e.target.checked})
                                                }}
                                            />
                                            <label>{columnText}</label>
                                        </div>
                                )

                            }
                        </div>
                        <Sheet variant="outlined">
                            {/* <Tabs value={tabValue} onChange={handleTabChange} aria-label="simple tabs example">
                                <Tab label="Comparison Table" />
                                <Tab label="Plan Benefits" />
                                <Tab label="Rider Benefits" />
                            </Tabs>
                            <TabPanel value={tabValue} index={0}> */}
                                {/* Compare premiums */}
                                <Table variant="soft" borderAxis="bothBetween" sx={{ tableLayout: 'auto', '& th': { whiteSpace: 'normal'}}}>
                                <thead>
                                    <tr>
                                        {/* Render top-level headers */}
                                        {(comparePremiumsData?.columns || []).map((column: any) => {
                                            // Apply colSpan for parent columns that have children
                                            const colSpan = column.children ? column.children.filter((childColumn: any) => selectedColumns[childColumn.text]).length : 1;
                                            return <th key={column.name} colSpan={colSpan}>{column.text}</th>;
                                        })}
                                    </tr>
                                    {/* Render sub-headers if any columns have children */}
                                    {(comparePremiumsData?.columns || []).some((column: any) => column.children) && (
                                        <tr>
                                            {(comparePremiumsData.columns|| []).flatMap((column: any) =>
                                            column.children ? column.children.filter((childColumn: any) => selectedColumns[childColumn.text]).map((childColumn: any) => <th key={childColumn.name}>{childColumn.text}</th>) : <th key={column.name}></th>
                                            )}
                                        </tr>
                                    )}
                                </thead>
                                <tbody>
                                    {(comparePremiumsData?.rows || []).map((row: any, rowIndex: number) => (
                                    <tr key={rowIndex}>
                                        {(comparePremiumsData?.columns || []).map((column: any) => {
                                            if (column.children) {
                                                return column.children.filter((childColumn: any) => selectedColumns[childColumn.text]).map((childColumn: any) => (
                                                    <td key={childColumn.name}>{row[childColumn.name]}</td>
                                                ));
                                            } else {
                                                return <td key={column.name}>{row[column.name]}</td>;
                                            }
                                        })}
                                    </tr>
                                    ))}
                                </tbody>
                                </Table>
                            {/* </TabPanel>
                            <TabPanel value={tabValue} index={1}> */}
                                {/* Plan Benefits */}
                                <PlanBenefitTable data={planBenefits} />
                            {/* </TabPanel>
                            <TabPanel value={tabValue} index={2}> */}
                                {/* Rider Benefits */}
                                <RiderBenefitTable data={riderBenefits} />
                            {/* </TabPanel>     */}
                        </Sheet>
                    </Box>
                </Layout.Main>
            </Layout.Root>
        </CssVarsProvider>
    );
}

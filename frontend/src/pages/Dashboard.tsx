import * as React from 'react';
import { ChangeEvent, useState, useEffect } from "react";
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

// Icons import
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import MenuIcon from '@mui/icons-material/Menu';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import BookRoundedIcon from '@mui/icons-material/BookRounded';

// custom
import Menu from '../components/Menu';
import Layout from '../components/Layout';
//import CheckBoxes from "../components/CheckBoxes";
import { StringLiteralType } from 'typescript';
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

        const selectedComparePremiums = {
            "plans": [
                ...(selectedFilter?.plan_ids || []).map((plan_id: any) => ({plan_id: plan_id}))
            ]
        }

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
        if ((selectedFilter?.rider_ids || [])){
            console.log("Selected filter");
            console.log(selectedFilter);
            const selectedRiders = {
                "rider_ids": selectedFilter?.rider_ids
            }

            // console.log(selectedRiders)
            // console.log(riderBenefits)
            // console.log(selectedFilter?.rider_ids)
            
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
        

    }

    // Alain table
    const getPlanBenefits = async () => {
        if ((selectedFilter?.plan_ids || [])){
            console.log("Selected filter");
            console.log(selectedFilter);
            const selectedPlans = {
                "plan_ids": selectedFilter?.plan_ids
            }

            // console.log(selectedPlans)
            // console.log(planBenefits)
            // console.log(selectedFilter?.plan_ids)
            
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
        

    }

    // // State to track visible columns
    // const [visibleColumns, setVisibleColumns] = useState(() => {
    //     // Initially, all columns are visible
    //     const initialVisibility = {};
    //     comparePremiumsData?.columns?.forEach((column: any) => {
    //         initialVisibility[column.name] = true;
    //     });
    //     return initialVisibility;
    // });

    // // Toggle column visibility
    // const toggleColumn = (columnName: any) => {
    //     setVisibleColumns((prevVisibleColumns) => ({
    //         ...prevVisibleColumns,
    //         [columnName]: !prevVisibleColumns[columnName],
    //     }));
    // };

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
                        </div>
                        {/* <div>
                            <h2>Plan ID Columns:</h2>
                            {(comparePremiumsData?.columns || []).map((column: any) => (
                                <div key={column.name}>
                                    <input
                                        type="checkbox"
                                        value={column.name}
                                        onChange={() => {
                                            let selectedPlansColumns = comparePremiumsData?.columns || [];
                                            if (selectedPlansColumns.includes(column.name))
                                                selectedPlansColumns = selectedPlansColumns.filter((item: any) => item !== column.name);
                                            else
                                                selectedPlansColumns.push(column.name)
                                            setSelectedFilter({...selectedFilter, columns: selectedPlansColumns})
                                        }}
                                    />
                                    <label>{column.text}</label>
                                </div>
                            ))}
                        </div> */}
                        <div>
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
                                        {comparePremiumsData?.columns?.map((column: any) => {
                                            // Apply colSpan for parent columns that have children
                                            const colSpan = column.children ? column.children.length : 1;
                                            return <th key={column.name} colSpan={colSpan}>{column.text}</th>;
                                        })}
                                    </tr>
                                    {/* Render sub-headers if any columns have children */}
                                    {comparePremiumsData?.columns?.some((column: any) => column.children) && (
                                        <tr>
                                            {comparePremiumsData.columns.flatMap((column: any) =>
                                            column.children ? column.children.map((childColumn: any) => <th key={childColumn.name}>{childColumn.text}</th>) : <th key={column.name}></th>
                                            )}
                                        </tr>
                                    )}
                                </thead>
                                <tbody>
                                    {/* {(comparePremiumsData?.rows || []).map((row: any, index: any) => (
                                        <tr key={index}>
                                            {comparePremiumsData.columns.map((column: any) => (
                                            <td key={column.name}>{row[column.name]}</td>
                                            ))}
                                        </tr>
                                    ))} */}
                                    {(comparePremiumsData?.rows || []).map((row: any, rowIndex: number) => (
                                    <tr key={rowIndex}>
                                        {(comparePremiumsData?.columns || []).map((column: any) => {
                                            if (column.children) {
                                                return column.children.map((childColumn: any) => (
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

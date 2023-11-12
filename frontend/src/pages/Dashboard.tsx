import * as React from 'react';
import axios from 'axios';
import { CssVarsProvider, useColorScheme } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Autocomplete from '@mui/joy/Autocomplete';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Chip from '@mui/joy/Chip';
import ChipDelete from '@mui/joy/ChipDelete';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import IconButton from '@mui/joy/IconButton';
import Button from '@mui/joy/Button';
import List from '@mui/joy/List';
import ListSubheader from '@mui/joy/ListSubheader';
import Divider from '@mui/joy/Divider';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import ListItemContent from '@mui/joy/ListItemContent';
import RadioGroup from '@mui/joy/RadioGroup';
import Radio from '@mui/joy/Radio';
import Slider from '@mui/joy/Slider';
import Sheet from '@mui/joy/Sheet';
import Table from '@mui/joy/Table';
import { useState, useEffect } from "react";
// can remove these two
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useDemoData } from '@mui/x-data-grid-generator';

// Icons import
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
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

//CHECKBOXES
interface FormElements extends HTMLFormControlsCollection {
    company_ids:HTMLInputElement;
    ward_types: HTMLInputElement;
    plan_ids: HTMLInputElement;
}

interface CalculateFormElement extends HTMLFormElement {
    readonly elements: FormElements;
}

interface ApiResponse {
    data: {
        companies: { id: number; name: string }[];
        plans: { id: number; name: string }[];
        riders: { id: number; name: string }[];
        wards: string[];
    };
    status: string;
}
// use useEffect and have a state for it so that the data will be displayed upon entry
// display it in the list!! see isaac's!!! 

// Table
// function createData(
//   companyName: string,
//   ward: string,
//   plans: string,
//   riders: string,
// ) {
//   return { companyName, ward, plans, riders};
// }

// const initialRows = [
//   createData('AIA', 'A', 'testing1', 'testing2'),
//   createData('Prudential', 'B1', 'testing3', 't4'),
//   createData('NTUC', 'C', 't5', 't6'),
//   createData('Great Eastern', 'Private', 't7', 't8'),
// ];

interface ApiResponseTable {
    data: {
        columns: {
            name: string;
            text: string;
            children?: {
                name: string;
                text: string;
            }[];
        }[];
        rows: {
            [key: string]: number | string;
        }[];
    };
    status: string;
}

interface ApiData {
    companyName: string;
    ward: string;
    plans: string;
    riders: string;
}

// JH method
// interface PlansComparison {
//     age: number | null,
//     medishield_life_premium: number | null,
//     annual_withdrawallimit: number | null,
//     set_0: Set_0[],
//     set_1: Set_1[]
// }
//
// interface Set_0 {
//     set_0_plan_premium: number,
//     set_0_total_premium: number,
//     set_0_cash_outlay: number
// }
//
// interface Set_1 {
//     set_1_plan_premium: number,
//     set_1_total_premium: number,
//     set_1_cash_outlay: number
// }

export default function TeamExample() {
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [company_ids, set_company_ids] = React.useState<string[]>([]);
    const [ward_types, set_ward_types] = React.useState<string[]>([]);
    const [plan_ids, set_plan_ids] = React.useState<string[]>([]);
    const [filterData, setFilterData] = React.useState<any>({});
    const [selectedFilter, setSelectedFilter] = useState<any>({});
    const [comparePremiumsData, setComparePremiumsData] = useState<any>({});
    const [responseDataTable, setResponseDataTable] = React.useState<ApiResponseTable>({
      data: {
        columns: [],
        rows: []
      },
      status: 'success',
    });
    // For table
    const [selectedPlans, setSelectedPlans] = useState([]);
    const [selectedRiders, setSelectedRiders] = useState([]);
    // JH method
    // const [selectedCompany, setSelectedCompany] = useState(null);
    // const [selectedPlan, setSelectedPlan] = useState(null);
    // const [selectedRider, setSelectedRider] = useState('');
    // const [filterData, setFilterData] = useState<any>({});
    //
    // const [plansComparison, setplansComparison] = useState<PlansComparison>({
    //     age: null,
    //     medishield_life_premium: null,
    //     annual_withdrawallimit: null,
    //     set_0: [],
    //     set_1: []
    // });

    // CheckBoxes
    const getFilterData = async () => {
        // const postData = {
        //     company_ids.
        //     ward_types,
        //     plan_ids,
        // }
        // const postDataTable = {
        //   plans: selectedPlans.map((plan_id) => ({ plan_ids: plan_id })),
        //   riders: selectedRiders.map((rider_id) => ({ rider_ids: rider_id })),
        // }
        // try {
        //   const response = await axios.post<ApiResponse>('/api/get_filter', selectedFilter, {
        //     headers: { 'Content-Type': 'application/json' },
        //   });
        //   // const responseTable = await axios.post<ApiResponseTable>('/api/compare_premiums', postDataTable, {
        //   //   headers: { 'Content-Type': 'application/json' },
        //   // });
        //
        //   // Handle the data
        //   setFilterData(response.data.data);
        //   console.log(response.data.data);
        //   // setResponseDataTable(responseTable.data);
        // } catch (error) {
        //   console.log('Error', error);
        // }
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

        await fetch('/api/compare_premiums',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(selectedComparePremiums)
        }).then(response => response.json()).then(data => setComparePremiumsData(data.data));

    }



    useEffect(() => {

        (async () => {
            await getFilterData();
        })();

        (async () => {
            await getComparePremiumsData();
        })();

    }, [selectedFilter])

    // JH method

    // const getFilter = async () => {
    //     const response = await fetch('/api/get_filter', {
    //         method: 'POST',
    //         headers: {'Content-Type': 'application/json'},
    //         body: JSON.stringify({
    //             "company_ids": selectedCompany ? [selectedCompany]: [],
    //             "plan_ids": selectedPlan ? [selectedPlan]: []
    //         })
    //     });
    //
    //     if (!response.ok) {
    //         throw new Error(`HTTP error! Status: ${response.status}`);
    //     }
    //
    //     const responseData = await response.json();
    //     console.log(responseData);
    //     setFilterData(responseData.data)
    // }
    //
    // useEffect(() => {
    //
    //     fetch('/api/compare_premiums', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json'}
    //     })
    //         .then((response) => response.json())
    //         .then((data) => {
    //             console.log(data);
    //             console.log(data.status);
    //             console.log(data.data);
    //             if (typeof data === 'object' && data !== null) {
    //                 Object.keys(data.data).forEach((key) => {
    //                     // Check the data type of each property
    //                     console.log(`${key}: ${typeof data[key]}`);
    //                 });
    //             } else {
    //                 console.error('Data is not an object.');
    //             }
    //
    //             setplansComparison(data.data);
    //
    //             console.log('i fire once');
    //         })
    //         .catch((error) => {
    //             console.error('Error fetching compare_premiums:', error);
    //         });
    //
    //     (async() => {
    //         await getFilter();
    //     })();
    //
    // }, [selectedCompany, selectedPlan]);
    //
    // const [checkedItems, setCheckedItems] = useState(new Map());
    // const [rows, setRows] = useState<ApiData[]>([]);
    //
    // // Define a function to update the checked items
    // type ListName = 'Companies' | 'Wards' | 'Plans' | 'Riders';
    // type ItemName = string;

    // const handleCheckboxChange = (listName: ListName, itemName: ItemName) => {
    //   // Update the checked items state
    //   setCheckedItems((prevItems) => {
    //     const updatedItems = new Map(prevItems);
    //     if (updatedItems.has(listName)) {
    //       const list = updatedItems.get(listName);
    //       if (list) {
    //         if (list.has(itemName)) {
    //           list.delete(itemName);
    //         } else {
    //           list.add(itemName);
    //         }
    //       }
    //     }
    //     return updatedItems;
    //   });
    // };

    // useEffect(() => {
    //   console.log('Initial Rows:', initialRows);
    //   // Filter and update the displayed rows based on checked items
    //   const updatedRows = initialRows.filter((row) => {
    //     if (
    //       checkedItems.get('Companies')?.size &&
    //       !checkedItems.get('Companies')?.has(row.companyName)
    //     ) {
    //       return false;
    //     }
    //     if (
    //       checkedItems.get('Wards')?.size &&
    //       !checkedItems.get('Wards')?.has(row.ward)
    //     ) {
    //       return false;
    //     }
    //     if (
    //       checkedItems.get('Plans')?.size &&
    //       !checkedItems.get('Plans')?.has(row.plans)
    //     ) {
    //       return false;
    //     }
    //     if (
    //       checkedItems.get('Riders')?.size &&
    //       !checkedItems.get('Riders')?.has(row.riders)
    //     ) {
    //       return false;
    //     }
    //     return true; // Default case, display the row
    //   });

    //   console.log('Update Rows:', updatedRows);
    //   setRows(updatedRows);
    // }, [checkedItems]);

    // // Create a function to fetch data from the API
    // const fetchDataFromAPI = async () => {
    //   try {
    //     const response = await axios.post('/api/get_filter', {
    //       company_ids: [],
    //       ward_types: [],
    //       plan_ids: [],
    //     });

    //     if (response.status === 200) {
    //       const apiData = response.data; // Replace with the actual data structure
    //       setRows(apiData); // Update the rows with the data from the API
    //     }
    //   } catch (error) {
    //     console.error("Error fetching data:", error);
    //   }
    // };

    // // Use the useEffect hook to fetch data when the component mounts
    // useEffect(() => {
    //   fetchDataFromAPI();
    // }, []);

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
                        <div>
                            <h2>Rider IDs:</h2>
                            {(filterData?.riders || []).map((rider: any) => (
                                <div key={rider.id}>
                                    <input
                                        type="checkbox"
                                        value={rider.id}
                                        onChange={() => {
                                            let selectedRiders = filterData?.rider_ids || [];
                                            if (selectedRiders.includes(rider.id))
                                                selectedRiders = selectedRiders.filter((item: any) => item !== rider.id);
                                            else
                                                selectedRiders.push(rider.id)
                                            setSelectedFilter({...selectedFilter, rider_ids: selectedRiders})
                                        }}
                                    />
                                    <label>{rider.name}</label>
                                </div>
                            ))}
                        </div>
                        <button onClick={getFilterData}>Submit</button>
                    </div>
                    {/* <TeamNav /> */}
                </Layout.SideNav>
                <Layout.Main>
                    <Sheet variant="outlined" style={{ width: '75.2vw' }}>
                        <Table variant="soft" borderAxis="bothBetween" style={{ width: '75vw' }}>
                            <thead>
                            <tr>
                                <th>Age</th>
                                <th>MediShield Life Premium</th>
                                <th>Annual Withdrawal Limit</th>
                            </tr>
                            </thead>
                            <tbody>
                            {responseDataTable.data.rows.map((age) => (
                                <tr key={age.name}>
                                    <td>Age</td>
                                    <td>{age.name}</td>
                                    <td>{age.text}</td>
                                </tr>
                            ))}
                            {responseDataTable.data.rows.map((medishield_life_premium) => (
                                <tr key={medishield_life_premium.name}>
                                    <td>MediShield Life Premium</td>
                                    <td>{medishield_life_premium.name}</td>
                                    <td>{medishield_life_premium.text}</td>
                                </tr>
                            ))}
                            {responseDataTable.data.rows.map((annual_withdrawal_limit) => (
                                <tr key={annual_withdrawal_limit.name}>
                                    <td>Annual Withdrawal Limit</td>
                                    <td>{annual_withdrawal_limit.name}</td>
                                    <td>{annual_withdrawal_limit.text}</td>
                                </tr>
                            ))}
                            {/* {responseData.data.riders.map((rider) => (
                  <tr key={rider.id}>
                    <td>Rider ID</td>
                    <td>{rider.id}</td>
                    <td>{rider.name}</td>
                  </tr>
                ))} */}
                            </tbody>
                            {/* <thead>
                <tr>
                  <th style={{ width: '40%' }}>Company Name</th>
                  <th>Ward</th>
                  <th>Plans</th>
                  <th>Riders</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    <th scope="row">{row.companyName}</th>
                    <td>{row.ward}</td>
                    <td>{row.plans}</td>
                    <td>{row.riders}</td>
                  </tr>
                ))}
              </tbody>  */}
                        </Table>
                    </Sheet>
                </Layout.Main>
            </Layout.Root>
        </CssVarsProvider>
    );
}

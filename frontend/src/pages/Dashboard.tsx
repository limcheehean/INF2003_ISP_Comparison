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
import {
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper
  } from "@material-ui/core";

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

// CHECKBOXES
interface FormElements extends HTMLFormControlsCollection {
    company_ids:HTMLInputElement;
    ward_types: HTMLInputElement;
    plan_ids: HTMLInputElement;
}

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
  
function TableComponent({ data }: TableComponentProps) {
    return (
        <Table variant="soft" borderAxis="bothBetween" style={{ minWidth: '100%' }}>
            <thead>
            <tr>
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

export default function TeamExample() {
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [filterData, setFilterData] = React.useState<any>({});
    const [selectedFilter, setSelectedFilter] = useState<any>({});
    const [comparePremiumsData, setComparePremiumsData] = useState<any>({});
    const [riderBenefits, setRiderBenefits] = useState<any>({});

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
                    <Sheet variant="outlined" style={{ width: '75.2vw' }}>
                      <div style={{overflowX: 'auto'}}>
                        {/* Rider Benefits */}
                        <TableComponent data={riderBenefits} />
                        {/* Compare premiums */}
                        <Table variant="soft" borderAxis="bothBetween" style={{ minWidth: '100%' }}>
                          <thead>
                            <tr>
                              {/* {(comparePremiumsData?.columns || []).map((columns: any) => (
                                  <th key={columns.name}>{columns.text}</th>
                              ))} */}
                              {(comparePremiumsData?.columns || []).map((column: any) => {
                                  if (column.children) {
                                      return column.children.map((childColumn: any) => (
                                          <th key={childColumn.name}>{childColumn.text}</th>
                                      ));
                                  } else {
                                      return <th key={column.name}>{column.text}</th>;
                                  }
                              })}
                            </tr>
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
                      </div>
                        
                    </Sheet>
                </Layout.Main>
            </Layout.Root>
        </CssVarsProvider>
    );
}

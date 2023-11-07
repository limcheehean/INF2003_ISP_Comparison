import * as React from 'react';
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
import { Wards, Companies, Plans, Riders } from "../components/CheckBoxes";
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

// Checkboxes

// Define the type for the items prop
type Item = {
  name: string;
};

interface CheckBoxesProps {
  items: Item[];
}

function CheckBoxes({ items }: CheckBoxesProps ) {
  const [checkedState, setCheckedState] = useState(
    new Array(items.length).fill(false)
  );

  const handleOnChange = (position: number) => {
    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? !item : item
    );

    setCheckedState(updatedCheckedState);
  };

  return (
    <ul style={{ listStyle: 'none' }}>
    {items.map(({ name }, index) => {
      return (
        <li key={index}>
          <div className="wards-list-item">
            <input
              type="checkbox"
              id={`custom-checkbox-${index}`}
              name={name}
              value={name}
              checked={checkedState[index]}
              onChange={() => handleOnChange(index)}
            />
            <label htmlFor={`custom-checkbox-${index}`}>{name}</label>
          </div>
        </li>
      );
    })}
  </ul>
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
            <ListItemDecorator sx={{ color: 'neutral.500' }}>
              <AddBusinessIcon fontSize="small" />
            </ListItemDecorator>
            <ListItemContent>Company Name</ListItemContent>
          </ListItem>
          <CheckBoxes items={Companies}/>
          <ListItem>
            <ListItemDecorator>
              <PeopleRoundedIcon fontSize="small" />
            </ListItemDecorator>
            <ListItemContent>Ward</ListItemContent>
          </ListItem>
          <CheckBoxes items={Wards}/>
          <ListItem>
            <ListItemDecorator sx={{ color: 'neutral.500' }}>
              <ArticleRoundedIcon fontSize="small" />
            </ListItemDecorator>
            <ListItemContent>Plans</ListItemContent>
          </ListItem>
          <CheckBoxes items={Plans}/>
          <ListItem>
            <ListItemDecorator sx={{ color: 'neutral.500' }}>
              <AssignmentIndRoundedIcon fontSize="small" />
            </ListItemDecorator>
            <ListItemContent>Riders</ListItemContent>
          </ListItem>
          <CheckBoxes items={Riders}/>
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
  return { companyName, ward, plans, riders};
}

const initialRows = [
  createData('AIA', 'A', 'testing1', 'testing2'),
  createData('Prudential', 'B1', 'testing3', 't4'),
  createData('NTUC', 'C', 't5', 't6'),
  createData('Great Eastern', 'Private', 't7', 't8'),
];

export default function TeamExample() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // To display only the checked boxes
  // Define state to keep track of the checked checkboxes
  // const [checkedItems, setCheckedItems] = useState({
  //   Companies: new Set(),
  //   Wards: new Set(),
  //   Plans: new Set(),
  //   Riders: new Set(),
  // });
  const [checkedItems, setCheckedItems] = useState(new Map());
  const [rows, setRows] = useState(initialRows);

  // Define a function to update the checked items
  type ListName = 'Companies' | 'Wards' | 'Plans' | 'Riders';
  type ItemName = string;

  const handleCheckboxChange = (listName: ListName, itemName: ItemName) => {
    // Update the checked items state
    setCheckedItems((prevItems) => {
      const updatedItems = new Map(prevItems);
      if (updatedItems.has(listName)) {
        const list = updatedItems.get(listName);
        if (list) {
          if (list.has(itemName)) {
            list.delete(itemName);
          } else {
            list.add(itemName);
          }
        }
      }
      return updatedItems;
    });
  };

  useEffect(() => {
    console.log('Initial Rows:', initialRows);
    // Filter and update the displayed rows based on checked items
    const updatedRows = initialRows.filter((row) => {
      if (
        checkedItems.get('Companies')?.size &&
        !checkedItems.get('Companies')?.has(row.companyName)
      ) {
        return false;
      }
      if (
        checkedItems.get('Wards')?.size &&
        !checkedItems.get('Wards')?.has(row.ward)
      ) {
        return false;
      }
      if (
        checkedItems.get('Plans')?.size &&
        !checkedItems.get('Plans')?.has(row.plans)
      ) {
        return false;
      }
      if (
        checkedItems.get('Riders')?.size &&
        !checkedItems.get('Riders')?.has(row.riders)
      ) {
        return false;
      }
      return true; // Default case, display the row
    });
  
    console.log('Update Rows:', updatedRows);
    setRows(updatedRows);
  }, [checkedItems]);

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
          <Sheet variant="outlined" style={{ width: '75.2vw' }}>
            <Table variant="soft" borderAxis="bothBetween" style={{ width: '75vw' }}>
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Company Name</th>
                  <th>Ward</th>
                  <th>Plans</th>
                  <th>Riders</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.companyName}>
                    <th scope="row">{row.companyName}</th>
                    <td>{row.ward}</td>
                    <td>{row.plans}</td>
                    <td>{row.riders}</td>
                </tr>
                ))}
              </tbody>
            </Table>
          </Sheet>
        </Layout.Main>
      </Layout.Root>
    </CssVarsProvider>
  );
}

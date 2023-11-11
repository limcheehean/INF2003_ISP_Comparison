import React, { useEffect, useState } from 'react';
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
import Sheet from '@mui/joy/Sheet';
import Table from '@mui/joy/Table';
import {DialogContent, DialogTitle, DialogActions, Modal, ModalDialog, Tooltip, Select} from "@mui/joy";
import Stack from "@mui/joy/Stack";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Divider from '@mui/joy/Divider';
import { visuallyHidden } from '@mui/utils';
import Option from '@mui/joy/Option';
import Checkbox from '@mui/joy/Checkbox';
import Link from '@mui/joy/Link';

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
import {Add} from "@mui/icons-material";
import DeleteForever from '@mui/icons-material/DeleteForever';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AddIcon from '@mui/icons-material/Add';

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
    user_plans: UserPlan1[]
}

interface UserPlan1 {
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

function labelDisplayedRows({from, to, count}: {
    from: number;
    to: number;
    count: number;
}) {
    return `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key,
): (
    a: { [key in Key]: number | string },
    b: { [key in Key]: number | string },
) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
    disablePadding: boolean;
    id: keyof UserPlan1;
    label: string;
    numeric: boolean;
}

const headCells: readonly HeadCell[] = [
    {
        id: 'age_next_birthday',
        numeric: false,
        disablePadding: true,
        label: 'age next birthday',
    },
    {
        id: 'insured_name',
        numeric: false,
        disablePadding: false,
        label: 'insured name',
    },
    {
        id: 'medishield_life_premium',
        numeric: true,
        disablePadding: false,
        label: 'medishield life premium',
    },
    {
        id: 'payable_by_cash',
        numeric: true,
        disablePadding: false,
        label: 'payable by cash',
    },
    {
        id: 'payable_by_medisave',
        numeric: true,
        disablePadding: false,
        label: 'payable by medisave',
    },
    {
        id: 'plan_name',
        numeric: false,
        disablePadding: false,
        label: 'plan name',
    },
    {
        id: 'plan_premium',
        numeric: true,
        disablePadding: false,
        label: 'plan premium',
    },
    {
        id: 'rider_name',
        numeric: false,
        disablePadding: false,
        label: 'rider name',
    },
    {
        id: 'rider_premium',
        numeric: true,
        disablePadding: false,
        label: 'rider premium',
    },
    {
        id: 'total_premium',
        numeric: true,
        disablePadding: false,
        label: 'total premium',
    },
];

interface EnhancedTableProps {
    numSelected: number;
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof UserPlan1) => void;
    onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
        props;
    const createSortHandler =
        (property: keyof UserPlan1) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <thead>
        <tr>
            <th>
                <Checkbox
                    indeterminate={numSelected > 0 && numSelected < rowCount}
                    checked={rowCount > 0 && numSelected === rowCount}
                    onChange={onSelectAllClick}
                    slotProps={{
                        input: {
                            'aria-label': 'select all desserts',
                        },
                    }}
                    sx={{ verticalAlign: 'sub' }}
                />
            </th>
            {headCells.map((headCell) => {
                const active = orderBy === headCell.id;
                return (
                    <th
                        key={headCell.id}
                        aria-sort={
                            active
                                ? ({ asc: 'ascending', desc: 'descending' } as const)[order]
                                : undefined
                        }
                    >
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <Link
                            underline="none"
                            color="neutral"
                            textColor={active ? 'primary.plainColor' : undefined}
                            component="button"
                            onClick={createSortHandler(headCell.id)}
                            fontWeight="lg"
                            startDecorator={
                                headCell.numeric ? (
                                    <ArrowDownwardIcon sx={{ opacity: active ? 1 : 0 }} />
                                ) : null
                            }
                            endDecorator={
                                !headCell.numeric ? (
                                    <ArrowDownwardIcon sx={{ opacity: active ? 1 : 0 }} />
                                ) : null
                            }
                            sx={{
                                '& svg': {
                                    transition: '0.2s',
                                    transform:
                                        active && order === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)',
                                },
                                '&:hover': { '& svg': { opacity: 1 } },
                            }}
                        >
                            {headCell.label}
                            {active ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </Link>
                    </th>
                );
            })}
        </tr>
        </thead>
    );
}

interface EnhancedTableToolbarProps {
    numSelected: number;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
    const { numSelected } = props;
    const [deletePlan, setDeletePlan] = useState<boolean>(false);
    const [addPlan, setAddPlan] = useState<boolean>(false);

    const handleDeleteConfirmation = () => {
        fetch('/api/delete_user_plans', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error("Error deleting user plan:", error);
            })
    }

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                py: 1,
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                ...(numSelected > 0 && {
                    bgcolor: 'background.level1',
                }),
                borderTopLeftRadius: 'var(--unstable_actionRadius)',
                borderTopRightRadius: 'var(--unstable_actionRadius)',
            }}
        >
            {numSelected > 0 ? (
                <Typography sx={{ flex: '1 1 100%' }} component="div">
                    {numSelected} selected
                </Typography>
            ) : (
                <Typography
                    level="body-lg"
                    sx={{ flex: '1 1 100%' }}
                    id="tableTitle"
                    component="div"
                >
                    User Plan
                </Typography>
            )}


            {numSelected > 0 ? (
                <Tooltip title="Delete">
                    <IconButton size="sm" color="danger" variant="solid" onClick={() => setDeletePlan(true)}>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>

            ) : (
                <Tooltip title="Add Plan">
                    <Button
                        variant="outlined"
                        color="neutral"
                        startDecorator={<Add />}
                        onClick={() => setAddPlan(true)}
                        sx = {{
                            height: '30px',
                            whiteSpace: 'nowrap',

                        }}
                    >
                        New project
                    </Button>
                </Tooltip>
            )}

            <Modal open={addPlan} onClose={() => setAddPlan(false)}>
                <ModalDialog>
                    <DialogTitle>Add new project</DialogTitle>
                    <DialogContent>Fill in the information of the project.</DialogContent>
                    <form
                        onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
                            event.preventDefault();
                            setAddPlan(false);
                        }}
                    >
                        <Stack spacing={2}>
                            <FormControl>
                                <FormLabel>Name</FormLabel>
                                <Input autoFocus required />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Description</FormLabel>
                                <Input required />
                            </FormControl>
                            <Button type="submit">Submit</Button>
                        </Stack>
                    </form>
                </ModalDialog>
            </Modal>

            <Modal open={deletePlan} onClose={() => setDeletePlan(false)}>
                <ModalDialog variant="outlined" role="alertdialog">
                    <DialogTitle>
                        <WarningRoundedIcon />
                        Confirmation
                    </DialogTitle>
                    <Divider />
                    <DialogContent>
                        Are you sure you want to delete the selected plan(s)?
                    </DialogContent>
                    <DialogActions>
                        <Button variant="solid" color="danger" onClick={() => {
                            handleDeleteConfirmation();
                            setDeletePlan(false);
                        }}>
                            Delete
                        </Button>
                        <Button variant="plain" color="neutral" onClick={() => setDeletePlan(false)}>
                            Cancel
                        </Button>
                    </DialogActions>
                </ModalDialog>
            </Modal>

        </Box>

    );

}


export default function TeamExample() {
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [openAddPlan, setopenAddPlan] = useState<boolean>(false);
    const [openDeletePlan, setDeletePlan] = React.useState<boolean>(false);
    const [userPlans, setUserPlans] = React.useState<UserPlans>({
        grand_total_premiums: null,
        total_payable_by_cash: null,
        total_payable_by_medisave: null,
        user_plans: []
    });
    const [order, setOrder] = React.useState<Order>('asc');
    const [orderBy, setOrderBy] = React.useState<keyof UserPlan1>('plan_name');
    const [selected, setSelected] = React.useState<readonly string[]>([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

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

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof UserPlan1,
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = userPlans.user_plans.map((n) => n.plan_name);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event: React.MouseEvent<unknown>, name: string) => {
        const selectedIndex = selected.indexOf(name);
        let newSelected: readonly string[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, name);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }

        setSelected(newSelected);
    };

    const handleChangePage = (newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: any, newValue: number | null) => {
        setRowsPerPage(parseInt(newValue!.toString(), 10));
        setPage(0);
    };

    const getLabelDisplayedRowsTo = () => {
        if (userPlans.user_plans.length === -1) {
            return (page + 1) * rowsPerPage;
        }
        return rowsPerPage === -1
            ? userPlans.user_plans.length
            : Math.min(userPlans.user_plans.length, (page + 1) * rowsPerPage);
    };

    const isSelected = (name: string) => selected.indexOf(name) !== -1;

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - userPlans.user_plans.length) : 0;


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
                    <Sheet
                        variant="outlined"
                        sx={{ width: '75.2vw', boxShadow: 'sm', borderRadius: 'sm' }}
                    >
                        <EnhancedTableToolbar numSelected={selected.length} />
                        <Table
                            aria-labelledby="tableTitle"
                            hoverRow
                            sx={{
                                '--TableCell-headBackground': 'transparent',
                                '--TableCell-selectedBackground': (theme) =>
                                    theme.vars.palette.success.softBg,
                                '& thead th:nth-of-type(1)': {
                                    width: '40px',
                                    textAlign: 'center'
                                },
                                '& thead th:nth-of-type(2)': {
                                    //width: '30%',

                                },
                                '& tr > *:nth-of-type(n+3)': { textAlign: 'right' },
                            }}
                        >
                            <EnhancedTableHead
                                numSelected={selected.length}
                                order={order}
                                orderBy={orderBy}
                                onSelectAllClick={handleSelectAllClick}
                                onRequestSort={handleRequestSort}
                                rowCount={userPlans.user_plans.length}
                            />
                            <tbody>
                            {stableSort(userPlans.user_plans, getComparator(order, orderBy))
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row, index) => {
                                    const isItemSelected = isSelected(row.plan_name);
                                    const labelId = `enhanced-table-checkbox-${index}`;

                                    return (
                                        <tr
                                            onClick={(event) => handleClick(event, row.plan_name)}
                                            role="checkbox"
                                            aria-checked={isItemSelected}
                                            tabIndex={-1}
                                            key={row.plan_name}
                                            // selected={isItemSelected}
                                            style={
                                                isItemSelected
                                                    ? ({
                                                        '--TableCell-dataBackground':
                                                            'var(--TableCell-selectedBackground)',
                                                        '--TableCell-headBackground':
                                                            'var(--TableCell-selectedBackground)',
                                                    } as React.CSSProperties)
                                                    : {}
                                            }
                                        >
                                            <th scope="row">
                                                <Checkbox
                                                    checked={isItemSelected}
                                                    slotProps={{
                                                        input: {
                                                            'aria-labelledby': labelId,
                                                        },
                                                    }}
                                                    sx={{ verticalAlign: 'top' }}
                                                />
                                            </th>
                                            <th id={labelId} scope="row">
                                                {row.age_next_birthday}
                                            </th>
                                            <td>{row.insured_name}</td>
                                            <td>{row.medishield_life_premium}</td>
                                            <td>{row.payable_by_cash}</td>
                                            <td>{row.payable_by_medisave}</td>
                                            <td>{row.plan_name}</td>
                                            <td>{row.plan_premium}</td>
                                            <td>{row.rider_name}</td>
                                            <td>{row.rider_premium}</td>
                                            <td>{row.total_premium}</td>
                                        </tr>
                                    );
                                })}
                            {emptyRows > 0 && (
                                <tr
                                    style={
                                        {
                                            height: `calc(${emptyRows} * 40px)`,
                                            '--TableRow-hoverBackground': 'transparent',
                                        } as React.CSSProperties
                                    }
                                >
                                    <td colSpan={6} aria-hidden />
                                </tr>
                            )}
                            </tbody>
                            <tfoot>
                            <tr>
                                <td colSpan={11}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            justifyContent: 'flex-end',
                                        }}
                                    >
                                        <FormControl orientation="horizontal" size="sm">
                                            <FormLabel>Rows per page:</FormLabel>
                                            <Select onChange={handleChangeRowsPerPage} value={rowsPerPage}>
                                                <Option value={5}>5</Option>
                                                <Option value={10}>10</Option>
                                                <Option value={25}>25</Option>
                                            </Select>
                                        </FormControl>
                                        <Typography textAlign="center" sx={{ minWidth: 80 }}>
                                            {labelDisplayedRows({
                                                from: userPlans.user_plans.length === 0 ? 0 : page * rowsPerPage + 1,
                                                to: getLabelDisplayedRowsTo(),
                                                count: userPlans.user_plans.length === -1 ? -1 : userPlans.user_plans.length,
                                            })}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <IconButton
                                                size="sm"
                                                color="neutral"
                                                variant="outlined"
                                                disabled={page === 0}
                                                onClick={() => handleChangePage(page - 1)}
                                                sx={{ bgcolor: 'background.surface' }}
                                            >
                                                <KeyboardArrowLeftIcon />
                                            </IconButton>
                                            <IconButton
                                                size="sm"
                                                color="neutral"
                                                variant="outlined"
                                                disabled={
                                                    userPlans.user_plans.length !== -1
                                                        ? page >= Math.ceil(userPlans.user_plans.length / rowsPerPage) - 1
                                                        : false
                                                }
                                                onClick={() => handleChangePage(page + 1)}
                                                sx={{ bgcolor: 'background.surface' }}
                                            >
                                                <KeyboardArrowRightIcon />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </td>
                            </tr>
                            </tfoot>
                        </Table>
                    </Sheet>

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

                    <Button
                        variant="outlined"
                        color="neutral"
                        startDecorator={<Add />}
                        onClick={() => setopenAddPlan(true)}
                    >
                        Add Plan
                    </Button>
                    <Modal open={openAddPlan} onClose={() => setopenAddPlan(false)}>
                        <ModalDialog>
                            <DialogTitle>Add new plan</DialogTitle>
                            <DialogContent>Fill in the information of the plan.</DialogContent>
                            <form
                                onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
                                    event.preventDefault();
                                    setopenAddPlan(false);
                                }}
                            >
                                <Stack spacing={2}>
                                    <FormControl>
                                        <FormLabel>Name</FormLabel>
                                        <Input autoFocus required />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Description</FormLabel>
                                        <Input required />
                                    </FormControl>
                                    <Button type="submit">Submit</Button>
                                </Stack>
                            </form>
                        </ModalDialog>
                    </Modal>

                    <Button
                        variant="outlined"
                        color="danger"
                        endDecorator={<DeleteForever />}
                        onClick={() => setDeletePlan(true)}
                    >
                        Remove Plan
                    </Button>
                    <Modal open={openDeletePlan} onClose={() => setDeletePlan(false)}>
                        <ModalDialog variant="outlined" role="alertdialog">
                            <DialogTitle>
                                <WarningRoundedIcon />
                                Confirmation
                            </DialogTitle>
                            <Divider />
                            <DialogContent>
                                Are you sure you want to remove selected plans?
                            </DialogContent>
                            <DialogActions>
                                <Button variant="solid" color="danger" onClick={() => setDeletePlan(false)}>
                                    Remove plan
                                </Button>
                                <Button variant="plain" color="neutral" onClick={() => setDeletePlan(false)}>
                                    Cancel
                                </Button>
                            </DialogActions>
                        </ModalDialog>
                    </Modal>

                </Layout.Main>
            </Layout.Root>
        </CssVarsProvider>
    );
}

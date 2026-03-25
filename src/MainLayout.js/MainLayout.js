import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Apartment as ApartmentIcon,
  Book as BookIcon,
  BusinessCenter as BusinessCenterIcon,
  CalendarMonth as CalendarMonthIcon,
  EventAvailable as EventAvailableIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  DarkMode as DarkModeIcon,
  Dashboard as DashboardIcon,
  LightMode as LightModeIcon,
  Logout as LogoutIcon,
  NotificationsNone as NotificationsNoneIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Search as SearchIcon,
  AttachMoney as Money
  
} from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Breadcrumbs,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';

import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../theme/AppThemeProvider';
import EventsTicker from '../Components/EventsTicker/EventsTicker';
import apiClient from '../lib/apiClient';
import { EnquiryContext } from '../context/EnquiryContextProvider';

const drawerExpandedWidth = 248;
const drawerCollapsedWidth = 84;

const routeConfig = {
  admin: [
    { path: '/admin-dashboard', label: 'Dashboard', icon: DashboardIcon },
    { path: '/admin-attendance', label: 'Attendance', icon: CalendarMonthIcon },
    { path: '/admin-mark', label: 'Marks', icon: SchoolIcon },
    { path: '/student-management', label: 'Students', icon: SchoolIcon },
    { path: '/staff-management', label: 'Staff', icon: PeopleIcon },
    { path: '/course-management', label: 'Courses', icon: BookIcon },
    { path: '/placement-management', label: 'Placements', icon: BusinessCenterIcon },
    { path: '/company', label: 'Companies', icon: ApartmentIcon },
    { path: '/stureg', label: 'Registrations', icon: PersonIcon },
    { path: '/admin-hr-earnings', label: 'HR Earnings', icon: Money },
    { path: '/course-update', label: 'Schedule', icon: CalendarMonthIcon },
    { path: '/assignments', label: 'Assignments', icon: PersonIcon },
    { path: '/admin-events', label: 'Events', icon: EventAvailableIcon },
  ],
  staff: [
        { path: '/staff-profile', label: 'Dashboard', icon: PersonIcon },
    { path: '/staff-attendance', label: 'Attendance', icon: CalendarMonthIcon },
    { path: '/staff-marks', label: 'Marks', icon: SchoolIcon },
    { path: '/course-staff', label: 'Syllabus', icon: BookIcon },
    { path: '/staff-course-update', label: 'Schedule', icon: CalendarMonthIcon },

  ],
  hr: [
    { path: '/staff-profile', label: 'Dashboard', icon: PersonIcon },
    { path: '/enquiry', label: 'Enquiry', icon: EventAvailableIcon },
    { path: '/my-earnings', label: 'Earnings', icon: Money },
  ],
  student: [
    // { path: '/student', label: 'Dashboard', icon: DashboardIcon },
    { path: '/student-profile', label: 'Dashboard', icon: PersonIcon  },

    { path: '/student-attendance', label: 'Attendance', icon: CalendarMonthIcon },
    { path: '/student-marks', label: 'Marks', icon: SchoolIcon },
  
  ],
};

const shouldRenderShell = (pathname, minimal) => {
  if (minimal) return false;
  return !['/login', '/admin-login'].includes(pathname);
};


const MainLayout = ({ children, minimal = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const {count, handleCount} = useContext(EnquiryContext)

  const location = useLocation();
  const navigate = useNavigate();

  const { role, user, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();

  const currentRole = role || user?.role;
  const navItems = routeConfig[currentRole] || [];
  const showTicker = currentRole === 'staff' || currentRole === 'student';
  const hideSidebar = currentRole === 'staff' || currentRole === 'student';

  const breadcrumbs = location.pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, arr) => ({
      label: segment.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
      path: `/${arr.slice(0, index + 1).join('/')}`,
    }));

  const drawerWidth = sidebarOpen ? drawerExpandedWidth : drawerCollapsedWidth;

  const activePath = useMemo(() => {
    const item = navItems.find((entry) => location.pathname.startsWith(entry.path));
    return item?.path;
  }, [location.pathname, navItems]);

  const handleLogout = () => {
    logout();
    navigate(currentRole === 'admin' ? '/admin-login' : '/login');
  };

  useEffect(() => {
    let isMounted = true;

    const getPriorityLabel = (dateString) => {
      if (!dateString) return 'n/a';
      const followUpDate = new Date(dateString);
      const today = new Date();

      followUpDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((followUpDate - today) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return 'overdue';
      if (diffDays === 0) return 'urgent';
      if (diffDays <= 3) return 'upcoming';
      return 'normal';
    };

    const loadcount = async () => {
      if (currentRole !== 'admin' && currentRole !== 'hr') {
        handleCount(0);
        return;
      }

      try {
        const res = await apiClient.get('/api/enquiry');
        const items = Array.isArray(res.data) ? res.data : [];
        const urgent = items.filter((item) => getPriorityLabel(item.enNextFollowUp) === 'urgent');
        if (isMounted) {
          handleCount(urgent.length);
        }
      } catch (error) {
        if (isMounted) {
          handleCount(0);
        }
      }
    };

    loadcount();
    const intervalId = setInterval(loadcount, 60000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [currentRole]);

  if (!shouldRenderShell(location.pathname, minimal)) {
    return <>{children}</>;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {!hideSidebar && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              transition: 'width 0.2s ease',
              border: 0,
              bgcolor: 'background.paper',
              boxShadow: '0 12px 40px rgba(15, 23, 42, 0.12)',
              overflowX: 'hidden',
            },
          }}
        >
          <Toolbar sx={{ justifyContent: sidebarOpen ? 'space-between' : 'center', px: 2 }}>
              {sidebarOpen ? <Typography variant="h6">STS Panel</Typography> : null}
              <IconButton onClick={() => setSidebarOpen((prev) => !prev)} size="small">
              {sidebarOpen ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
            </IconButton>
          </Toolbar>

          <List sx={{ px: 1 }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePath === item.path;

              return (
                <ListItemButton
                  key={item.path}
                  component={Link}
                  to={item.path}
                  sx={{
                    mb: 1,
                    borderRadius: 2,
                    bgcolor: isActive ? 'primary.main' : 'transparent',
                    color: isActive ? '#fff' : 'text.primary',
                    '&:hover': {
                      bgcolor: isActive ? 'primary.dark' : 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  {sidebarOpen ? <ListItemText primary={item.label} /> : null}
                </ListItemButton>
              );
            })}
          </List>
        </Drawer>
      )}

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar
          elevation={0}
          color="transparent"
          sx={{
            position: 'sticky',
            top: 0,
            borderBottom: '1px solid',
            borderColor: 'divider',
            backdropFilter: 'blur(12px)',
            bgcolor: mode === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(2,6,23,0.75)',
          }}
        >
          <Toolbar sx={{ gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Breadcrumbs aria-label="breadcrumb">
                <Link to="/" style={{ textDecoration: 'none' }}>Home</Link>
                {breadcrumbs.map((crumb) => (
                  <Link key={crumb.path} to={crumb.path} style={{ textDecoration: 'none' }}>
                    {crumb.label}
                  </Link>
                ))}
              </Breadcrumbs>
            </Box>

            <TextField
              size="small"
              placeholder="Search modules"
              sx={{ width: 280, display: { xs: 'none', md: 'block' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <Tooltip title="Toggle theme">
              <IconButton onClick={toggleMode}>{mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}</IconButton>
            </Tooltip>

            <IconButton
              onClick={() => {
                if (currentRole === 'admin' || currentRole === 'hr') {
                  navigate('/enquiry');
                }
              }}
            >
              <Badge
                color="error"
                badgeContent={count}
                showZero={false}
                max={99}
              >
                <NotificationsNoneIcon fontSize="small" />
              </Badge>
            </IconButton>

            <IconButton onClick={(event) => setProfileMenuAnchor(event.currentTarget)}>
              <Avatar sx={{ width: 36, height: 36 }}>
                {(user?.name || user?.username || currentRole || 'U')[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
          </Toolbar>
          {hideSidebar && (
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                px: { xs: 2, md: 3 },
                pb: 1.5,
                overflowX: 'auto',
              }}
            >
              {navItems.map((item) => {
                const isActive = activePath === item.path;
                return (
                  <Box
                    key={item.path}
                    component={Link}
                    to={item.path}
                    sx={{
                      textDecoration: 'none',
                      px: 2,
                      py: 0.75,
                      borderRadius: 999,
                      fontSize: 13,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      color: isActive ? '#fff' : 'text.primary',
                      bgcolor: isActive ? 'primary.main' : 'rgba(15,23,42,0.06)',
                      transition: 'all 160ms ease',
                      '&:hover': {
                        bgcolor: isActive ? 'primary.dark' : 'rgba(15,23,42,0.12)',
                      },
                    }}
                  >
                    {item.label}
                  </Box>
                );
              })}
            </Box>
          )}
        </AppBar>

        <Box
          sx={{
            p: { xs: 2, md: 3 },
            width: '100%',
            pb: showTicker ? { xs: 10, md: 12 } : undefined,
          }}
        >
          <Box
            sx={{
              animation: 'fadeSlideIn 240ms ease-out',
              '@keyframes fadeSlideIn': {
                from: { opacity: 0, transform: 'translateY(8px)' },
                to: { opacity: 1, transform: 'translateY(0px)' },
              },
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>

      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={() => setProfileMenuAnchor(null)}
      >
        <MenuItem disabled>{user?.name || user?.username || 'User'}</MenuItem>
        <MenuItem onClick={handleLogout}>
            <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
      {showTicker ? <EventsTicker /> : null}
    </Box>
  );
};

export default MainLayout;

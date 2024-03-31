import * as React from 'react';
import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HeightIcon from '@mui/icons-material/Height';
import CompressIcon from '@mui/icons-material/Compress';
import ShareLocationIcon from '@mui/icons-material/ShareLocation';
import TerrainIcon from '@mui/icons-material/Terrain';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import WysiwygIcon from '@mui/icons-material/Wysiwyg';
import FenceIcon from '@mui/icons-material/Fence';
import SettingsRemoteIcon from '@mui/icons-material/SettingsRemote';
import CropRotateIcon from '@mui/icons-material/CropRotate';
import ExploreIcon from '@mui/icons-material/Explore';
import DoneIcon from '@mui/icons-material/Done';
import GyroscopeIcon from "../assets/gyroscope.png"
import AccelerometerIcon from "../assets/accelerometer.png"
import AltitudeStabilizationIcon from "../assets/altitude-indicator.png"
import YawIcon from "../assets/yaw.png"
import XYIcon from "../assets/xy.png"
import MotorIcon from "../assets/motor.png"
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import XYZAxisIcon from '../assets/xyzAxis.png'
import ProximityIcon from '../assets/proximity.png'

type Anchor = 'left';

export default function SwipeableReadyDrawer() {
    const [state, setState] = React.useState({
        left: false,
    });

    const toggleDrawer =
        (anchor: Anchor, open: boolean) =>
            (event: React.KeyboardEvent | React.MouseEvent) => {
                if (
                    event &&
                    event.type === 'keydown' &&
                    ((event as React.KeyboardEvent).key === 'Tab' ||
                        (event as React.KeyboardEvent).key === 'Shift')
                ) {
                    return;
                }

                setState({ ...state, [anchor]: open });
            };

    // States of all the ready options
    const [readyButtonStates, setReadyButtonStates] = React.useState({
        'Pre-Arm Check': 'warning',
        'Gyro': 'error',
        'Accelerometer': 'success',
        'Magnetometer': 'warning',
        'Absolute Pressure': 'warning',
        'GPS': 'warning',
        'Angular Rate Control': 'warning',
        'Altitude Stabilization': 'warning',
        'Yaw Position': 'warning',
        'Z Altitude Control': 'warning',
        'X/Y Position Control': 'warning',
        'Motor Outputs/Control': 'warning',
        'RC Receiver': 'warning',
        'AHRS': 'warning',
        'Terrain': 'warning',
        'Battery': 'warning',
        'Propulsion': 'warning',
        'GeoFence': 'warning',
        'Logging': 'warning',
        'Proximity': 'warning'
    });

    

    const iconList = [
        <DoneIcon />,                                           // For 'Pre-Arm Check'
        <img src={GyroscopeIcon} height={24} />,                // For 'Gyro'
        <img src={AccelerometerIcon} height={24} />,            // For 'Accelerometer'
        <ExploreIcon />,                                        // For 'Magnetometer'
        <CompressIcon />,                                       // For 'Absolute Pressure'
        <ShareLocationIcon />,                                  // For 'GPS'
        <CropRotateIcon />,                                     // For 'Angular Rate Control'
        <img src={AltitudeStabilizationIcon} height={24} />,    // For 'Altitude Stabilization'
        <img src={YawIcon} height={24} />,                      // For 'Yaw Position'
        <HeightIcon />,                                         // For 'Z Altitude Control'
        <img src={XYIcon} height={24} />,                       // For 'X/Y Position Control'
        <img src={MotorIcon} height={24} />,                    // For 'Motor Outputs/Control'
        <SettingsRemoteIcon />,                                 // For 'RC Receiver'
        <img src={XYZAxisIcon} height={24} />,                  // For 'AHRS'
        <TerrainIcon />,                                        // For 'Terrain'
        <BatteryChargingFullIcon />,                            // For 'Battery'
        <RocketLaunchIcon />,                                   // For 'Propulsion'
        <FenceIcon />,                                          // For 'GeoFence'
        <WysiwygIcon />,                                        // For 'Logging'
        <img src={ProximityIcon} height={24} />,                // For 'Proximity'
    ];

    const getButtonStyle = (state: string) => {
        let baseStyle;
        switch (state) {
            case 'warning':
                baseStyle = { border: '1px solid #ffa500', borderRadius: '8px', margin: '2px', backgroundColor: 'rgba(255, 165, 0, 0.15)' };
                break;
            case 'success':
                baseStyle = { border: '1px solid #008001', borderRadius: '8px', margin: '2px', backgroundColor: 'rgba(0, 128, 1, 0.15)' };
                break;
            case 'error':
                baseStyle = { border: '1px solid #ff0000', borderRadius: '8px', margin: '2px', backgroundColor: 'rgba(255, 0, 0, 0.15)' };
                break;
            default:
                baseStyle = { border: '1px solid #ffffff', borderRadius: '8px', margin: '2px', backgroundColor: 'rgba(255, 0, 0, 0.15)' };
        }
    
        let hoverStyle;
        switch (state) {
            case 'warning':
                hoverStyle = {
                    '&:hover': {
                        backgroundColor: 'rgba(255, 165, 0, 0.3)',
                    }
                };
                break;
            case 'success':
                hoverStyle = {
                    '&:hover': {
                        backgroundColor: 'rgba(0, 128, 1, 0.3)',
                    }
                };
                break;
            case 'error':
                hoverStyle = {
                    '&:hover': {
                        backgroundColor: 'rgba(255, 0, 0, 0.3)',
                    }
                };
                break;
            default:
                hoverStyle = {};
        }
    
        return { ...baseStyle, ...hoverStyle };
    };

    const list = (anchor: Anchor) => (
        <Box
            sx={{ width: 250 }}
            role="presentation"
        >
         <List sx={{backgroundColor: "black"}}>
            {Object.entries(readyButtonStates).map(([component, state], index) => (
                <ListItem key={component} disablePadding>
                    <ListItemButton sx={getButtonStyle(state)} disableTouchRipple>
                        <ListItemIcon>
                            {iconList[index]}
                        </ListItemIcon>
                        <ListItemText primary={component} />
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
        </Box>
    );

    return (
        <div>
            {(['left'] as const).map((anchor) => (
                <React.Fragment key={anchor}>
                    <Button variant="contained" color="warning" onClick={toggleDrawer(anchor, true)}>Ready</Button>
                    <SwipeableDrawer
                        anchor={anchor}
                        open={state[anchor]}
                        onClose={toggleDrawer(anchor, false)}
                        onOpen={toggleDrawer(anchor, true)}
                    >
                        {list(anchor)}
                    </SwipeableDrawer>
                </React.Fragment>
            ))}
        </div>
    );
}
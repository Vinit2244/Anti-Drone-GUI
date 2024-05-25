import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import { CommLinks } from "./CommLinks";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { RFDSettings } from "./RFDSettings";
import { FODSettings } from "./FODSettings";
import { NoKillZones } from "./NoKillZones";
import FitScreenIcon from '@mui/icons-material/FitScreen';
import Fab from '@mui/material/Fab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      style={{
        width: "100%",
        padding: "10px 10px 50px 10px",
        overflowY: "scroll",
      }}
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

export function SettingsModalContent({ close, toggleFullScreenMap }: { close: () => void; toggleFullScreenMap: () => void }) {
  const [value, setValue] = useState(0);
  const [updating, setUpdating] = useState(false);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Card
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "75%",
        height: "75%",
      }}
      variant="outlined"
    >
      <CardHeader
        sx={{ textAlign: "center" }}
        title="Settings"
        action={
          <IconButton onClick={close}>
            <Close />
          </IconButton>
        }
      />
      <CardContent sx={{ height: "100%" }}>
        <Box
          sx={{
            flexGrow: 1,
            bgcolor: "background.paper",
            display: "flex",
            height: "100%",
          }}
        >
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={value}
            onChange={handleChange}
            aria-label="Vertical tabs example"
            sx={{ borderRight: 1, borderColor: "divider" }}
          >
            <Tab label="Connection" {...a11yProps(0)} />
            <Tab label="RFD" {...a11yProps(1)} />
            <Tab label="FOD" {...a11yProps(1)} />
            <Tab label="No Kill Zones" {...a11yProps(1)} />
            <Tab label="Map Settings" {...a11yProps(1)} />
          </Tabs>
          <TabPanel value={value} index={0}>
            <Accordion defaultExpanded sx={{ width: "100%" }}>
              <AccordionSummary defaultChecked expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Comm Links</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <CommLinks updating={updating} setUpdating={setUpdating} />
              </AccordionDetails>
            </Accordion>
          </TabPanel>
          <TabPanel value={value} index={1}>
            <RFDSettings />
          </TabPanel>
          <TabPanel value={value} index={2}>
            <FODSettings />
          </TabPanel>
          <TabPanel value={value} index={3}>
            <NoKillZones updating={updating} setUpdating={setUpdating} />
          </TabPanel>
          <TabPanel value={value} index={4}>
            <Box sx={{ '& > :not(style)': { m: 1 } }}>
              <Fab variant="extended" onClick={toggleFullScreenMap} style={{ backgroundColor: "#c0c0c0" }}>
                <FitScreenIcon sx={{ mr: 1 }} />
                Change Map Mode
              </Fab>
            </Box>
            {/* <button onClick={toggleFullScreenMap}>
                 Change Mode
            </button> */}
          </TabPanel>
        </Box>
      </CardContent>
    </Card>
  );
}

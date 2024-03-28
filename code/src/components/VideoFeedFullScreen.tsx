import topography from "../assets/topography.jpg"
import Button from '@mui/material/Button';


export default function VidoeFeedButtonFullScreen({cName, handleClick} : {cName: string; handleClick: () => void}) {

    return (
      <div className={cName}>
        <img
          src={topography}
          alt="animated icon"
          className="videoFeedShownFull" // Assuming this class applies proper styling
        />
        <Button className="videoFeedButtonToShowMap" variant="contained" onClick={handleClick} color="inherit" size="large">
          Show Map
        </Button>
      </div>
    );
}
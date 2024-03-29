import topography from "../assets/topography.jpg"
import Tooltip from '@mui/material/Tooltip';
export default function VidoeFeedButton({cName, handleClick} : {cName: string; handleClick: () => void}) {

    return (
        <Tooltip title="Click to View in full screen" placement="bottom-end">
        <button
            className={cName}

            onClick={handleClick} // Add your click event handler function
        >
            <img
                src={topography}
                style={{
                    width: "200px",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "50%",
                }}
            />
        </button>
        </Tooltip>
    );
}


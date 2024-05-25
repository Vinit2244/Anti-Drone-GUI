

// import topography from "../assets/topography.jpg"
import WorldMap from '../assets/world_map.jpeg'
import Tooltip from '@mui/material/Tooltip';
import  { useEffect, useRef } from "react";
import { MapControlProvider } from "../contexts/MapControlContext";
import Map from "./Map";

export default function VidoeFeedButtonFullScreen({ cName, handleClick }: { cName: string; handleClick: () => void }) {

  const videoRef = useRef<HTMLVideoElement>(null);


  useEffect(() => {
    if ( videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    const getDeviceId = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log("Video Devices:", devices);
      } catch (error) {
        console.error('Error enumerating devices:', error);
      }
    };

    getDeviceId();
  }, );

  useEffect(() => {

      const constraints = {
        video: true
      };

      const onSuccess = (stream: MediaStream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      };

      const onError = (err: any) => {
        console.error("Error accessing camera:", err);
      };

      navigator.mediaDevices.getUserMedia(constraints)
        .then(onSuccess)
        .catch(onError);

  }, );


  return (
    <MapControlProvider>
    <div className={cName}>

      <video
              ref={videoRef}
              autoPlay
              muted
              className="videoFeedShownFull"
              draggable={false}
              loop
              controls={false} // Hides the default video controls
            />
      <Tooltip title="Click to View Map in full screen" placement="bottom-end">
      <button className="videoFeedButtonToShowMap" onClick={handleClick} color="inherit" style={{borderRadius: "50%"}}>

        <Map
        toggleTheme={() => {}}
        cName="mapWrapper-circle"
        toggleFullScreenMap={() => {}}
        />

      </button>
      </Tooltip>
    </div>
  </MapControlProvider>
    );
}

import Tooltip from '@mui/material/Tooltip';
import {useEffect, useRef } from "react";

export default function VidoeFeedButton({cName, handleClick} : {cName: string; handleClick: () => void}) {
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
        <Tooltip title="Click to View VideoFeed in full screen" placement="bottom-end">
        <button
            className={cName}

            onClick={handleClick} // Add your click event handler function
        >

                <video
              ref={videoRef}
              autoPlay
              muted
            //   className="videoFeedShownFull"
              draggable={false}
              loop
              controls={false} // Hides the default video controls
            //   style={{
            //     width: "200px",
            //     height: "200px",
            //     objectFit: "cover",
            //     borderRadius: "50%",
            // }}
            />
        </button>
        </Tooltip>
    );
}


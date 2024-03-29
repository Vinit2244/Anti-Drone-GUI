import topography from "../assets/topography.jpg"
import WorldMap from '../assets/world_map.jpeg'

export default function VidoeFeedButtonFullScreen({ cName, handleClick }: { cName: string; handleClick: () => void }) {

  return (
    <div className={cName}>
      <img
        src={topography}
        alt="animated icon"
        className="videoFeedShownFull"
      />
      <button className="videoFeedButtonToShowMap" onClick={handleClick} color="inherit" style={{borderRadius: "50%"}}>
        <img
          src={WorldMap}
          style={{
            width: "200px",
            height: "200px",
            objectFit: "cover",
            borderRadius: "50%",
          }}
          alt="animated icon"
        />
      </button>
    </div>
  );
}
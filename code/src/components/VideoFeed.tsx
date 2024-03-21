import topography from "../assets/topography.jpeg"

export default function VidoeFeedButton({cName} : {cName: string}) {
    // Handle click event
    const handleClick = () => {
        // Do something when the image is clicked
        console.log("Image clicked!");
    };
    console.log({cName})
    return (
        <button
            className={cName}
            
            onClick={handleClick} // Add your click event handler function
        >
            <img
                src={topography}
                style={{
                    borderRadius: "50%",
                    width: "200px",
                    height: "200px",
                    objectFit: "cover",
                }}
                alt="animated icon"
            />
        </button>
    );
}
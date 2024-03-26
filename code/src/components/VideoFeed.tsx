import topography from "../assets/topography.jpeg"

export default function VidoeFeedButton({cName, handleClick} : {cName: string; handleClick: () => void}) {

    return (
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
                alt="animated icon"
            />
        </button>
    );
}


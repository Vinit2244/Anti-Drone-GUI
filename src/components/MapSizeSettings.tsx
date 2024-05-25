import { useState } from "react";
import "../App.css";

interface MapSizeSettingsProps {
    onWidthChange: (width: number) => void;
}

export default function ({
    onWidthChange,
}: {
    onWidthChange: (width: number) => void;
}): JSX.Element {
    const [width, setWidth] = useState<number>(1);

    // Function to handle the change in checkbox value
    const handleWidthChange = (value: number) => {
        setWidth(value);
        // Call the onWidthChange function passed as prop
        onWidthChange(value);
    };

    return (
        <div>
            <label>
                <input
                    type="checkbox"
                    checked={width === 1}
                    onChange={() => handleWidthChange(1)}
                />
                Left Side
            </label>
            <label>
                <input
                    type="checkbox"
                    checked={width === 2}
                    onChange={() => handleWidthChange(2)}
                />
                Full Screen
            </label>
        </div>
    );
}

import { Slider, Typography } from "@mui/material";
import { useRef, useState } from "react";
// import { useState } from "react";

export default function SliderButton({
  railText,
  trackText,
  onSubmit,
  threshold = 85,
  disabled = false,
}: {
  railText: string;
  trackText: string;
  onSubmit?: () => void;
  threshold?: number;
  disabled?: boolean;
}) {
  const [value, setValue] = useState(10);
  const sliderRef = useRef(value);
  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    const newVal = Math.max(Math.min(newValue as number, 90), 10);
    setValue(newVal);
    sliderRef.current = newVal;
  };

  return (
    <Slider
      disabled={disabled}
      slotProps={{
        thumb: {
          onMouseDown: (e) => {
            document.addEventListener(
              "mouseup",
              () => {
                const normalisedVal = ((sliderRef.current - 10) * 100) / 80;
                if (normalisedVal > threshold) onSubmit?.();
                setValue(() => {
                  sliderRef.current = 10;
                  return 10;
                });
              },
              { once: true }
            );
          },
          style: {
            width: "10%",
            borderRadius: "16px",
            height: "50px",
          },
        },
        track: {
          style: {
            // width: "200px",
            height: "50px",
            borderRadius: "16px",
          },
          children: (
            <Typography
              style={{
                height: "100%",
                color: "white",
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              {trackText}
            </Typography>
          ),
        },
        rail: {
          style: {
            // width: "200px",
            height: "60px",
            borderRadius: "16px",
          },
          children: (
            <Typography
              style={{
                height: "100%",
                color: "black",
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {railText}
            </Typography>
          ),
        },
      }}
      value={value}
      onChange={handleSliderChange}
      sx={{ width: "50%", marginTop: "5px" }}
    />
  );
}

// export function SliderButton_Kill({
//   railText,
//   trackText,
//   onSubmit,
//   threshold = 85,
//   disabled = false,
// }: {
//   railText: string;
//   trackText: string;
//   onSubmit?: () => void;
//   threshold?: number;
//   disabled?: boolean;
// }) {
//   const [value, setValue] = useState(0);

//   const handleSliderChange = (event: Event, newValue: number | number[]) => {
//     setValue(newValue as number);
//     if (newValue === 100) {
//       onSubmit?.(); // Invoke onSubmit callback when slider is slid completely
//     }
//   };

//   return (
//     <div style={{ width: "10%", marginTop: "5px", padding: "0 10px" }}>
//       <Typography gutterBottom>{trackText}</Typography>
//       <Slider
//         disabled={disabled}
//         value={value}
//         onChange={handleSliderChange}
//         sx={{ width: "100%" }}
//       />
//       <Typography gutterBottom>{railText}</Typography>
//     </div>
//   );
// }

# Anti-Drone System GUI

This project aims to enhance the Graphical User Interface (GUI) for an Anti-Drone System. The primary objective is to provide an intuitive and user-friendly interface tailored for army personnel, ensuring usability for individuals with limited educational backgrounds. The GUI is developed using Rust and Tauri, and it incorporates various functionalities to improve the efficacy of the Anti-Drone System.

## Features

1. **Friendly Drone Tracking**: The user can view the friendly drone's location, which serves as the central point for the map display. The map will only extend to a radius of 500 meters from the drone's current position.

2. **Friendly Drone Pre-flight Status**: Various parameters of the drone are processed to evaluate if the drone is in a suitable status to fly. A colored indicator at the top of the screen provides a quick indicator of the status.

3. **Friendly Drone Control**: The user can send multiple commands to the drone to carry out different operations, such as abort, follow drone, no-kill follow, scan, return to home (RTH), and send launch.

4. **Friendly Drone Status Monitoring**: The status of friendly drones is displayed on the screen, including details such as signal strength, battery level, and ammunition.

5. **Drone Trajectory**: The drone's path is highlighted using a line following the drone. The line color denotes the altitude, with light green representing 20-80 meters and dark green representing 80-200 meters.

6. **Enemy Drone Position**: Enemy drone locations are shown on the map, represented by a different color (yellow) to differentiate them from friendly drones.

7. **User Configuration**: Settings are provided to the operator to switch between having a grid and not. The operator can also choose to add no-kill zones to the map.

8. **Threat Response and Engagement**: The user can send a 'kill' command to initiate anti-drone maneuvers. However, if the enemy drone is within a no-kill zone, the user is not allowed to kill it.

9. **Live Drone Video Feed**: The user has the option to view the live video feed from the drone.

10. **Improved UI Layout**: The user interface has been enhanced to improve user experience, with buttons relocated for better accessibility and increased map size for better visibility.

11. **Distance Legend**: The user can view the distance between two drones on the map.

12. **Switch Themes**: The user can switch between light and dark modes for improved visibility.

13. **Time to Kill Indicator**: A popup indicates to the user how much time is left to kill an enemy drone, based on a pre-defined timing, ensuring swift neutralization of rogue drones and minimizing damage.

14. **Grid Toggle**: The user can toggle the visibility of grid lines on the map.

15. **Map Mode Change**: The user can change the map mode from the settings to either full-screen or keep it in the default mode.

16. **Slide to Confirm**: A slide-to-confirm (2-step verification) is required before sending a launch command and before killing a drone.

17. **Kill Zones Addition**: The user can add new kill zones from the settings.

18. **No Kill Possible in Kill Zones**: If the user tries to kill a drone within a kill zone, the system will prompt the user that it is not allowed.

## Compatibility

The Anti-Drone System GUI works on Linux and macOS.

## Usage

The Anti-Drone System GUI is designed for use by army personnel and the team at Arka Aerospace. Army personnel will use the system in various scenarios, such as deploying and controlling drones for reconnaissance or surveillance missions, while the Arka Aerospace team will utilize the system primarily for development, testing, and maintenance purposes.

Please refer to the documentation for detailed instructions on how to install and configure the system.
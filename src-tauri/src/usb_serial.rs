use std::io;

pub fn get_mavlink_serial_port() -> Result<String, serialport::Error> {
    let ports = serialport::available_ports()?;
    for port in ports {
        match port.port_type {
            serialport::SerialPortType::UsbPort(usb_port_info) => {
                match (usb_port_info.vid, usb_port_info.pid) {
                    (1027, 24577) => {
                        return Ok(format!("serial:{}:57600", port.port_name));
                    }
                    _ => {}
                }
            }
            _ => {}
        }
    }
    return Err(serialport::Error::new(
        serialport::ErrorKind::Io(io::ErrorKind::NotFound),
        "No known serial devices found",
    ));
}

#[tauri::command]
pub async fn get_usb_ports() -> Result<Vec<(u16, u16, String)>, String> {
    match serialport::available_ports() {
        Ok(ports) => Ok(ports
            .iter()
            .filter_map(|x| match &x.port_type {
                serialport::SerialPortType::UsbPort(usb_port_info) => {
                    Some((usb_port_info.vid, usb_port_info.pid, x.port_name.clone()))
                }
                _ => None,
            })
            .collect()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command(async)]
pub fn get_usb_path(vid: u16, pid: u16) -> Option<String> {
    match serialport::available_ports() {
        Err(_) => None,
        Ok(ports) => {
            for port in ports {
                match port.port_type {
                    serialport::SerialPortType::UsbPort(usb_port_info) => {
                        if usb_port_info.vid == vid && usb_port_info.pid == pid {
                            return Some(port.port_name);
                        }
                    }
                    _ => {}
                }
            }
            None
        }
    }
}

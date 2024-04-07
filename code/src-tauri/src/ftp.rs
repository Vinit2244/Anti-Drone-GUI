// use super::messages;
// use mavlink::ardupilotmega::MavMessage;
// use std::{
//     error::Error,
//     fs::File,
//     io::{Seek, Write},
//     ops::Range,
//     path::Path,
//     sync::{Arc, MutexGuard},
//     time::{Duration, SystemTime},
// };

// const MAX_RETRIES: u64 = 5;
// const TIMEOUT_DURATION: Duration = Duration::from_millis(2000);

#[derive(Debug)]
pub enum FileSystemEntry {
    File {
        path: std::path::PathBuf,
        file_size: u64,
    },
    Folder {
        path: std::path::PathBuf,
    },
    Skip,
}

#[derive(Debug)]
pub struct FtpPayload {
    pub seq_number: u16,
    pub session: u8,
    pub opcode: u8,
    pub size: u8,
    pub req_opcode: u8,
    pub burst_complete: u8,
    pub padding: u8,
    pub offset: u32,
    pub data: [u8; 239],
}

impl Default for FtpPayload {
    fn default() -> Self {
        FtpPayload {
            seq_number: 0,
            session: 0,
            opcode: 0,
            size: 0,
            req_opcode: 0,
            burst_complete: 0,
            padding: 0,
            offset: 0,
            data: [0; 239],
        }
    }
}

impl FtpPayload {
    pub fn as_bytes(&self) -> [u8; 251] {
        let mut payload = [0_u8; 251];
        payload[0..=1].copy_from_slice(&self.seq_number.to_le_bytes());
        payload[2] = self.session;
        payload[3] = self.opcode;
        payload[4] = self.size;
        payload[5] = self.req_opcode;
        payload[6] = self.burst_complete;
        payload[7] = self.padding;
        payload[8..=11].copy_from_slice(&self.offset.to_le_bytes());
        payload[12..251].copy_from_slice(&self.data);

        payload
    }

    pub fn from_bytes(payload: &[u8; 251]) -> Self {
        let mut ftp_payload = FtpPayload::default();
        ftp_payload.seq_number = u16::from_le_bytes(payload[0..=1].try_into().unwrap());
        ftp_payload.session = payload[2];
        ftp_payload.opcode = payload[3];
        ftp_payload.size = payload[4];
        ftp_payload.req_opcode = payload[5];
        ftp_payload.burst_complete = payload[6];
        ftp_payload.padding = payload[7];
        ftp_payload.offset = u32::from_le_bytes(payload[8..=11].try_into().unwrap());
        ftp_payload.data.copy_from_slice(&payload[12..251]);

        ftp_payload
    }

    pub fn terminate_session_command(session: u8) -> Self {
        let mut ftp_payload = FtpPayload::default();
        ftp_payload.session = session;
        ftp_payload.opcode = 1;
        ftp_payload
    }

    pub fn create_file_command(path: &std::path::Path) -> Self {
        let mut ftp_payload = FtpPayload::default();
        let path_string = path.to_string_lossy();
        let byte_path = path_string.as_bytes();
        ftp_payload.size = byte_path.len() as u8;
        ftp_payload.opcode = 6;

        ftp_payload.data[0..byte_path.len()].copy_from_slice(&byte_path);

        ftp_payload
    }

    pub fn list_file_command(path: &std::path::Path, offset: u32, seq_number: u16) -> Self {
        let mut ftp_payload = FtpPayload::default();
        let path_string = path.to_string_lossy();
        let byte_path = path_string.as_bytes();
        ftp_payload.size = byte_path.len() as u8;

        ftp_payload.offset = offset;
        ftp_payload.seq_number = seq_number;
        ftp_payload.opcode = 3;

        ftp_payload.data[0..byte_path.len()].copy_from_slice(&byte_path);

        ftp_payload
    }

    pub fn write_file_command_partial(seq_number: u16, offset: u32, session: u8) -> Self {
        let mut ftp_payload = FtpPayload::default();
        ftp_payload.offset = offset;
        ftp_payload.seq_number = seq_number;
        ftp_payload.opcode = 7;
        ftp_payload.session = session;

        ftp_payload
    }

    pub fn open_file_read_command(path: &std::path::Path) -> Self {
        let mut ftp_payload = FtpPayload::default();
        let path_string = path.to_string_lossy();
        let byte_path = path_string.as_bytes();
        ftp_payload.size = byte_path.len() as u8;
        ftp_payload.opcode = 4;

        ftp_payload.data[0..byte_path.len()].copy_from_slice(&byte_path);

        ftp_payload
    }

    pub fn read_command(session: u8, size: u8, offset: u32, seq_number: u16) -> Self {
        let mut ftp_payload = FtpPayload::default();
        ftp_payload.seq_number = seq_number;
        ftp_payload.size = size;
        ftp_payload.offset = offset;
        ftp_payload.session = session;
        ftp_payload.opcode = 5;

        ftp_payload
    }

    pub fn burst_read_command(session: u8, offset: u32, burst_length: u32) -> Self {
        let mut ftp_payload = FtpPayload::default();
        ftp_payload.session = session;
        ftp_payload.offset = offset;
        ftp_payload.size = 4;
        ftp_payload.opcode = 15;
        ftp_payload.data[0..4].copy_from_slice(&burst_length.to_le_bytes());

        ftp_payload
    }

    pub fn check_eof(&self) -> bool {
        self.is_nack() && self.data[0] == 6
    }

    pub fn is_nack(&self) -> bool {
        self.opcode == 129
    }

    pub fn parse_list_response_payload(
        &self,
        path: &std::path::Path,
    ) -> Result<Vec<FileSystemEntry>, Box<dyn std::error::Error>> {
        let candidate_entries: Vec<Option<FileSystemEntry>> = self
            .data
            .split(|x| x == &0_u8)
            .map(|entry| {
                if entry.is_empty() {
                    return None;
                }

                let entry = match std::str::from_utf8(entry) {
                    Ok(s) => s,
                    Err(_) => {
                        return None;
                    }
                };
                let mut stripped = entry.chars();
                match stripped.next() {
                    Some('F') => {
                        let mut file_and_size = stripped.as_str().split('\t');
                        let file_name = file_and_size.next();
                        let file_size = file_and_size.next();
                        match (file_name, file_size) {
                            (Some(name), Some(size_str)) => match size_str.parse::<u64>() {
                                Ok(size) => {
                                    let mut path = path.to_path_buf();
                                    path.push(name);
                                    Some(FileSystemEntry::File {
                                        path: path,
                                        file_size: size,
                                    })
                                }
                                _ => None,
                            },
                            _ => None,
                        }
                    }
                    Some('D') => {
                        let name = stripped.as_str();
                        let mut path = path.to_path_buf();
                        path.push(name);
                        Some(FileSystemEntry::Folder { path: path })
                    }
                    Some('S') => Some(FileSystemEntry::Skip),
                    _ => None,
                }
            })
            .collect();

        Ok(candidate_entries.into_iter().filter_map(|x| x).collect())
    }
}

// pub fn timed_get_response(
//     vehicle: &Arc<Box<dyn mavlink::MavConnection<MavMessage> + Send + Sync>>,
//     reader: &mut MutexGuard<
//         '_,
//         bus::BusReader<(
//             mavlink::MavHeader,
//             mavlink::ardupilotmega::FILE_TRANSFER_PROTOCOL_DATA,
//         )>,
//     >,
//     message: &MavMessage,
//     verify: Box<
//         dyn Fn(
//             &(
//                 mavlink::MavHeader,
//                 mavlink::ardupilotmega::FILE_TRANSFER_PROTOCOL_DATA,
//             ),
//         ) -> bool,
//     >,
// ) -> Option<(
//     mavlink::MavHeader,
//     mavlink::ardupilotmega::FILE_TRANSFER_PROTOCOL_DATA,
// )> {
//     for _ in 0..MAX_RETRIES {
//         vehicle.send_default(message).unwrap();
//         let timer_start = SystemTime::now();
//         while SystemTime::now().duration_since(timer_start).unwrap() < TIMEOUT_DURATION {
//             match reader.try_recv() {
//                 Err(std::sync::mpsc::TryRecvError::Empty) => {}
//                 Ok(received) => {
//                     if verify(&received) {
//                         return Some(received);
//                     }
//                 }
//                 _ => {
//                     return None;
//                 }
//             }
//         }
//     }
//     None
// }

// pub fn req_op_code_seq_number_verifier(
//     op_code: u8,
//     seq_number: u16,
// ) -> Box<
//     dyn Fn(
//         &(
//             mavlink::MavHeader,
//             mavlink::ardupilotmega::FILE_TRANSFER_PROTOCOL_DATA,
//         ),
//     ) -> bool,
// > {
//     Box::new(
//         move |data: &(
//             mavlink::MavHeader,
//             mavlink::ardupilotmega::FILE_TRANSFER_PROTOCOL_DATA,
//         )|
//               -> bool {
//             let ftp_payload = FtpPayload::from_bytes(&data.1.payload);
//             return ftp_payload.req_opcode == op_code && ftp_payload.seq_number == seq_number;
//         },
//     )
// }

// pub fn read_response_verifier(
//     seq_number: u16,
//     session: u8,
// ) -> Box<
//     dyn Fn(
//         &(
//             mavlink::MavHeader,
//             mavlink::ardupilotmega::FILE_TRANSFER_PROTOCOL_DATA,
//         ),
//     ) -> bool,
// > {
//     Box::new(
//         move |data: &(
//             mavlink::MavHeader,
//             mavlink::ardupilotmega::FILE_TRANSFER_PROTOCOL_DATA,
//         )|
//               -> bool {
//             let ftp_payload = FtpPayload::from_bytes(&data.1.payload);
//             return ftp_payload.req_opcode == 5
//                 && ftp_payload.seq_number == seq_number
//                 && ftp_payload.session == session;
//         },
//     )
// }

// pub fn open_file_read(
//     vehicle: &Arc<Box<dyn mavlink::MavConnection<MavMessage> + Send + Sync>>,
//     message_reader: &mut MutexGuard<
//         '_,
//         bus::BusReader<(
//             mavlink::MavHeader,
//             mavlink::ardupilotmega::FILE_TRANSFER_PROTOCOL_DATA,
//         )>,
//     >,
//     path: &std::path::Path,
// ) -> Result<(u8, u32), Box<dyn std::error::Error>> {
//     let ftp_payload = FtpPayload::open_file_read_command(path);
//     let message = messages::ftp_message(0, 0, 0, &ftp_payload);
//     let response = timed_get_response(
//         vehicle,
//         message_reader,
//         &message,
//         req_op_code_seq_number_verifier(ftp_payload.opcode, ftp_payload.seq_number + 1),
//     );
//     match response {
//         Some((_, payload)) => {
//             let ftp_payload = FtpPayload::from_bytes(&payload.payload);
//             if ftp_payload.is_nack() {
//                 Err(format!("ftp error code: {}", ftp_payload.data[0]).into())
//             } else {
//                 let mut size_bytes = [0_u8; 4];
//                 size_bytes.copy_from_slice(&ftp_payload.data[0..4]);
//                 let size = u32::from_le_bytes(size_bytes);
//                 Ok((ftp_payload.session, size))
//             }
//         }
//         None => Err("No valid response".into()),
//     }
// }

// pub fn read_file_into_path(
//     vehicle: &Arc<Box<dyn mavlink::MavConnection<MavMessage> + Send + Sync>>,
//     message_reader: &mut MutexGuard<
//         '_,
//         bus::BusReader<(
//             mavlink::MavHeader,
//             mavlink::ardupilotmega::FILE_TRANSFER_PROTOCOL_DATA,
//         )>,
//     >,
//     drone_file_path: &std::path::Path,
//     path: &std::path::Path,
// ) -> Result<(), Box<dyn Error>> {
//     let mut file = File::create(path)?;
//     let (session, file_size) = open_file_read(vehicle, message_reader, drone_file_path)?;

//     let status = read_file_burst(vehicle, message_reader, session, &mut file, file_size);

//     vehicle
//         .send_default(&messages::ftp_message(
//             0,
//             0,
//             0,
//             &FtpPayload::terminate_session_command(session),
//         ))
//         .unwrap();

//     status
// }

// pub fn read_file_burst(
//     vehicle: &Arc<Box<dyn mavlink::MavConnection<MavMessage> + Send + Sync>>,
//     message_reader: &mut MutexGuard<
//         '_,
//         bus::BusReader<(
//             mavlink::MavHeader,
//             mavlink::ardupilotmega::FILE_TRANSFER_PROTOCOL_DATA,
//         )>,
//     >,
//     session: u8,
//     data_writer: &mut File,
//     file_size: u32,
// ) -> Result<(), Box<dyn Error>> {
//     let mut missing_ranges: Vec<Range<u32>> = vec![0..file_size];
//     let mut seq_number: u16 = 0;
//     while !missing_ranges.is_empty() {
//         let fill_this_range = missing_ranges.pop().unwrap();
//         // println!("filling {:?}", fill_this_range);

//         if data_writer.stream_position()? != fill_this_range.start as u64 {
//             data_writer.seek(std::io::SeekFrom::Start(fill_this_range.start as u64))?;
//         }

//         let mut chunk_size = fill_this_range.end - fill_this_range.start;
//         if chunk_size > 239 {
//             let new_start = fill_this_range.start + 239;
//             missing_ranges.push(new_start..fill_this_range.end);
//             chunk_size = 239;
//         }
//         let chunk_size = chunk_size as u8;
//         let ftp_payload =
//             FtpPayload::read_command(session, chunk_size, fill_this_range.start, seq_number);
//         let message = messages::ftp_message(0, 0, 0, &ftp_payload);
//         let response = timed_get_response(
//             vehicle,
//             message_reader,
//             &message,
//             read_response_verifier(seq_number + 1, session),
//         );
//         match response {
//             None => {
//                 return Err("no valid response".into());
//             }
//             Some((_, data)) => {
//                 let ftp_payload = FtpPayload::from_bytes(&data.payload);
//                 seq_number += 2;
//                 if ftp_payload.check_eof() {
//                     continue;
//                 }
//                 if ftp_payload.is_nack() {
//                     return Err("got Nack'd".into());
//                 }
//                 data_writer.write_all(&ftp_payload.data[0..(ftp_payload.size as usize)])?;
//                 if ftp_payload.size < chunk_size {
//                     missing_ranges.push(ftp_payload.size as u32..chunk_size as u32)
//                 }
//             }
//         }
//     }

//     Ok(())
// }

// pub fn burst_read(
//     vehicle: &Arc<Box<dyn mavlink::MavConnection<MavMessage> + Send + Sync>>,
//     message_reader: &mut MutexGuard<
//         '_,
//         bus::BusReader<(
//             mavlink::MavHeader,
//             mavlink::ardupilotmega::FILE_TRANSFER_PROTOCOL_DATA,
//         )>,
//     >,
//     session: u8,
//     data_writer: &mut File,
//     offset: u32,
//     burst_size: u32,
// ) -> Result<Vec<Range<u32>>, Box<dyn Error>> {
//     let mut missing_ranges = Vec::<Range<u32>>::new();
//     let ftp_payload = FtpPayload::burst_read_command(session, offset, burst_size);
//     let message = &messages::ftp_message(0, 0, 0, &ftp_payload);

//     match timed_get_response(
//         vehicle,
//         message_reader,
//         message,
//         req_op_code_seq_number_verifier(15, 1),
//     ) {
//         Some((_, data)) => {
//             let ftp_payload = FtpPayload::from_bytes(&data.payload);
//             if ftp_payload.is_nack() {
//                 return Err("Burst Read Nack'd".into());
//             }
//         }
//         None => {
//             return Err("No valid response".into());
//         }
//     };
//     let mut burst_progress = 0_u32;
//     let mut burst_complete = false;
//     let mut seq_number = 2_u16;
//     while !burst_complete {
//         let timer_start = SystemTime::now();
//         let mut received_successfully = false;
//         while SystemTime::now().duration_since(timer_start).unwrap() < TIMEOUT_DURATION
//             && !received_successfully
//         {
//             match message_reader.try_recv() {
//                 Err(std::sync::mpsc::TryRecvError::Empty) => {}
//                 Ok((_, data)) => {
//                     let ftp_payload = FtpPayload::from_bytes(&data.payload);
//                     if ftp_payload.session != session
//                         || ftp_payload.seq_number != seq_number
//                         || ftp_payload.req_opcode != 15
//                     {
//                         continue;
//                     }
//                     if ftp_payload.check_eof() {
//                         received_successfully = true;
//                         burst_complete = true;
//                         continue;
//                     }
//                     if ftp_payload.is_nack() {
//                         return Err("Nack'd".into());
//                     }
//                     received_successfully = true;
//                     // println!("{:?}", ftp_payload);
//                     let current_offset = offset + burst_progress;
//                     if ftp_payload.offset < current_offset {
//                         // println!(
//                         //     "before offset received: current_offset={}, offset_received={}",
//                         //     current_offset, ftp_payload.offset
//                         // );
//                         burst_progress = ftp_payload.offset - offset;
//                         data_writer.seek(std::io::SeekFrom::Start(ftp_payload.offset as u64))?;
//                     } else if ftp_payload.offset > current_offset {
//                         // println!(
//                         //     "after offset received: current_offset={}, offset_received={}",
//                         //     current_offset, ftp_payload.offset
//                         // );
//                         burst_progress = ftp_payload.offset - offset;
//                         // println!("new progress {}", burst_progress);

//                         missing_ranges.push(current_offset..ftp_payload.offset);
//                         // println!("pushing {:?}", current_offset..ftp_payload.offset);
//                         let diff = (ftp_payload.offset - current_offset) as usize;
//                         let filler = vec![0_u8; diff];
//                         data_writer.write_all(&filler)?;
//                     }
//                     data_writer.write_all(&ftp_payload.data[0..(ftp_payload.size as usize)])?;
//                     burst_progress += ftp_payload.size as u32;
//                     // println!("new progress {}", burst_progress);
//                     seq_number += 1;
//                     burst_complete = ftp_payload.burst_complete == 1;
//                 }
//                 Err(e) => {
//                     return Err(Box::new(e));
//                 }
//             }
//         }
//     }
//     if burst_progress != burst_size {
//         // println!("pushing {:?}", burst_progress..burst_size);
//         missing_ranges.push(burst_progress..burst_size);
//     }

//     Ok(missing_ranges)
// }

// pub fn create_file(
//     vehicle: &Arc<Box<dyn mavlink::MavConnection<MavMessage> + Send + Sync>>,
//     message_reader: &mut MutexGuard<
//         '_,
//         bus::BusReader<(
//             mavlink::MavHeader,
//             mavlink::ardupilotmega::FILE_TRANSFER_PROTOCOL_DATA,
//         )>,
//     >,
//     path: &std::path::Path,
// ) -> Result<u8, Box<dyn std::error::Error>> {
//     let ftp_payload = FtpPayload::create_file_command(path);
//     let message = messages::ftp_message(0, 0, 0, &ftp_payload);
//     let result = timed_get_response(
//         vehicle,
//         message_reader,
//         &message,
//         req_op_code_seq_number_verifier(ftp_payload.opcode, ftp_payload.seq_number + 1),
//     );
//     match result {
//         Some((_, payload)) => {
//             let ftp_payload = FtpPayload::from_bytes(&payload.payload);
//             if ftp_payload.is_nack() {
//                 Err(format!("ftp error code: {}", ftp_payload.data[0]).into())
//             } else {
//                 Ok(ftp_payload.session)
//             }
//         }
//         None => Err("No valid response.".into()),
//     }
// }

// pub fn write_file(
//     vehicle: &Arc<Box<dyn mavlink::MavConnection<MavMessage> + Send + Sync>>,
//     message_reader: &mut MutexGuard<
//         '_,
//         bus::BusReader<(
//             mavlink::MavHeader,
//             mavlink::ardupilotmega::FILE_TRANSFER_PROTOCOL_DATA,
//         )>,
//     >,
//     session: u8,
//     mut data_reader: Box<dyn std::io::Read>,
// ) {
//     let mut seq_number = 0;
//     let mut offset = 0;
//     loop {
//         let mut ftp_payload = FtpPayload::write_file_command_partial(seq_number, offset, session);
//         let size = data_reader.read(&mut ftp_payload.data).unwrap() as u8;
//         if size == 0 {
//             break;
//         }
//         ftp_payload.size = size;
//         let message = messages::ftp_message(0, 0, 0, &ftp_payload);
//         let result = timed_get_response(
//             vehicle,
//             message_reader,
//             &message,
//             req_op_code_seq_number_verifier(7, seq_number + 1),
//         );
//         match result {
//             Some((_, payload)) => {
//                 let ftp_payload = FtpPayload::from_bytes(&payload.payload);
//                 if ftp_payload.is_nack() {
//                     break;
//                 }
//             }
//             None => {
//                 break;
//             }
//         }
//         offset += size as u32;
//         seq_number += 2;
//     }

//     vehicle
//         .send_default(&messages::ftp_message(
//             0,
//             0,
//             0,
//             &FtpPayload::terminate_session_command(session),
//         ))
//         .unwrap();
// }

// pub fn write_file_to_drone(
//     vehicle: Arc<Box<dyn mavlink::MavConnection<MavMessage> + Send + Sync>>,
//     mut message_reader: MutexGuard<
//         '_,
//         bus::BusReader<(
//             mavlink::MavHeader,
//             mavlink::ardupilotmega::FILE_TRANSFER_PROTOCOL_DATA,
//         )>,
//     >,
//     file_path: &Path,
//     destination_path: &Path,
// ) {
//     let file = File::open(file_path).unwrap();
//     match create_file(&vehicle, &mut message_reader, destination_path) {
//         Ok(session) => {
//             write_file(&vehicle, &mut message_reader, session, Box::new(file));
//         }
//         _ => {}
//     }
// }

// pub fn list_files(
//     vehicle: Arc<Box<dyn mavlink::MavConnection<MavMessage> + Send + Sync>>,
//     mut reader: MutexGuard<
//         '_,
//         bus::BusReader<(
//             mavlink::MavHeader,
//             mavlink::ardupilotmega::FILE_TRANSFER_PROTOCOL_DATA,
//         )>,
//     >,
//     path: &Path,
// ) -> Vec<FileSystemEntry> {
//     let mut seq_number = 0_u16;

//     let mut files: Vec<FileSystemEntry> = Vec::new();
//     loop {
//         let offset = files.len() as u32;
//         let ftp_payload = FtpPayload::list_file_command(path, offset, seq_number);
//         let result = timed_get_response(
//             &vehicle,
//             &mut reader,
//             &messages::ftp_message(0, 0, 0, &ftp_payload),
//             req_op_code_seq_number_verifier(3, seq_number + 1),
//         );
//         match result {
//             None => {
//                 break;
//             }
//             Some((_, data)) => {
//                 let ftp_payload = FtpPayload::from_bytes(&data.payload);
//                 if ftp_payload.is_nack() {
//                     break;
//                 }
//                 match ftp_payload.parse_list_response_payload(path) {
//                     Ok(new_files) => files.extend(new_files.into_iter()),
//                     _ => {
//                         break;
//                     }
//                 }
//             }
//         }
//         seq_number += 2;
//     }
//     files
// }

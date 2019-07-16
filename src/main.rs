extern crate rosc;

use std::io;
use std::str;
use std::thread;
use std::net::{UdpSocket,SocketAddr};

// osc
use rosc::encoder;
use rosc::{OscPacket, OscMessage, OscType};


fn ack_client(socket: &UdpSocket) -> io::Result<SocketAddr> {
    let mut buf = [0; 2048];

    // wait for a heartbeat from udp client
    match socket.recv_from(&mut buf) {
        Ok((_, src)) => {
            // acknowledge client.
            let ack_msg = encoder::encode(&OscPacket::Message(OscMessage {
                addr: "/handshake".to_string(),
                args: Some(vec![OscType::String("ACK".to_string())]),
            })).unwrap();
            match socket.send_to(&ack_msg, src) {
                Ok(_) => {
                    println!("successfully acknowledged client {}", src);
                    return Ok(src);
                },
                Err(e) => return Err(e),
            }
        },
        Err(e) => return Err(e),
    }
}

fn main() {
    let socket = UdpSocket::bind("0.0.0.0:3333").expect("failed to bind to host socket!");

    println!("listening on 0.0.0.0:3333...");
    
    // wait for heartbeat from client before beginning
    ack_client(&socket).expect("failed to acknowledge client.");
    
    let mut buf = [0; 2048];
    loop {
        match socket.recv_from(&mut buf) {
            Ok((amt, src)) => {
                thread::spawn(move || {
                    println!("amt: {}", amt);
                    println!("src: {}", src);
                    println!("{}", str::from_utf8(&buf).unwrap_or(""));
                });
            },
            Err(e) => {
                println!("couldn't receive a datagram: {}", e);
            }
        }
    }

    // TODO: do something like this and spawn a new thread to handkle the incoming request!
    // let listener = TcpListener::bind("0.0.0.0:3333").unwrap();
    // // accept connections and process them, spawning a new thread for each one
    // println!("Server listening on port 3333");
    // for stream in listener.incoming() {
    //     match stream {
    //         Ok(stream) => {
    //             println!("New connection: {}", stream.peer_addr().unwrap());
    //             thread::spawn(move|| {
    //                 // connection succeeded
    //                 handle_client(stream)
    //             });
    //         }
    //         Err(e) => {
    //             println!("Error: {}", e);
    //             /* connection failed */
    //         }
    //     }
    // }

}

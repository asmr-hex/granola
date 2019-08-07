extern crate tokio;
extern crate rosc;

// tokio
use tokio::io;
use tokio::net::UdpSocket;
use tokio::prelude::*;

use std::io;
use std::str;
use std::net::SocketAddr;

// osc
use rosc::encoder;
use rosc::{OscPacket, OscMessage, OscType};


struct UdpServer {
    socket: UdpSocket,
    buf: Vec<u8>,
    to_send: Option<(usize, SocketAddr)>,
}

impl UdpServer {
    async fn run(self) -> Result<(), io::Error> {
        let UdpServer {
            mut socket,
            mut buf,
            mut to_send,
        } = self;

        loop {
            if let Some((size, peer)) = to_send {
                let amt = socket.send_to(&buf[..size], &peer).await?;

                println!("echoed {}/{} bytes to {}", amt, size, peer);
            }
        }
    }
}




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

fn route_osc_msg(socket: &UdpSocket, buf: &[u8]) {
    println!("{}", str::from_utf8(&buf).unwrap_or(""));
}

fn main() {
    let socket = UdpSocket::bind("0.0.0.0:3333").expect("failed to bind to host socket!");

    println!("listening on 0.0.0.0:3333...");

    
    
    // wait for heartbeat from client before beginning
    ack_client(&socket).expect("failed to acknowledge client.");

    // create channels to communicate with the main thread
    let (tx, rx) = mpsc::channel();

    // begin listener thread
    
    let mut buf = [0; 2048];
    loop {
        match socket.recv_from(&mut buf) {
            Ok((amt, src)) => {
                thread::spawn(move || {
                    route_osc_msg(&socket, &buf);
                    println!("amt: {}", amt);
                    println!("src: {}", src);
                });
            },
            Err(e) => {
                println!("couldn't receive a datagram: {}", e);
            }
        }
    }

}

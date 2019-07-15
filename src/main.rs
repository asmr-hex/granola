use std::thread;
use std::net::{UdpSocket, SocketAddrV4};
use std::io::{Read, Write};

fn handle_client(mut stream: TcpStream) {
    let mut data = [0 as u8; 50]; // using 50 byte buffer
    while match stream.read(&mut data) {
        Ok(size) => {
            // echo everything!
            stream.write(&data[0..size]).unwrap();
            true
        },
        Err(_) => {
            println!("An error occurred, terminating connection with {}", stream.peer_addr().unwrap());
            stream.shutdown(Shutdown::Both).unwrap();
            false
        }
    } {}
}

fn listen(socket: &net::UdpSocket, mut buffer: &mut [u8]) -> usize {

    let (number_of_bytes, src_addr) = socket.recv_from(&mut buffer).expect("no data received");

    println!("{:?}", number_of_bytes);
    println!("{:?}", src_addr);

    // do more stuff

    number_of_bytes
}

fn main() {
    let socket = UdpSocket::bind("0.0.0.0:3333").expect("failed to bind to host socket!");
    
    let mut buf: Vec<u8> = Vec::with_capacity(100);
    loop {
        while listen(&socket, &mut buf != 0) {
            
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

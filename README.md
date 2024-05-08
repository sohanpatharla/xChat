# 0xChat - Real-Time Chat Application

Welcome to 0xChat - your go-to platform for real-time conversations! 0xChat allows users to connect instantly and chat in real-time, akin to popular platforms like Omegle.

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Installation](#installation)
5. [Usage](#usage)
6. [Contributing](#contributing)
7. [License](#license)
8. [Version History](#version-history)

## Introduction

0xChat is a real-time chat application designed to provide users with a seamless and spontaneous chatting experience. Whether you're looking to meet new people, engage in casual conversations, or discuss specific topics, 0xChat has got you covered.

## Features

- **Real-Time Messaging**: Chat with other users in real-time.
- **Chat Rooms**: Join different chat rooms based on interests or topics.
- **User Authentication**: Secure user authentication system to protect user accounts.
- **Random Match**: Automatically match users with other online users for spontaneous conversations.
- **Private Messaging**: Send private messages to individual users.
- **Anonymous Login**: Users can connect anonymously without the need for registration or login.
- **Random Username Generation**: Random usernames can be generated for users who prefer not to reveal their real names.
- **Responsive Design**: 0xChat is responsive and works well on desktop and mobile devices.

## Technologies Used

- **Frontend**: React.js, Socket.IO Client
- **Backend**: Node.js, Express.js, Socket.IO
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Other Tools**: Axios for HTTP requests, bcrypt for password hashing, React Router for routing

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/sohanpatharla/0xConnect
   ```
2. Navigate to the project directory:
   ```
   cd 0xchat
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Usage

1. Start the server:
   ```
   npm start
   ```
2. Open your web browser and go to [http://localhost:3000](http://localhost:3000) to view the application.

## Contributing

Contributions are welcome! To contribute to 0xChat, follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/new-feature`).
3. Make changes and commit them (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/new-feature`).
5. Create a pull request.

## License

This project is licensed under the [MIT License](link-to-license). See the [LICENSE](link-to-license) file for details.

## Version History

### v1.0.0

- Implemented User Matching: Users can be randomly paired up for chat sessions.
- Established Socket Communication: Bidirectional communication between server and clients using Socket.IO for real-time interactions.
- Automatic Chat Room Creation: Unique room IDs generated for matched users to facilitate private chat sessions.
- Seamless Navigation to Chat: Integrated functionality to navigate matched users to a chat room upon pairing.
- Added Anonymous Login: Users can connect anonymously without the need for registration or login.
- Added Random Username Generation: Random usernames can be generated for users who prefer not to reveal their real names.

  ## Note:
Please note that a minimum of 2 users must be online globally at that at that moment to get connected and initiate a chat session.


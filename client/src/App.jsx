import { useState } from 'react';
import * as Ably from 'ably';

import ChatRoom from './ChatRoom';

const App = () => {
    const [username, setUsername] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [currentRoom, setCurrentRoom] = useState(null);
    const [client, setClient] = useState(null);

    const authenticate = async () => {
        if (!username.trim()) return;

        const ablyClient = new Ably.Realtime({
            authUrl: `${import.meta.env.VITE_BACKEND_URL}/api/ably/authHandler`,
            authMethod: 'POST',
            authParams: { username }
        });

        setClient(ablyClient);
        setIsAuthenticated(true);
    };

    const joinRoom = () => {
        if (!client || !roomName.trim()) return;

        const channel = client.channels.get(`chat:${roomName}`);
        setCurrentRoom(channel);
    };

    if (!isAuthenticated) {
        return (
            <div className="login-container">
                <h2>Enter Chat</h2>
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    onKeyPress={(e) => e.key === 'Enter' && authenticate()}
                />
                <button onClick={authenticate}>Continue</button>
            </div>
        );
    }

    if (!currentRoom) {
        return (
            <div className="room-container">
                <p>Welcome, <strong>{username}</strong>!</p>
                <input
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Enter a room name"
                    onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
                />
                <button onClick={joinRoom}>Create / Join Room</button>
            </div>
        );
    }

    return <ChatRoom client={client} channel={currentRoom} username={username} roomName={roomName} />;
};

export default App;
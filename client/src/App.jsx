import { useState, useEffect, useRef } from 'react';
import * as Ably from 'ably';

const ChatRoom = ({ channel, username, roomName }) => {
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [presentMembers, setPresentMembers] = useState([]);
    const [isChannelReady, setIsChannelReady] = useState(false);
    const messagesContainerRef = useRef(null); // Ref for the messages container

    // Effect to auto-scroll to the bottom when new messages arrive
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const handleAttach = () => {
            setIsChannelReady(true);
            channel.presence.enter({ username });
        };

        channel.on('attached', handleAttach);

        const messageSubscription = (message) => {
            const ping = Date.now() - message.data.timestamp;
            setMessages(prev => [...prev, { ...message, ping }]);
        };
        channel.subscribe('message', messageSubscription);

        const handlePresenceChange = () => {
            channel.presence.get((err, members) => {
                if (!err) {
                    setPresentMembers(members);
                }
            });
        };
        channel.presence.subscribe(['enter', 'leave', 'update'], handlePresenceChange);

        handlePresenceChange();
        channel.attach();

        return () => {
            channel.presence.leave();
            channel.detach();
            channel.unsubscribe('message', messageSubscription);
            channel.presence.unsubscribe(handlePresenceChange);
            channel.off('attached', handleAttach);
        };
    }, [channel, username]);

    const sendMessage = async () => {
        if (!messageText.trim() || !isChannelReady) return;

        try {
            await channel.publish('message', {
                text: messageText,
                username: username,
                timestamp: Date.now()
            });
            setMessageText('');
        } catch (error) {
            console.error('Failed to publish message:', error);
        }
    };

    return (
        <div className="chat-room">
            <h2>Room: {roomName}</h2>
            <div className="sidebar">
                <h3>Online Users ({presentMembers.length})</h3>
                {presentMembers.map(member => (
                    <div key={member.clientId}>{member.data?.username || member.clientId}</div>
                ))}
            </div>

            <div className="chat-area">
                <h3>Messages</h3>
                {/* Add the ref to the messages container */}
                <div className="messages-container" ref={messagesContainerRef}>
                    {messages.map((message, index) => {
                        const isMe = message.data.username === username;
                        const pingColor = message.ping <= 50 ? 'green' : 'inherit';

                        return (
                            <div key={index} className={`message ${isMe ? 'my-message' : 'other-message'}`}>
                                <div className="message-content">
                                    <strong>
                                        <span style={{ color: pingColor }}>[{message.ping}ms]</span> {message.data.username}:
                                    </strong> {message.data.text}
                                    <small> ({new Date(message.data.timestamp).toLocaleTimeString()})</small>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="message-input">
                <input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

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

    return <ChatRoom channel={currentRoom} username={username} roomName={roomName} />;
};

export default App;
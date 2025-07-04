import { useState, useEffect, useRef } from 'react';

// Helper function can live in the same file or be moved to a utils.js file
const getPingColor = (rtt) => {
    if (rtt === null || rtt === undefined) return 'inherit'; // Default color
    if (rtt < 50) return 'green';
    if (rtt < 100) return 'orange';
    return 'red';
};

const ChatRoom = ({ client, channel, username, roomName }) => {
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [presentMembers, setPresentMembers] = useState([]);
    const [isChannelReady, setIsChannelReady] = useState(false);
    const [rtt, setRtt] = useState(null);
    const messagesContainerRef = useRef(null);

    // Effect to auto-scroll to the bottom when new messages arrive
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Effect to periodically ping the server and update the RTT
    useEffect(() => {
        const ping = async () => {
            if (client && client.connection.state === 'connected') {
                try {
                    const roundTripTime = await client.connection.ping();
                    setRtt(roundTripTime);
                } catch (e) {
                    console.error("Failed to get ping", e);
                    setRtt(null);
                }
            }
        };

        ping(); // Initial ping
        const intervalId = setInterval(ping, 5000); // Ping every 5 seconds

        return () => {
            clearInterval(intervalId);
        };
    }, [client]);

    // Effect for managing channel lifecycle and subscriptions
    useEffect(() => {
        const handleAttach = () => {
            setIsChannelReady(true);
            channel.presence.enter({ username });
        };

        channel.on('attached', handleAttach);

        const messageSubscription = (message) => {
            setMessages(prev => [...prev, message]);
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
            // Add the current RTT to the message payload
            await channel.publish('message', {
                text: messageText,
                username: username,
                timestamp: Date.now(),
                rtt: rtt
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
                <p>
                    Your RTT: {rtt !== null ? (
                        <span style={{ color: getPingColor(rtt) }}>{rtt}ms</span>
                    ) : (
                        'Pinging...'
                    )}
                </p>
                {presentMembers.map(member => (
                    <div key={member.clientId}>{member.data?.username || member.clientId}</div>
                ))}
            </div>

            <div className="chat-area">
                <h3>Messages</h3>
                <div className="messages-container" ref={messagesContainerRef}>
                    {messages.map((message, index) => {
                        const isMe = message.data.username === username;
                        const senderRtt = message.data.rtt;

                        return (
                            <div key={index} className={`message ${isMe ? 'my-message' : 'other-message'}`}>
                                <div className="message-content">
                                    <strong>
                                        {/* Display the sender's RTT from the message data with color */}
                                        {senderRtt !== null && senderRtt !== undefined && (
                                            <span style={{ color: getPingColor(senderRtt) }}>
                                                [{senderRtt}ms]
                                            </span>
                                        )}
                                        {' '}{message.data.username}:
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

export default ChatRoom;
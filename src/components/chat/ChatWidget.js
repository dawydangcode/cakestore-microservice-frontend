import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './ChatWidget.css';

const ChatWidget = ({ onClose, isOpen, onToggle }) => {
  const { isLoggedIn, userName: authUserName } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const [userName] = useState(
    isLoggedIn ? authUserName : `guest_${Math.random().toString(36).substr(2, 9)}`
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem('userName', userName);

    axios.get(`http://localhost:8081/chat/history?userName=${userName}`)
      .then(response => {
        console.log('Chat history:', response.data);
        setMessages(response.data.map(msg => ({
          ...msg,
          senderType: msg.sender_type || msg.senderType
        })));
      })
      .catch(error => console.error('Error fetching chat history:', error));

    const socket = new SockJS('http://localhost:8081/ws/chat');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 20000,
      heartbeatOutgoing: 20000,
      debug: (str) => console.log(str)
    });

    client.onConnect = () => {
      console.log('WebSocket connected');
      client.subscribe('/topic/chat', (message) => {
        console.log('Received message:', message.body);
        const receivedMessage = JSON.parse(message.body);
        if (receivedMessage.sender_type) {
          receivedMessage.senderType = receivedMessage.sender_type;
        }
        if (receivedMessage.userName === userName || receivedMessage.senderType === 'SUPPORT') {
          setMessages(prev => {
            if (prev.some(msg => msg.id === receivedMessage.id)) return prev;
            return [...prev, receivedMessage];
          });
          if (!isOpen && receivedMessage.senderType === 'SUPPORT') {
            setUnreadCount(prev => prev + 1);
          }
        } else {
          console.log('Message filtered out:', receivedMessage);
        }
      });
    };

    client.onStompError = (error) => {
      console.error('WebSocket connection error:', error);
    };

    client.activate();
    setStompClient(client);

    return () => {
      if (client) client.deactivate();
    };
  }, [userName, isOpen]);

  const sendMessage = () => {
    if (input.trim() && stompClient && stompClient.connected) {
      const message = {
        userName,
        message: input,
        senderType: isLoggedIn ? 'USER' : 'GUEST',
        createdAt: new Date().toISOString()
      };
      console.log('Sending message:', message);
      stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(message)
      });
      setInput('');
    } else {
      console.error('Cannot send message: WebSocket not connected or input empty');
    }
  };

  return (
    <div className="chat-widget">
      {!isOpen && (
        <button className="chat-toggle" onClick={onToggle}>
          Nhắn tin tư vấn {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </button>
      )}
      <div className={`chat-box ${isOpen ? 'open' : 'closed'}`}>
        {isOpen && (
          <>
            <div className="chat-header">
              Nhắn tin tư vấn
              <button className="chat-close-btn" onClick={onClose}>×</button>
            </div>
            <div className="chat-messages">
              {messages.map((msg) => (
                <div
                  key={msg.id || `${msg.userName}-${msg.createdAt}`}
                  className={`message ${msg.senderType.toLowerCase()}`}
                >
                  <strong>{msg.senderType === 'SUPPORT' ? 'Hỗ trợ' : msg.userName}: </strong>
                  {msg.message}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
              />
              <button onClick={sendMessage}>Gửi</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;
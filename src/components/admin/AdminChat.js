import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom'; // Thêm import
import './AdminChat.css';

const AdminChat = () => {
  const { newMessageUsers: initialNewMessageUsers } = useOutletContext(); // Lấy từ context
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const [newMessageUsers, setNewMessageUsers] = useState(new Set(initialNewMessageUsers || [])); // Khởi tạo từ context
  const usersRef = useRef([]);
  const messagesEndRef = useRef(null);

  // Lấy danh sách users
  useEffect(() => {
    axios.get('http://localhost:8081/chat/users')
      .then(response => {
        console.log('Users:', response.data);
        setUsers(response.data);
        usersRef.current = response.data;
      })
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  // Đồng bộ newMessageUsers từ context khi mount
  useEffect(() => {
    setNewMessageUsers(new Set(initialNewMessageUsers || []));
  }, [initialNewMessageUsers]);

  // Kết nối WebSocket
  useEffect(() => {
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
        // Update global new message notification
        if (receivedMessage.userName !== selectedUser && receivedMessage.senderType !== 'SUPPORT') {
          setNewMessageUsers(prev => new Set([...prev, receivedMessage.userName]));
          // Reorder users to move sender to top
          setUsers(prev => {
            const updatedUsers = [
              receivedMessage.userName,
              ...prev.filter(user => user !== receivedMessage.userName)
            ];
            usersRef.current = updatedUsers;
            return updatedUsers;
          });
        }
        if (selectedUser && receivedMessage.userName === selectedUser) {
          setMessages(prev => {
            const tempIndex = prev.findIndex(msg => msg.tempId === receivedMessage.tempId);
            if (tempIndex !== -1) {
              const newMessages = [...prev];
              newMessages[tempIndex] = receivedMessage;
              return newMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            }
            if (prev.some(msg => msg.id === receivedMessage.id)) return prev;
            const updatedMessages = [...prev, receivedMessage];
            return updatedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          });
        }
        // Cập nhật danh sách users nếu có user mới
        if (!usersRef.current.includes(receivedMessage.userName)) {
          usersRef.current = [...new Set([...usersRef.current, receivedMessage.userName])];
          setUsers([...usersRef.current]);
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
  }, [selectedUser]);

  // Lấy lịch sử tin nhắn khi chọn user
  useEffect(() => {
    if (selectedUser) {
      axios.get(`http://localhost:8081/chat/history?userName=${selectedUser}`)
        .then(response => {
          console.log('Chat history:', response.data);
          const sortedMessages = response.data
            .map(msg => ({
              ...msg,
              senderType: msg.sender_type || msg.senderType
            }))
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          setMessages(sortedMessages);
          // Clear notification for selected user
          setNewMessageUsers(prev => {
            const updated = new Set(prev);
            updated.delete(selectedUser);
            return updated;
          });
        })
        .catch(error => console.error('Error fetching chat history:', error));
    } else {
      setMessages([]);
    }
  }, [selectedUser]);

  // Tự động cuộn xuống tin nhắn mới nhất khi tin nhắn thay đổi
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if (input.trim() && stompClient && stompClient.connected && selectedUser) {
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const message = {
        userName: selectedUser,
        message: input,
        senderType: 'SUPPORT',
        createdAt: new Date().toISOString(),
        tempId
      };
      console.log('Sending message:', message);
      setMessages(prev => {
        const updatedMessages = [...prev, { ...message, senderType: 'SUPPORT' }];
        return updatedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      });
      stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(message)
      });
      setInput('');
    } else {
      console.error('Cannot send message: WebSocket not connected, input empty, or no user selected');
    }
  };

  // Format thời gian tin nhắn
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="admin-chat">
      <h1>Chat Hỗ trợ</h1>
      <div className="chat-container">
        <aside className="user-list">
          <h2>Khách hàng</h2>
          <ul>
            {users.map(user => (
              <li
                key={user}
                className={`${selectedUser === user ? 'active' : ''} ${newMessageUsers.has(user) ? 'new-message' : ''}`}
                onClick={() => setSelectedUser(user)}
              >
                {user}
              </li>
            ))}
          </ul>
        </aside>
        <div className="chat-area">
          {selectedUser ? (
            <>
              <div className="chat-header">
                <h3>Chat với {selectedUser}</h3>
              </div>
              <div className="chat-messages">
                {messages.map((msg) => (
                  <div
                    key={msg.id || msg.tempId || `${msg.userName}-${msg.createdAt}`}
                    className={`message ${msg.senderType.toLowerCase()}`}
                  >
                    <strong>{msg.senderType === 'SUPPORT' ? 'Hỗ trợ' : msg.userName}</strong>
                    {msg.message}
                    <time>{formatTime(msg.createdAt)}</time>
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
                  placeholder="Nhập tin nhắn..."
                />
                <button onClick={sendMessage}>Gửi</button>
              </div>
            </>
          ) : (
            <div className="no-user-selected">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <p>Chọn một khách hàng để bắt đầu chat</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
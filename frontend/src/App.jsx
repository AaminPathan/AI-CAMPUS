import { useState, useRef, useEffect } from 'react';
import './App.css';

const API_URL = "http://localhost:8000/api/chat";

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: "Hi! I'm your AI Campus Assistant. Ask me anything about your college or studies.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatContext, setChatContext] = useState("general");

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textOverride = null, hiddenAction = false, overrideContext = null) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const currentContext = overrideContext || chatContext;

    if (!hiddenAction) {
      const userMessage = {
        id: Date.now(),
        role: 'user',
        text: textToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, userMessage]);
    }
    
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, context: currentContext })
      });
      const data = await response.json();
      
      if (data.new_context) {
        setChatContext(data.new_context);
      }

      const botMessage = {
        id: Date.now() + 1,
        role: 'bot',
        text: data.message, 
        type: data.type,
        data: data.data,
        tips: data.tips,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'bot',
        text: "Sorry, I couldn't reach the servers. Please check your connection.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const renderMessageData = (msg) => {
    if (!msg.data) return null;

    if (msg.type === 'timetable') {
      return msg.data.map((item, i) => (
        <div key={i} className="bot-data-box animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
          <div className="bot-data-header">{item.subject}</div>
          <div className="bot-data-row">🕒 {item.time} &nbsp;|&nbsp; 📍 {item.room}</div>
        </div>
      ));
    }

    if (msg.type === 'exam') {
      return (
        <div className="animate-fade-in-up">
          {msg.data.map((item, i) => (
            <div key={i} className="bot-data-box" style={{ borderColor: '#ef4444' }}>
              <div className="bot-data-header" style={{ color: '#ef4444' }}>{item.subject}</div>
              <div className="bot-data-row">📅 {item.date} &nbsp;|&nbsp; 🕒 {item.time} &nbsp;|&nbsp; 📍 {item.room}</div>
            </div>
          ))}
          {msg.tips && (
            <div className="bot-data-box" style={{ borderColor: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
              <div className="bot-data-header" style={{ color: '#10b981' }}>💡 Helpful Tips</div>
              <ul>
                {msg.tips.map((tip, i) => <li key={i}>{tip}</li>)}
              </ul>
            </div>
          )}
        </div>
      );
    }

    if (msg.type === 'events') {
      return msg.data.map((item, i) => (
        <div key={i} className="bot-data-box animate-fade-in-up" style={{ animationDelay: `${i * 100}ms`, borderColor: '#f59e0b' }}>
          <div className="bot-data-header" style={{ color: '#f59e0b' }}>{item.title}</div>
          <div className="bot-data-row">📅 {item.date} &nbsp;|&nbsp; 🕒 {item.time} &nbsp;|&nbsp; 📍 {item.location}</div>
        </div>
      ));
    }

    if (msg.type === 'doubt') {
      return (
        <div className="animate-fade-in-up">
          <div className="bot-data-box" style={{ borderColor: '#8b5cf6' }}>
            <div className="bot-data-header" style={{ color: '#8b5cf6' }}>🧠 Simple Explanation</div>
            <p style={{ color: '#e2e8f0', lineHeight: 1.6 }}>{msg.data.simple_explanation}</p>
          </div>
          <div className="bot-data-box" style={{ borderColor: '#10b981' }}>
            <div className="bot-data-header" style={{ color: '#10b981' }}>📝 Step-by-Step Breakdown</div>
            <ol style={{ color: '#e2e8f0' }}>
              {msg.data.step_by_step.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </div>
          <div className="bot-data-box" style={{ borderColor: '#f59e0b' }}>
            <div className="bot-data-header" style={{ color: '#f59e0b' }}>💡 Example</div>
            <p style={{ color: '#e2e8f0', lineHeight: 1.6 }}>{msg.data.example}</p>
          </div>
        </div>
      );
    }

    if (msg.type === 'material') {
      return (
        <div className="animate-fade-in-up">
          <div className="bot-data-box" style={{ borderColor: '#f43f5e' }}>
            <div className="bot-data-header" style={{ color: '#f43f5e' }}>📚 Notes</div>
            {msg.data.notes.map((item, i) => <a key={i} href={item.link} className="link-button">📄 {item.title}</a>)}
          </div>
          <div className="bot-data-box" style={{ borderColor: '#ef4444' }}>
            <div className="bot-data-header" style={{ color: '#ef4444' }}>🎥 YouTube Videos</div>
            {msg.data.videos.map((item, i) => <a key={i} href={item.link} className="link-button">▶️ {item.title}</a>)}
          </div>
          <div className="bot-data-box" style={{ borderColor: '#10b981' }}>
            <div className="bot-data-header" style={{ color: '#10b981' }}>📝 Practice Questions</div>
            {msg.data.practice.map((item, i) => <a key={i} href={item.link} className="link-button">✍️ {item.title}</a>)}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderFormattedText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} style={{ color: '#fff' }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const getPlaceholder = () => {
    if (chatContext === "doubt_solving") return "Ask your doubt...";
    if (chatContext === "study_materials") return "Enter a subject for materials...";
    return "Message AI Campus Assistant...";
  };

  const getModeLabel = () => {
    if (chatContext === "doubt_solving") return "Doubt Solving Mode";
    if (chatContext === "study_materials") return "Study Materials Mode";
    return "General Assistant";
  };

  return (
    <div className="app-container">
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🎓</div>
          AI Campus
        </div>
        
        <div className="sidebar-section-title">Academic Info</div>
        <div className="sidebar-menu">
          <button className={chatContext === "general" && messages.slice(-1)[0]?.text?.includes("timetable") ? "active" : ""} onClick={() => { setChatContext("general"); handleSend("Show my timetable", false, "general"); setIsSidebarOpen(false); }}>📅 Your Timetable</button>
          <button className={chatContext === "general" && messages.slice(-1)[0]?.text?.includes("exam") ? "active" : ""} onClick={() => { setChatContext("general"); handleSend("When is my next exam?", false, "general"); setIsSidebarOpen(false); }}>📝 Upcoming Exams</button>
          <button className={chatContext === "general" && messages.slice(-1)[0]?.text?.includes("event") ? "active" : ""} onClick={() => { setChatContext("general"); handleSend("Any events this week?", false, "general"); setIsSidebarOpen(false); }}>🎤 Campus Events</button>
        </div>

        <div className="sidebar-section-title">Learning Center</div>
        <div className="sidebar-menu">
          <button className={chatContext === "doubt_solving" ? "active" : ""} onClick={() => { handleSend("enter_doubt_mode", true, "general"); setIsSidebarOpen(false); }}>🧠 Doubt Solving</button>
          <button className={chatContext === "study_materials" ? "active" : ""} onClick={() => { handleSend("enter_material_mode", true, "general"); setIsSidebarOpen(false); }}>📚 Study Materials</button>
        </div>
      </aside>

      <main className="chat-area" onClick={() => isSidebarOpen && setIsSidebarOpen(false)}>
        <header className="chat-header">
          <div className="header-title">
            <span className="status-indicator"></span>
            AI Campus Assistant
          </div>
          <div className="header-mode">
            {chatContext === "doubt_solving" ? "🧠" : chatContext === "study_materials" ? "📚" : "✨"} {getModeLabel()}
          </div>
        </header>

        <div className="chat-history">
          <div className="chat-container">
            {messages.map((msg, idx) => (
              <div key={msg.id} className={`message ${msg.role}`}>
                
                <div className="message-header">
                  <div className="message-avatar">
                    {msg.role === 'user' ? 'U' : 'AI'}
                  </div>
                  <span className="sender-name">{msg.role === 'user' ? 'You' : 'Campus AI'}</span>
                </div>

                <div className="bubble animate-fade-in-up">
                  {renderFormattedText(msg.text)}
                  {renderMessageData(msg)}
                </div>
                
                <span className="timestamp">{msg.timestamp}</span>

                {/* Show Quick Suggestion Chips if it's the first welcome message */}
                {idx === 0 && messages.length === 1 && (
                  <div className="suggestions-grid animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <div className="suggestion-chip" onClick={() => { setChatContext("general"); handleSend("Show my timetable", false, "general"); }}>📅 Show timetable</div>
                    <div className="suggestion-chip" onClick={() => { setChatContext("general"); handleSend("When is my next exam?", false, "general"); }}>📝 Upcoming exams</div>
                    <div className="suggestion-chip" onClick={() => { setChatContext("doubt_solving"); handleSend("Explain recursion", false, "doubt_solving"); }}>🧠 Explain recursion</div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="message bot animate-fade-in">
                <div className="message-header">
                  <div className="message-avatar">AI</div>
                  <span className="sender-name">Campus AI</span>
                </div>
                <div className="typing-container">
                  <div className="typing-text">Campus AI is typing</div>
                  <div className="typing-dots">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="input-area-wrapper">
          <div className="input-container-inner">
            <button 
              className="mobile-menu-btn" 
              style={{ padding: '8px', background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
              onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(!isSidebarOpen); }} 
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <input 
              type="text" 
              placeholder={getPlaceholder()} 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <button className="send-button" onClick={() => handleSend(null, false)} disabled={isLoading || !input.trim()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

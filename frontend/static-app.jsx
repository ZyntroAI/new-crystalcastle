const { useState, useRef, useEffect } = React;

const API_BASE = "";

function App() {
    const [messages, setMessages] = useState([
        { role: "assistant", content: "สวัสดี! 🤖 ฉันคือ ZyntroAI ที่รันอยู่ในเครื่องนี้โดยตรง พิมพ์คำถามด้านล่างได้เลยครับ" }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [status, setStatus] = useState("checking");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        checkHealth();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const checkHealth = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/health`);
            const data = await res.json();
            setStatus("online");
        } catch {
            setStatus("offline");
        }
    };

    const sendMessage = async (e) => {
        e?.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg = { role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            const res = await fetch(`${API_BASE}/api/ask`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: input,
                    mode: "chat"
                })
            });

            if (!res.ok) throw new Error("ไม่ตอบสนอง");
            const data = await res.json();

            setMessages(prev => [...prev, {
                role: "assistant",
                content: data.response || "ไม่มีข้อความตอบกลับ"
            }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: `❌ ขออภัย เกิดปัญหา: ${err.message}\nตรวจสอบว่า API ทำงานที่ /docs นะครับ`
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col max-w-lg mx-auto w-full border-x dark:border-gray-800 bg-white dark:bg-gray-900">
            {/* ส่วนหัว */}
            <header className="sticky top-0 z-10 border-b dark:border-gray-800 px-4 py-3 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    <h1 className="font-semibold">ZyntroAI Mobile</h1>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                    status === "online" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                    status === "checking" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                }`}>
                    {status === "online" ? "พร้อมใช้งาน" : status === "checking" ? "ตรวจสอบ..." : "ไม่เชื่อมต่อ"}
                </span>
            </header>

            {/* กล่องข้อความ */}
            <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
                {messages.map((msg, i) => (
                    <div key={i} className={`message flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                            msg.role === "user"
                                ? "bg-blue-600 text-white rounded-br-md"
                                : "bg-gray-100 dark:bg-gray-800 rounded-bl-md"
                        }`}>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
                            <div className="flex gap-1 items-center h-4">
                                <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></span>
                                <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></span>
                                <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            {/* ช่องพิมพ์ */}
            <form onSubmit={sendMessage} className="sticky bottom-0 border-t dark:border-gray-800 p-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur flex gap-2 items-end">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="พิมพ์ข้อความ..."
                    rows={1}
                    className="flex-1 border dark:border-gray-700 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                />
                <button
                    type="submit"
                    disabled={isTyping || !input.trim()}
                    className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50 active:scale-95 transition-transform"
                >
                    <i className="fa fa-paper-plane text-sm"></i>
                </button>
            </form>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

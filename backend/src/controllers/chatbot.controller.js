import { chatWithAI } from "../services/chatbot.service.js";

export const chat = async (req, res, next) => {
    try {
        const { message, history } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: "Vui lòng nhập tin nhắn hợp lệ." });
        }

        const reply = await chatWithAI(history || [], message);
        
        return res.json({ reply });
    } catch (error) {
        // Nếu lỗi là do chưa config API key
        if (error.message.includes("GEMINI_API_KEY")) {
            return res.status(500).json({ error: "Chưa cấu hình GEMINI_API_KEY ở server!" });
        }
        res.status(500).json({ error: error.message || "Lỗi server nội bộ" });
    }
};

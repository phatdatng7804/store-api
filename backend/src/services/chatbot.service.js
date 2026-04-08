import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `Bạn là trợ lý ảo tư vấn khách hàng của cửa hàng thời trang VELA (VELA Shop). 
Quy tắc trả lời:
- Luôn thân thiện, lịch sự và giữ thái độ chuyên nghiệp của một nhân viên chăm sóc khách hàng.
- VELA chuyên bán quần áo phong cách hiện đại cho mọi lứa tuổi (Women, Men, Street, Office, Accessories). Mức giá đa dạng và thường xuyên có Flash Sale, miễn phí vận chuyển cho đơn trên 999k.
- Bạn trả lời ngắn gọn, súc tích và mạch lạc để tiện hiển thị trên cửa sổ chat nhỏ.
- Về màu sắc, shop thường có Black, Ivory, Stone, Denim, Olive. Về size thường có XS, S, M, L, XL.
- Nếu khách yêu cầu mua hàng hoặc coi chi tiết, hối thúc khách ghé qua mục "Catalog" hoặc "Sản phẩm" ở giao diện chính để dễ dàng đặt hàng.
- Không tự bịa thông tin về sản phẩm cụ thể nếu không chắc chắn (hãy khuyên khách dạo quanh trang web).`;

export const chatWithAI = async (history, userMessage) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Chưa cấu hình GEMINI_API_KEY trên hệ thống!");
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        // Map history to the format expected by the SDK
        // @google/genai uses { role: "user" | "model", parts: [{ text: "..." }] } for history
        const formattedHistory = (history || []).map(msg => ({
            role: msg.role === "assistant" || msg.role === "model" ? "model" : "user",
            parts: [{ text: msg.text || "" }]
        }));

        // Use the chat session to send a message
        // Reference: ai.chats() initializes a chat object that can store history or we can pass it
        // Or we can just use ai.models.generateContent with the concatenated content
        // GenerateContent takes an array of contents.
        const contents = [
            {
                role: "user",
                parts: [{ text: SYSTEM_INSTRUCTION }]
            },
            {
                role: "model",
                parts: [{ text: "Vâng, tôi đã hiểu và sẽ đóng vai nhân viên hỗ trợ VELA." }]
            },
            ...formattedHistory,
            {
                role: "user",
                parts: [{ text: userMessage }]
            }
        ];

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                temperature: 0.7
            }
        });

        return response.text;
    } catch (error) {
        console.error("Gemini AI API Error:", error);
        // Phân biệt các loại lỗi khác nhau
        if (error?.status === 429 || error?.message?.includes("Too many requests") || error?.message?.includes("quota")) {
            throw new Error("Hệ thống AI đang bận, bạn vui lòng thử lại sau 30 giây nhé! ⏳");
        }
        throw new Error("Xin lỗi, hệ thống AI đang gặp sự cố, vui lòng thử lại sau.");
    }
};

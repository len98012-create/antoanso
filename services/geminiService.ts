import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Message, Role } from "../types";

// Initialize the Gemini AI client
// Note: process.env.API_KEY is assumed to be available in the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
Bạn là "Cố vấn An toàn Số" - một trợ lý AI thân thiện, thông thái và đáng tin cậy dành cho học sinh (từ cấp 2 đến cấp 3).
Nhiệm vụ của bạn là tư vấn, giải đáp và hướng dẫn học sinh về các vấn đề liên quan đến:
1. Đạo đức số: Cách cư xử văn minh trên mạng, tôn trọng người khác.
2. An toàn trực tuyến: Phòng tránh lừa đảo, bảo vệ mật khẩu, xử lý khi bị bắt nạt qua mạng (cyberbullying).
3. Bảo mật thông tin: Quyền riêng tư, dữ liệu cá nhân.
4. Bản quyền: Cách sử dụng tài nguyên số hợp pháp, tôn trọng tác giả.

Phong cách trả lời:
- Ngắn gọn, súc tích, dễ hiểu, phù hợp với lứa tuổi học sinh.
- Đồng cảm, không phán xét.
- Đưa ra lời khuyên thực tế và các bước hành động cụ thể (Actionable advice).
- Sử dụng các emoji phù hợp để tạo cảm giác thân thiện.
- Nếu vấn đề nghiêm trọng (như đe dọa tính mạng, lạm dụng), hãy khuyên học sinh tìm kiếm sự giúp đỡ từ người lớn tin cậy (bố mẹ, thầy cô) hoặc cơ quan chức năng.

Hãy luôn trả lời bằng Tiếng Việt.
`;

let chatSession: Chat | null = null;

export const getChatSession = (): Chat => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7, // Balance between creativity and safety
      },
    });
  }
  return chatSession;
};

export const resetChatSession = () => {
  chatSession = null;
};

export const sendMessageStream = async function* (message: string): AsyncGenerator<string, void, unknown> {
  const chat = getChatSession();
  
  try {
    const result = await chat.sendMessageStream({ message });
    
    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        yield c.text;
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
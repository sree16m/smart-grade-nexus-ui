import axios from "axios";

// Base URL for Knowledge Base API
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://smart-grade-nexus.onrender.com";

// Base URL for OCR API
const OCR_BASE_URL = process.env.NEXT_PUBLIC_OCR_API_URL || "https://ocr-processing-cxne.onrender.com";

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const ocrApi = axios.create({
    baseURL: OCR_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Type Definitions
export interface Book {
    book_name: string;
    subject?: string;
    board?: string;
    school?: string;
    student_class?: string;
    semester?: string;
}

export interface AnswerSheetInput {
    answer_sheet_id?: string | null;
    student_id?: string | null;
    exam_details: {
        subject: string;
        board?: string | null;
        class?: number | null;
        class_level?: number | null;
    };
    responses: Array<{
        q_no: number;
        question_context: {
            text_primary: {
                en: string;
                regional?: string | null;
            };
            type: string;
            max_marks?: number | null;
            options?: Array<{
                id: string;
                text: {
                    en: string;
                    regional?: string | null;
                };
            }>;
        };
        student_answer: {
            text: string;
            diagram_description?: string | null;
            marks_awarded?: number | null;
            is_correct?: boolean | null;
            feedback?: string | null;
        };
        topic_analysis?: object | null;
    }>;
}

export interface AnswerSheetOutput extends AnswerSheetInput { }

// API Functions
export const getBooks = async (): Promise<Book[]> => {
    const response = await api.get("/api/v1/knowledge/books");
    const data = response.data;

    let booksData: any[] = [];

    // Hahdle { status: "success", data: [...] } response
    if (data && Array.isArray(data.data)) {
        booksData = data.data;
    } else if (Array.isArray(data)) {
        // Handle direct array response
        booksData = data;
    } else if (typeof data === "object" && data !== null) {
        // Handle object response (dictionary of filename -> metadata) - Legacy/Fallback
        booksData = Object.entries(data).map(([filename, metadata]: [string, any]) => ({
            book_name: metadata.book_name || filename,
            ...metadata,
        }));
    }

    // Map API fields to Book interface
    return booksData.map((item: any) => ({
        book_name: item.book_name,
        subject: item.subject,
        board: item.board,
        school: item.school,
        student_class: item["class"] || item.student_class || item.class_level || item["class_level"],
        semester: item.semester,
    }));
};

export const ingestBook = async (formData: FormData) => {
    // Backend expects 'class' instead of 'student_class'
    const studentClass = formData.get("student_class");
    if (studentClass) {
        formData.append("class", studentClass);
        // We keep 'student_class' as well just in case
    }

    const response = await api.post("/api/v1/knowledge/ingest", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const getIngestStatus = async (bookName: string) => {
    const response = await api.get(`/api/v1/knowledge/ingest/status/${bookName}`);
    return response.data;
};

export const cancelIngest = async (bookName: string) => {
    const response = await api.post(`/api/v1/knowledge/ingest/cancel/${bookName}`);
    return response.data;
};

export const deleteBook = async (bookName: string) => {
    const response = await api.delete(`/api/v1/knowledge/books/${bookName}`);
    return response.data;
};

export const clearKnowledgeBase = async () => {
    const response = await api.delete("/api/v1/knowledge/clear");
    return response.data;
};

export const analyzeFullSheet = async (data: AnswerSheetInput) => {
    try {
        const response = await api.post("/api/v1/intelligence/analyze-full-sheet", [data]);
        return response.data[0];
    } catch (error: any) {
        if (error.response) {
            console.error("API Validation Error Data:", JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
};

export const fetchPendingAnswerSheets = async () => {
    const response = await ocrApi.get("/api/v1/answer-sheets/filter/", {
        params: {
            status: "pending evaluation",
            include_evaluation_data: true,
        },
    });
    return response.data;
};

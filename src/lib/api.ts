import axios from "axios";

// Base URL for Knowledge Base API
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://smart-grade-nexus-npza.onrender.com";

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
    id?: string;
    book_name: string;
    filename?: string;
    subject: string;
    class_level: number;
    academic_year: string;
    semester: number;
    board?: string;
    is_latest?: boolean;
    file_url?: string;
}

export interface EvaluationRequest {
    answer_sheet_id: string;
    qp_id: string;
    status: string;
    exam_details: {
        board: string;
        class_level: number;
        subject: string;
        exam_code: string;
    };
    student_details: {
        name: string;
        roll_no: string;
        class: string;
        section: string;
        subject: string;
        date: string;
        school: string;
    };
    grading_summary: Record<string, any>;
    responses: Array<{
        q_no: number;
        question_context: {
            text_primary: {
                en: string;
                hi?: string | null;
                regional?: string | null;
            };
            text_regional?: {
                en: string;
                hi?: string | null;
                regional?: string | null;
            } | null;
            type: string;
            max_marks: number;
            options?: Array<{
                id: string;
                text: {
                    en: string;
                    hi?: string | null;
                    regional?: string | null;
                };
            }>;
        };
        student_answer: {
            text: string | null;
            diagram_description?: string | null;
            marks_awarded?: number | null;
            is_correct?: boolean | null;
            ai_feedback?: string | null;
            correct_answer?: string | null;
            chapter?: string | null;
            topic?: string | null;
            page_number?: string | null;
            remedial_suggestion?: string | null;
            confidence_score?: number | null;
        };
    }>;
}

export interface EvaluationResponse {
    answer_sheet_id: string;
    evaluated_at: string;
    evaluation_summary: {
        total_max_marks: number;
        total_marks_awarded: number;
        percentage: number;
        overall_feedback: string | null;
    };
    responses: Array<{
        q_no: number;
        question_context: any;
        student_answer: {
            text: string | null;
            diagram_description: string | null;
            marks_awarded: number | null;
            is_correct: boolean | null;
            ai_feedback: string | null;
            correct_answer: string | null;
            chapter: string | null;
            topic: string | null;
            page_number: string | null;
            remedial_suggestion: string | null;
            confidence_score: number | null;
        };
    }>;
}

// API Functions
export const getBooks = async (params?: {
    subject?: string;
    class_level?: number;
    academic_year?: string;
    semester?: number;
    is_latest?: boolean;
}): Promise<Book[]> => {
    const response = await api.get("/api/v1/textbooks/", { params });
    const data = response.data;

    const books = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);

    return books.map((b: any) => ({
        ...b,
        id: b.id || b._id,
        book_name: b.book_name || b.filename || "Unnamed Book",
        file_url: b.file_url ? (b.file_url.startsWith("http") ? b.file_url : `${BASE_URL}${b.file_url}`) : undefined
    }));
};

export const ingestBook = async (formData: FormData) => {
    // Determine query params from formData for the new API structure
    const book_name = formData.get("book_name") as string;
    const subject = formData.get("subject") as string;
    const class_level = formData.get("class_level") || formData.get("student_class");
    const academic_year = formData.get("academic_year") || "2025-26";
    const semester = formData.get("semester") || "1";
    const board = formData.get("board") || "CBSE";

    const response = await api.post("/api/v1/textbooks/upload", formData, {
        params: {
            book_name,
            subject,
            class_level,
            academic_year,
            semester,
            board,
        },
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const getTextbookDetails = async (textbookId: string): Promise<Book> => {
    const response = await api.get(`/api/v1/textbooks/${textbookId}`);
    const b = response.data;
    return {
        ...b,
        id: b.id || b._id,
        book_name: b.book_name || b.filename || "Unnamed Book",
        file_url: b.file_url ? (b.file_url.startsWith("http") ? b.file_url : `${BASE_URL}${b.file_url}`) : undefined
    };
};

export const deleteBook = async (textbookId: string) => {
    const response = await api.delete(`/api/v1/textbooks/${textbookId}`);
    return response.data;
};

export const queryTextbook = async (textbookId: string, query: string) => {
    const response = await api.post(`/api/v1/textbooks/${textbookId}/query`, null, {
        params: { query },
    });
    return response.data;
};

export const evaluateSheet = async (data: EvaluationRequest): Promise<EvaluationResponse> => {
    try {
        const response = await api.post("/api/v1/intelligence/evaluate-sheet", data);
        return response.data;
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

export interface Course {
    courseId: string;
    title: string;
    teacher: string;
    level: string;
    summary?: string;
    placesAvailable?: number;
    students?: string[];
}


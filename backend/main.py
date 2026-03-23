from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import string

app = FastAPI(title="AI Campus Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    context: str = "general"

@app.get("/")
def read_root():
    return {"status": "ok", "message": "AI Campus Assistant API is running"}

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    message = request.message.lower()
    context = request.context
    
    # 1. Handle Context-specific inputs
    if context == "doubt_solving":
        topic = message.strip(string.punctuation).strip()
        if not topic: topic = "this concept"
        return {
            "type": "doubt",
            "message": f"Sure, here is an explanation for **{topic}**.",
            "new_context": "general",
            "data": {
                "simple_explanation": f"{topic.capitalize()} is a fundamental concept where you break down a complex problem into simpler, manageable parts.",
                "step_by_step": [
                    "First, define the core problem.",
                    "Second, identify the base case or smallest instance.",
                    "Third, write logic to transition towards the base case."
                ],
                "example": f"For {topic}, think of looking up a word in a dictionary. You open it in the middle, and if your word is earlier, you repeat the process with the first half."
            }
        }

    if context == "study_materials":
        subject = message.strip(string.punctuation).strip()
        if not subject: subject = "this topic"
        return {
            "type": "material",
            "message": f"Here are some recommended study materials for **{subject}**:",
            "new_context": "general",
            "data": {
                "notes": [
                    {"title": f"{subject.title()} Cheat Sheet", "link": "#"},
                    {"title": f"Complete {subject.title()} Guide", "link": "#"}
                ],
                "videos": [
                    {"title": f"Understanding {subject.title()} in 5 mins", "link": "#"},
                    {"title": f"Advanced {subject.title()} Concepts", "link": "#"}
                ],
                "practice": [
                    {"title": f"{subject.title()} Practice Problems", "link": "#"}
                ]
            }
        }

    # 2. Handle explicit UI mode-switches from Sidebar
    if message == "enter_doubt_mode":
        return {
            "type": "text",
            "message": "Ask any concept or question you want help with.",
            "new_context": "doubt_solving"
        }
        
    if message == "enter_material_mode":
        return {
            "type": "text",
            "message": "Which subject or topic do you need study material for?",
            "new_context": "study_materials"
        }

    # 3. Handle standard General queries
    if "timetable" in message or "classes" in message:
        return {
            "type": "timetable",
            "message": "Here is your timetable for today:",
            "data": [
                {"subject": "Data Structures", "time": "09:00 AM", "room": "Room 101"},
                {"subject": "Database Management", "time": "11:00 AM", "room": "Room 102"},
                {"subject": "Web Development", "time": "02:00 PM", "room": "Lab 3"}
            ]
        }
    elif "exam" in message:
        return {
            "type": "exam",
            "message": "Here is your upcoming exam schedule:",
            "data": [
                {"subject": "Data Structures", "date": "Oct 15, 2026", "time": "10:00 AM", "room": "Hall A"},
                {"subject": "Web Development", "date": "Oct 18, 2026", "time": "02:00 PM", "room": "Lab 1"}
            ],
            "tips": [
                "Revise Big O notation for Data Structures.",
                "Practice previous year papers.",
                "Check the React documentation for Web Dev."
            ]
        }
    elif "event" in message or "seminar" in message:
        return {
            "type": "events",
            "message": "Upcoming events and seminars this week:",
            "data": [
                {"title": "AI in Healthcare Seminar", "date": "Oct 10, 2026", "time": "11:00 AM", "location": "Auditorium"},
                {"title": "Tech Fest 2026", "date": "Oct 12-14, 2026", "time": "All Day", "location": "Main Campus"}
            ]
        }
    else:
        return {
            "type": "text",
            "message": "I'm your AI Campus Assistant! You can ask me about your timetable, upcoming exams, campus events, or ask me to explain a concept or recommend study materials. How can I help you today?"
        }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

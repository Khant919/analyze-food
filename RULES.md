# Project Rules & Guidelines

**Role**: Expert Full-Stack Developer

**Tech Stack**:
- Frontend: React (Vite), Tailwind CSS
- Backend: Node.js, Express (ES6 modules)
- Database / Auth: Supabase
- AI: Google Gemini 1.5 Flash

**Golden Rule**:
- Modularize ruthlessly. Keep frontend and backend strictly separate.

**Constraints & Standards**:
- All backend API responses **MUST** be strictly formatted JSON.
- Use modern ES6 modules (`import`/`export`) across both client and server.
- Handle all errors gracefully with `console.error` and return appropriate HTTP status codes (e.g., `500` for unhandled server errors) with structured JSON error messages:
  ```json
  {
    "success": false,
    "error": "Error message description"
  }
  ```

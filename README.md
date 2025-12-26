# Portfolio Frontend

A modern, responsive portfolio website built with React and Vite, featuring a comprehensive CMS admin panel for content management.

## 🌐 Live Website

**Portfolio URL:** https://my-portfolio-frontend-i5nl.vercel.app/

## 🔗 Related Repositories

- **Backend Repository:** [my-portfolio-backend](https://github.com/salman-mugloo/my-portfolio-backend)
- **Frontend Repository:** [my-portfolio-frontend](https://github.com/salman-mugloo/my-portfolio-frontend) (this repo)

## 🚀 Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Deployment:** Vercel

## ✨ Features

### Portfolio Website
- **Responsive Design:** Fully responsive across mobile, tablet, and desktop
- **Hero Section:** Dynamic profile introduction with animated statistics
- **About Section:** Feature highlights and personal information
- **Education Section:** Academic background display
- **Languages Section:** Language proficiency showcase
- **Skills Section:** Interactive tech stack visualization
- **Technical Expertise:** Detailed expertise areas
- **Projects Section:** Portfolio projects with GitHub links
- **Certifications:** Certificate gallery with image previews and PDF downloads
- **Contact Section:** Contact form and social media links
- **Resume Download:** PDF resume download functionality

### Admin CMS Panel
- **Secure Authentication:** JWT-based authentication with OTP verification
- **Profile Management:** Update profile information and upload profile images
- **Project Management:** Full CRUD operations for projects
- **Skills Management:** Manage technical skills and expertise
- **Certification Management:** Upload certificates with images and PDFs
- **Education Management:** Manage educational background
- **Languages Management:** Add and manage language proficiencies
- **Resume Management:** Upload and manage resume PDFs
- **Contact Info Management:** Update contact information and social links
- **Activity Logs:** View admin activity audit logs
- **Feature Management:** Manage about section features

## 🔒 Security Features

- **JWT Authentication:** Secure token-based authentication
- **CSRF Protection:** Cross-Site Request Forgery protection for all admin operations
- **Rate Limiting:** API rate limiting to prevent abuse
- **Secure Headers:** Helmet.js security headers
- **CORS Configuration:** Properly configured CORS for cross-origin requests
- **Input Validation:** Client-side and server-side validation
- **Secure File Uploads:** Validated file uploads with type checking
- **Environment Variables:** Sensitive data stored in environment variables
- **Protected Routes:** Admin routes require authentication
- **Audit Logging:** Complete audit trail of all admin actions

## 📁 Project Structure

```
frontend/
├── src/
│   ├── App.jsx              # Main portfolio application
│   ├── AppRouter.jsx         # Routing configuration
│   ├── main.jsx              # Application entry point
│   ├── services/
│   │   └── api.js            # API service layer
│   ├── components/
│   │   ├── AdminLayout.jsx   # Admin panel layout
│   │   └── AdminProtectedRoute.jsx
│   └── admin-panel/          # Admin CMS panel
│       └── src/
│           ├── pages/        # Admin pages
│           └── services/
│               └── api.js    # Admin API services
├── public/
├── vercel.json               # Vercel deployment config
└── package.json
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Backend server running (see [backend repo](https://github.com/salman-mugloo/my-portfolio-backend))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/salman-mugloo/my-portfolio-frontend.git
cd my-portfolio-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=https://your-backend-url/api
```

4. Start development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API base URL | Yes |

## 🚀 Deployment

The frontend is deployed on **Vercel** with automatic deployments from the main branch.

### Vercel Configuration
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- SPA Routing: Configured via `vercel.json`

## 📄 License

This project is private and proprietary.

## 👤 Author

**Salman Mugloo**
- Portfolio: https://my-portfolio-frontend-i5nl.vercel.app/
- GitHub: [@salman-mugloo](https://github.com/salman-mugloo)

---

**Note:** This is a production-ready portfolio website with a fully functional CMS. For backend API documentation, see the [backend repository](https://github.com/salman-mugloo/my-portfolio-backend).


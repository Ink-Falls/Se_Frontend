# AralKademy Frontend
A fast and modern web app built with React, Vite, and Tailwind CSS, offering a seamless UI and interactive experience.
This will be the frontend of AralKademy

## Project Overview
This project is built with a modern front-end stack that leverages Vite for fast development, React for component-based architecture, and Tailwind CSS with PostCSS for utility-first styling. It also incorporates React Router for client-side routing and Lucide React for flexible icons, enabling efficient and flexible UI development.

## Features
- ⚡ Lightning-fast development and build with Vite
- 🎨 Utility-first styling using Tailwind CSS
- 🌐 Client-side routing with React Router DOM
- 🎉 Scalable and modern icons with Lucide React
- 📱 Responsive design and mobile-first approach

## Tech Stack
- React
- Vite (bundler)
- Tailwind CSS (styling) with PostCSS
- Lucide React (icons)
- React Router DOM (routing)

## Getting Started
> Prerequisites:
> Make sure you have Node.js and npm (or yarn) installed on your system.

### Installation

1. On GitHub, navigate to the main page of the repository.

2. Above the list of files, click <> Code.

3. Copy the URL for the repository.
    - To clone the repository using HTTPS, under "HTTPS", then copy the link.
    - To clone the repository using an SSH key, including a certificate issued by your organization's SSH certificate authority, click SSH, then copy the link.
    - To clone a repository using GitHub CLI, click GitHub CLI, then copy the link.

4. Open Git Bash.

5. Change the current working directory to the location where you want the cloned directory.

6. Type `git clone`, and then paste the URL you copied earlier.
```
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY
```

7. Press Enter to create your local clone.
```
$ git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY
> Cloning into `Spoon-Knife`...
> remote: Counting objects: 10, done.
> remote: Compressing objects: 100% (8/8), done.
> remove: Total 10 (delta 1), reused 10 (delta 1)
> Unpacking objects: 100% (10/10), done.
```

8. Install dependencies:
```
npm install
```

9. Start the development server:
```
npm run dev
```

10. View the app at `[React](http://localhost:3000)`.

### Scripts
- `npm run dev` — Runs the app in development mode.
- `npm run build` — Builds the app for production.
- `npm run preview` — Previews the production build locally.
- `npm run lint` — Runs linting checks.

### Folder Structure
```
├── public/                   # Static files like favicon
├── src/
│   ├── assets/               # Images and assets
│   ├── components/           # Reusable components
│   │   ├── Announcement.jsx
│   │   ├── Homepage.jsx
│   │   └── Sidebar.jsx
│   ├── App.css               # Global styles
│   ├── App.jsx               # Main App component
│   ├── index.css             # Tailwind and global CSS imports
│   ├── main.jsx              # Entry file
├── .gitignore
├── index.html                # Root HTML file
├── package.json
├── README.md                 # Project documentation
├── tailwind.config.js        # Tailwind CSS configuration
├── vite.config.js            # Vite configuration
└── postcss.config.js         # PostCSS configuration
```

> [!CAUTION]
> This repository is a working prototype and currently lacks backend support.
> The code serves solely as a foundation for frontend development.

> [!IMPORTANT]
> If any issues persist, please open a pull request or contact me directly so we can address the problem immediately. Thank you!


Tailwind CSS Documentation:[^1]

Lucide React Documentation:[^2] 

[^1]: [Tailwind CSS](https://tailwindcss.com/docs/content-configuration).
[^2]: [Lucide React](https://lucide.dev/).
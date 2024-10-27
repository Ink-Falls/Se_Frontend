# AralKademy Frontend
A fast, modern web application built with ReactJS, Vite, and Tailwind CSS, designed to deliver a smooth and interactive user experience. 
This serves as the frontend for AralKademy.

## Project Overview
This project utilizes a cutting-edge front-end stack, featuring Vite for rapid development, ReactJS for a modular component-based architecture, and Tailwind CSS with PostCSS for utility-first, responsive styling. It includes React Router for efficient client-side navigation and Lucide React for a rich set of customizable icons, supporting a seamless and flexible UI development process.

## Features
- ⚡ Lightning-fast development and build with Vite
- 🎨 Utility-first styling using Tailwind CSS
- 🌐 Client-side routing with React Router DOM
- 🎉 Scalable and modern icons with Lucide React
- 📱 Responsive design and mobile-first approach

## Tech Stack
- ReactJS
- Vite (bundler)
- Tailwind CSS (styling) with PostCSS[^1]
- Lucide React (icons)[^2] 
- React Router DOM (routing)

## Getting Started
> Prerequisites:
> Prerequisites: Make sure you have Node.js[^3] and npm installed on your system, as well as Git[^4].

### Installation

1. On GitHub, navigate to the main page of the repository.

2. Above the list of files, click <> Code.

3. Copy the URL for the repository.
    - To clone the repository using HTTPS, under "HTTPS", then copy the link.
    - To clone the repository using an SSH key, including a certificate issued by your organization's SSH certificate authority, click SSH, then copy the link.
    - To clone a repository using GitHub CLI, click GitHub CLI, then copy the link.

4. Open your terminal.

5. Change the current working directory to the location where you want the cloned directory.

6. Type `git clone`, and then paste the URL you copied earlier.
```
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY
```

7. Press Enter to create your local clone.
```
  git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY
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
- `node -v` — Displays the current Node.js version.
- `npm -v` — Displays the current npm version.

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


[^1]: Tailwind CSS documentation: [Tailwind CSS](https://tailwindcss.com/docs/content-configuration).
[^2]: Lucide React icons: [Lucide React](https://lucide.dev/).
[^3]: [Node.js installer](https://nodejs.org/en) — Download and run the installer. Click `"Next"` through each step to complete the installation. Once finished, open your terminal and type `npm -v` and `node -v` to verify the installation was successful.
[^4]: [Git installer](https://git-scm.com/downloads) — Download and run the installer. Click "Next" through each step to complete the installation. Once finished, open your terminal and type git --version to verify the installation was successful.
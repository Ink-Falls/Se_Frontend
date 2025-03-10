# AralKademy Frontend

![AralKademy Logo](src/assets/images/ARALKADEMYLOGO.png)

A modern Learning Management System (LMS) built with React and Vite, designed to provide an interactive learning experience for NSTP-LTS students and partner communities.

## Features 🚀

- ⚡ **Fast Development**: Powered by Vite for rapid development and hot module replacement
- 🎨 **Modern UI**: Built with Tailwind CSS for utility-first styling
- 🔐 **Secure Authentication**: JWT-based authentication with reCAPTCHA integration
- 📱 **Responsive Design**: Mobile-first approach for all screen sizes
- 🌐 **RESTful API**: Clean API integration with modular service architecture
- 🔄 **State Management**: Efficient React hooks and context for state management

## Tech Stack 💻

- **Framework**: [React](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Routing**: [React Router](https://reactrouter.com/)
- **Testing**: [Vitest](https://vitest.dev/)

## Prerequisites 📋

Before you begin, ensure you have installed:
- [Node.js](https://nodejs.org/) (v16.0.0 or higher)
- [npm](https://www.npmjs.com/) (v7.0.0 or higher)
- [Git](https://git-scm.com/)

## Getting Started 🚀

1. Clone the repository:
```bash
git clone https://github.com/your-username/Se_Frontend.git
cd Se_Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Environment setup:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
VITE_REACT_APP_API_URL=your_api_url_here
VITE_REACT_APP_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
```

5. Start the development server:
```bash
npm run dev
```

## Available Scripts 📜

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

## Project Structure 📁

```
Se_Frontend/
├── public/                 # Static assets
│   └── ARALKADEMYICON.png
├── src/
│   ├── assets/            # Images and media files
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   │   ├── Admin/
│   │   ├── Enrollment/
│   │   ├── Errors/
│   │   ├── General/
│   │   ├── Learner/
│   │   └── Teacher/
│   ├── services/         # API service modules
│   ├── utils/           # Utility functions
│   ├── context/         # React context providers
│   ├── routes/          # Application routes
│   ├── App.jsx         # Root component
│   └── main.jsx        # Entry point
├── tests/              # Test files
├── .env.example        # Environment variables template
├── .gitignore         # Git ignore rules
├── index.html         # HTML entry point
├── package.json       # Project dependencies
├── tailwind.config.js # Tailwind CSS configuration
├── vite.config.js     # Vite configuration
└── README.md          # Project documentation
```

## Environment Variables 🔑

The following environment variables are required:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_REACT_APP_API_URL` | Backend API URL | Yes |
| `VITE_REACT_APP_RECAPTCHA_SITE_KEY` | Google reCAPTCHA site key | Yes |

## API Documentation 📚

Our API documentation is available at:
- Development: `http://localhost:4000/api-docs/`
- Production: ``

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Testing 🧪

Run the test suite:
```bash
npm run test
```

## Deployment 🚀

Build for production:
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Browser Support 🌐

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Safari |
| --------- | --------- | --------- | --------- |
| last 2 versions | last 2 versions | last 2 versions | last 2 versions |

## License 📄

This project is licensed under a modified MIT License. Copyright (c) 2024 University of Santo Tomas - National Service Training Program (NSTP-LTS). 

**Important Restrictions:**
- Not for sale or commercial use
- Intended specifically for schools under UST NSTP-LTS program
- Primary beneficiary: Asuncion Consunji Elementary School

See the [LICENSE](LICENSE) file for full details.

## Support 💬

For support, email [REDACTED] or join our [REDACTED] channel.

## Acknowledgments 🙏

- [React Documentation](https://reactjs.org/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

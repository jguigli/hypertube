# Frontend du projet Hypertube:

React (typescript) + Vite + TailwindCSS

```bash
frontend
├── README.md
├── eslint.config.js            # Eslint configuration
├── index.html                  # HTML root template
├── package.json                # List the dependencies
├── node_modules                # Dependencies
├── src
│   ├── assets                  # Static assets (images, fonts, etc.)
│   │   └── react.svg
│   ├── components              # Reusable components
│   │   ├── Footer.tsx
│   │   ├── Layout.tsx
│   │   └── Navbar.tsx
│   ├── contexts                # Context providers for state management
│   │   └── AuthContext.tsx
│   ├── main.tsx                # Entry point of the application
│   ├── pages                   # Page components
│   │   ├── 404.tsx
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── VideoView.tsx
│   ├── router                  # Routing configuration
│   │   └── Router.tsx
│   ├── services                # API services
│   │   └── loginService.tsx
│   ├── styles                  # Stylesheets
│   │   ├── App.css
│   │   └── index.css
│   ├── types                   # Type definitions
│   │   └── User.tsx
│   ├── utils                   # Utility functions
│   └── vite-env.d.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── yarn.lock
```

## Links:

- [Documentation React](https://fr.react.dev/reference/react)
- [Documentation Vite](https://vite.dev/guide/)
- [Documentation TailwindCSS](https://tailwindcss.com/docs)

---

## Dependencies:

- React Router Dom
# <div align="center">Codophile 🎨</div>

<div align="center">

### The Ultimate Visual CSS Playground & Tailwind Generator

**Master CSS through real-time experimentation. Visual controls, instant feedback, production-ready code.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-purple?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

[Live Demo](https://codophile.in) • [Report Bug](https://github.com/digicraft-one/codophile/issues) • [Request Feature](https://github.com/digicraft-one/codophile/issues)

</div>

---

## 🚀 Overview

**Codophile** is designed for developers who want to bridge the gap between visual design and code. Whether you're a beginner struggling with Flexbox alignment or a pro needing a quick `box-shadow` generator, Codophile provides an intuitive interface to manipulate CSS properties and verify the results instantly.

Stop guessing values. **See** what you code.

## ✨ Key Features

-   **🎨 visual Playground**: Interactive controls (sliders, toggles, color pickers) for CSS properties.
-   **⚡ Real-time Preview**: See changes instantly as you tweak values.
-   **🛠️ Dual Output**: Generate both **Raw CSS** and **Tailwind CSS** utility classes simultaneously.
-   **📱 Fully Responsive**: Optimized for desktop, tablet, and mobile devices.
-   **🌓 Modern UI**: Built with a sleek, dark-mode-first aesthetic using Glassmorphism principles.
-   **💾 PWA Support**: Installable as a native desktop or mobile app for offline access.
-   **🔍 SEO Optimized**: Server-side rendered pages with dynamic sitemaps and rich metadata.

## 🧰 Tech Stack

Built with the latest and greatest web technologies:

-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
-   **Library**: [React 19](https://react.dev/)
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Code Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)

## 📦 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

-   Node.js 18+ installed
-   npm, yarn, or pnpm

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your_algolia_search_key
ALGOLIA_ADMIN_KEY=your_algolia_admin_key
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=your_algolia_index_name
MONGODB_URI=mongodb://127.0.0.1:27017/codophile
JWT_SECRET=your_jwt_secret_key
```

> **Note:** `NEXT_PUBLIC_*` variables are inlined into the client-side bundle at **build time**. The `ALGOLIA_ADMIN_KEY`, `MONGODB_URI`, and `JWT_SECRET` are server-side secrets used only at **runtime**.

### Admin Setup

To access the admin dashboard, you need to create an initial super admin account. Once your MongoDB is running and your `.env.local` is configured, you can create the first admin using the following command:

```bash
npm run create-admin
```

This will create a default super admin with:
- **Email:** `admin@codophile.com`
- **Password:** `admin123`

To create a specific admin, you can provide arguments:

```bash
npm run create-admin -- "your_email@example.com" "your_password" "Your Name"
```

### Interpretation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/digicraft-one/codophile.git
    cd codophile
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  **Open your browser**
    Navigate to [http://localhost:3000](http://localhost:3000) to confirm the installation.

## 🐳 Docker Support

You can also run this project using Docker.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- `.env.local` file configured (see [Environment Variables](#environment-variables) above)

### Running with Docker Compose (Recommended)

Use the `--env-file` flag so Docker Compose reads `.env.local` for build arguments and runtime variables.

1.  **Build and run the container**
    ```bash
    docker compose --env-file .env.local up -d --build
    ```

2.  **Access the application**
    Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running with Docker CLI

1.  **Build the image** (pass `NEXT_PUBLIC_*` vars as build args)
    ```bash
    docker build \
      --build-arg NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id \
      --build-arg NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your_algolia_search_key \
      --build-arg NEXT_PUBLIC_ALGOLIA_INDEX_NAME=your_algolia_index_name \
      -t codophile .
    ```

2.  **Run the container** (pass runtime env vars via `--env-file`)
    ```bash
    docker run -p 3000:3000 --env-file .env.local codophile
    ```

## 🎮 How to Use

1.  **Select a Category**: Choose from `CSS` or `Tailwind` playgrounds from the simplified navigation.
2.  **Pick a Property**: navigate to specific modules like `Flexbox`, `Grid`, `Shadows`, or `Transforms`.
3.  **Experiment**: Use the sidebar controls to adjust values.
4.  **Copy Code**: Click the "Copy" button to grab the generate CSS or Tailwind classes for your project.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📬 Contact

**Codophile Team** - [hello@codophile.in](mailto:codophile2026@gmail.com)

Project Link: [https://github.com/digicraft-one/codophile](https://github.com/digicraft-one/codophile)

---

<div align="center">
  <sub>Built with ❤️ by the <a href="https://codophile.in">Codophile Team</a></sub>
</div>

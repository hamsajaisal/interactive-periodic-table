# Interactive Periodic Table — Accessible Classroom Edition

An accessible, interactive periodic table of chemical elements built with pure HTML, CSS, and JavaScript. Specifically designed with screen reader and keyboard-only users in mind, featuring roving focus controls, ARIA live announcements, and touch support.

![License](https://img.shields.io/github/license/hamsajaisal/interactive-periodic-table)
![GitHub Pages](https://img.shields.io/badge/deployed-GitHub%20Pages-brightgreen)

## 🌐 Live Demo
The application is deployed on GitHub Pages. You can view it here:
👉 **[Live Interactive Periodic Table](https://hamsajaisal.github.io/interactive-periodic-table/)**

*(Note: To make the live link work, please ensure you've enabled GitHub Pages on the `main` branch in your repository settings).*

---

## ✨ Features

- **Classroom Accessibility (A11y)**:
  - Full keyboard navigation (Arrow keys, `Home`, `End`, `Enter`, `Space`, `Esc`).
  - Screen reader announcements using an `aria-live` polite region.
  - Focus trap inside the element details modal.
  - Roving `tabindex` management to ensure a clean keyboard flow.
- **Visual & Educational Features**:
  - Color-coding by element family/category.
  - Interactive **Bohr-style atomic orbit diagrams** drawn dynamically in SVG based on electron configurations.
  - Toggleable view modes: view by Chemical Family or State at Room Temperature (solid, liquid, gas).
  - Highlighting/Filtering elements by family.
- **Search Functionality**:
  - Search by chemical symbol (e.g., `H`, `Fe`, `Au`) with a flashing visual cue to locate the element quickly.
- **Mobile Friendly**:
  - On-screen touch direction pad (D-pad) for easy navigation on phones and tablets.

---

## 🛠️ Folder Structure

```
├── index.html   # Clean HTML structure and modals
├── styles.css   # Modern, responsive theme and layouts
├── data.js      # Isolated 118-element dataset
└── app.js       # Grid rendering, filtering, search, and navigation logic
```

---

## 🚀 Running Locally

No installation or build process is required! Since this project is built using vanilla web technologies, you can open it directly in any browser:

1. Clone this repository:
   ```bash
   git clone https://github.com/hamsajaisal/interactive-periodic-table.git
   ```
2. Open the directory:
   ```bash
   cd interactive-periodic-table
   ```
3. Open `index.html` in your browser.

---

## 🔧 Enabling GitHub Pages (Hosting)

If you haven't enabled hosting yet, follow these quick steps:

1. Go to your repository settings on GitHub: `https://github.com/hamsajaisal/interactive-periodic-table/settings`.
2. Select **Pages** from the left sidebar.
3. Under **Build and deployment** > **Branch**, select `main` and `/ (root)`.
4. Click **Save**.
5. Wait about 30 seconds for the deployment to finish, and your site will be live!

---

## 📝 License

This project is licensed under the MIT License. Feel free to use and adapt it for educational purposes.

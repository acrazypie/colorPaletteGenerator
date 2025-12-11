# Color Palette Generator

A modern web application for generating beautiful, harmonious color palettes with ease. Perfect for designers, developers, and creative professionals who need quick color inspiration.

Italian version: [README_IT.md](README_IT.md)

## Features

✨ **Key Features:**

-   🎨 Generate random color palettes with a single click
-   🔄 Regenerate individual colors or entire palettes
-   📋 Copy colors to clipboard in hex format
-   🌙 Dark/Light theme toggle for comfortable viewing
-   📱 Fully responsive design for all devices
-   ⌨️ Keyboard shortcuts for quick access
-   💾 Save favorite palettes (coming soon)
-   🎯 Multiple color harmony modes (coming soon)

## Getting Started

### Prerequisites

-   Modern web browser (Chrome, Firefox, Safari, Edge)
-   No installation required - it's a web-based application

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/colorPaletteGenerator.git
cd colorPaletteGenerator
```

2. Open the application:

```bash
# Simply open index.html in your browser
open index.html
```

Or use a local development server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (with http-server)
npx http-server
```

Then navigate to `http://localhost:8000` in your browser.

## Usage

### Basic Usage

1. **Generate Palette**: Click the "Generate" button to create a new random color palette
2. **Copy Color**: Click on any color swatch to copy its hex code to your clipboard
3. **Lock Color**: Lock individual colors to keep them when regenerating
4. **Toggle Theme**: Use the theme button to switch between light and dark modes

## Project Structure

```
colorPaletteGenerator/
├── index.html              # Main HTML file
├── css/
│   └── style.css           # Stylesheet
├── js/
│   ├── main.js             # Main application logic
│   ├── colorPaletteGenerator.js  # Color generation algorithms
│   └── theme.js            # Theme management
├── static/
│   ├── fonts/              # Custom fonts
│   └── images/             # Images and icons
├── README.md               # This file
└── LICENSE                 # License information
```

## Technologies Used

-   **HTML5** - Semantic markup
-   **CSS3** - Modern styling with flexbox/grid
-   **JavaScript (ES6+)** - Dynamic functionality
-   **SVG** - Icons and graphics

## Features Explained

### Color Generation

The generator uses carefully tuned algorithms to create harmonious color palettes that work well together. Colors are generated in HSL space to ensure better visual balance.

### Theme Support

Switch between light and dark themes with a single click. Your preference is remembered in local storage.

### Responsive Design

Works seamlessly on desktop, tablet, and mobile devices with optimized layouts for each screen size.

## Browser Support

| Browser | Support |
| ------- | ------- |
| Chrome  | ✅ Full |
| Firefox | ✅ Full |
| Safari  | ✅ Full |
| Edge    | ✅ Full |
| IE 11   | ❌ No   |

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate comments.

## Future Enhancements

-   💾 Save and manage color palettes
-   🎨 Multiple color harmony modes (complementary, analogous, triadic, etc.)
-   📤 Export palettes in various formats (JSON, CSS, PNG)
-   🔍 Color picker integration
-   📚 Color history
-   🎯 Custom color ranges

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Created with ❤️ by Elisa

## Acknowledgments

-   Inspired by modern color palette tools
-   Thanks to the open-source community for libraries and resources
-   Icons from Bootstrap Icons

## Support

Have questions or found a bug?

-   📧 Open an issue on GitHub
-   💬 Feel free to contribute improvements

---

**Happy color picking!** 🎨

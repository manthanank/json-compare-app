# Json Compare App

A modern web application that allows users to compare and visualize differences between JSON objects. Built with Angular and Tailwind CSS.

## Features

- **JSON Comparison**: Easily compare two JSON objects and see their differences
- **Visual Differences**: Clear visualization of added, removed, and changed values
- **Dark/Light Mode**: Support for both dark and light themes with automatic detection of system preferences
- **Responsive Design**: Works well on all device sizes
- **Format JSON**: Automatically format and prettify JSON inputs
- **Visitor Tracking**: Anonymous visitor count tracking
- **Real-time Updates**: Uses Angular's signal-based reactivity for instant feedback

## Technologies Used

- **Angular 19**: Latest version with signals for state management
- **Tailwind CSS 4**: For responsive and utility-first styling
- **TypeScript**: For type-safe code
- **RxJS**: For handling asynchronous operations

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm (v9+)

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/manthanank/json-compare-app.git 
    cd json-compare-app
    ```

2. Navigate to the project directory:

   ```bash
   cd json-compare-app
   ```

3. Install dependencies:

   ```bash
    npm install
    ```

4. Start the development server:

    ```bash
    npm start
    ```

5. Open your browser and navigate to `http://localhost:4200`
6. You should see the application running.

## Usage

1. Paste your source JSON in the left textarea
2. Paste your target JSON in the right textarea
3. Click "Compare JSON" to see the differences
4. Toggle between dark and light mode using the icon in the upper right

## Building for Production

Run `npm run build` to build the project for production. The build artifacts will be stored in the `dist/` directory.

## License

This project is open source and available under the MIT License.

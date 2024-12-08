# API Plugin Generator

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Setup](#setup)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

The API Plugin Generator is a web application that allows users to easily create plugins for various platforms (WordPress, Chrome Extension, Firefox Extension) that interact with APIs. This tool simplifies the process of generating boilerplate code for plugins, saving developers time and effort.

## Features

- Support for multiple platforms:
  - WordPress
  - Chrome Extension
  - Firefox Extension
- Customizable plugin settings:
  - Plugin Name
  - Description
  - API URL
  - API Method (GET/POST)
  - API Key
  - Custom Headers
- Logo upload functionality for branding your plugin
- Option to visualize API data
- API testing feature
- Generation history tracking
- Downloadable plugin as a ZIP file
- Responsive design for use on various devices

## Technology Stack

- **Frontend**:
  - Next.js (React framework)
  - TypeScript
  - HTML5
  - CSS3
  - Vanilla JavaScript (for client-side interactions)
- **Backend**:
  - Node.js
  - Next.js API Routes
- **File Handling**:
  - File System (fs) module
  - Archiver (for ZIP file creation)

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/RenaAbbasova/Api_Plagin_Generator
   cd api-plugin-generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update the `next.config.js` file:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     async rewrites() {
       return [
         {
           source: '/',
           destination: '/page.html',
         },
       ];
     },
   }

   module.exports = nextConfig
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open the application in your browser:
   ```
   http://localhost:3000
   ```

## API Reference

### Generate Plugin
- **URL**: `/api/generate-plugin`
- **Method**: `GET`
- **Request Body**:
  ```json
  {
    "pluginName": "My Plugin",
    "description": "A sample plugin",
    "apiUrl": "https://api.example.com",
    "method": "GET",
    "apiKey": "your-api-key"
  }
  ```
- **Response**: Returns a ZIP file.

### Test API
- **URL**: `/api/test-api`
- **Method**: `GET`
- **Request Body**:
  ```json
  {
    "apiUrl": "https://api.example.com",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer your-api-key"
    }
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "key1": "value1",
      "key2": "value2"
    }
  }
  ```

## Troubleshooting

### Common Issues
1. **Cannot install dependencies**
   - Ensure you have Node.js installed (`>=14.0`).
   - Run `node -v` and `npm -v` to verify installation.

2. **Application not starting**
   - Check if the `next.config.js` file is configured correctly.
   - Look for errors in the terminal and try `npm run dev` again.

3. **API not responding**
   - Verify that your API configuration is correct (API URL, method, headers, etc.).
   - Use tools like Postman to test the API endpoints independently.

4. **ZIP file not generated**
   - Ensure the `fs` and `archiver` modules are properly installed.
   - Check server logs for errors related to file handling.

## Contributing

We welcome contributions! To get started:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Add your feature description"
   ```
4. Push the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request and describe your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.


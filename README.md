# Art Institute of Chicago React DataTable

## Overview
This project is a React + TypeScript application that displays artwork data from the [Art Institute of Chicago API](https://api.artic.edu/api/v1/artworks). It uses **PrimeReact DataTable** for rendering data and implements **server-side pagination** and **persistent row selection**.

## Features
- Display artwork data: `title`, `place_of_origin`, `artist_display`, `inscriptions`, `date_start`, `date_end`.
- Server-side pagination: fetches data per page from the API.
- Row selection with checkboxes.
- Persistent selection across pages.
- Custom row selection panel via overlay.

## Tech Stack
- React + TypeScript
- Vite (build tool)
- PrimeReact (UI components)
- Netlify (deployment)

## Live Demo
[Deployed Application URL](https://your-netlify-url.netlify.app)

## How to Run Locally
```bash
git clone https://github.com/YOUR_USERNAME/artic-react-datatable.git
cd artic-react-datatable
npm install
npm run dev

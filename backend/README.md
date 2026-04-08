# Civik Shield Backend API

Backend server for Civik Shield - A civic issue reporting platform for road potholes, street lights, garbage, and women safety issues.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start MongoDB (if not running):
```bash
# Make sure MongoDB is running on localhost:27017
```

3. Create a `.env` file (optional - defaults are provided):
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/civik_shield
```

4. Start the server:
```bash
npm run dev    # Development mode with nodemon
# or
npm start      # Production mode
```

## API Endpoints

### Health Check
- **GET** `/api/health`
  - Returns server status

### Reports

#### Get All Reports
- **GET** `/api/reports`
  - Returns all reports sorted by creation date (newest first)
  - Response: Array of report objects

#### Get Single Report
- **GET** `/api/reports/:id`
  - Returns a single report by ID
  - Response: Report object

#### Create Report
- **POST** `/api/reports`
  - Content-Type: `multipart/form-data`
  - Body fields:
    - `title` (required): Report title
    - `description` (required): Report description
    - `category` (required): One of: `road_pothole`, `street_light`, `garbage`, `women_safety`
    - `latitude` (required): Latitude coordinate
    - `longitude` (required): Longitude coordinate
    - `address` (optional): Address string
    - `images` (optional): Image files (up to 5 images, 10MB each max)
  - Response: Created report object with success message

#### Update Report Status
- **PATCH** `/api/reports/:id`
  - Body: `{ "status": "submitted" | "in_progress" | "resolved" }`
  - Response: Updated report object

## Report Model

```javascript
{
  title: String (required),
  description: String (required),
  category: "road_pothole" | "street_light" | "garbage" | "women_safety",
  images: [String], // Array of image URLs
  location: {
    latitude: Number (required),
    longitude: Number (required),
    address: String (optional)
  },
  status: "submitted" | "in_progress" | "resolved" (default: "submitted"),
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

All errors return JSON in the format:
```json
{
  "error": "Error message"
}
```

Common status codes:
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `500`: Internal Server Error

## Image Uploads

- Images are stored in the `uploads/` directory
- Maximum 5 images per report
- Maximum 10MB per image
- Only image files are accepted
- Images are accessible at: `http://localhost:5000/uploads/filename.ext`


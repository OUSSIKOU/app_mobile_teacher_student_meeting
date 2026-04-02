# Easy Study - Full-Stack Mobile Learning Platform

A comprehensive mobile learning platform built with React Native (frontend) and Node.js/Express (backend), designed to connect students and teachers for online education.

## 🚀 Features

### For Students
- **User Authentication**: Secure login and registration
- **Student Dashboard**: View enrolled classes and upcoming sessions
- **Meeting Browser**: Discover and join available classes
- **Chat System**: Communicate with teachers
- **Profile Management**: Update personal information

### For Teachers
- **Teacher Dashboard**: Manage classes and view student statistics
- **Meeting Creation**: Schedule and organize classes
- **Student Management**: View enrolled students
- **Chat System**: Communicate with students
- **Profile Management**: Update teaching profile and experience

### General Features
- **JWT Authentication**: Secure token-based authentication
- **Real-time Updates**: Live data synchronization
- **Responsive Design**: Optimized for mobile devices
- **Cross-platform**: Works on iOS and Android

## 🏗️ Project Structure

```
easy-study/
├── server/                 # Backend (Node.js + Express)
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Authentication middleware
│   ├── config/            # Configuration files
│   └── server.js          # Main server file
├── client/                # Frontend (React Native + Expo)
│   ├── components/        # Reusable UI components
│   ├── screens/           # App screens
│   ├── navigation/        # Navigation configuration
│   ├── src/
│   │   ├── context/       # React Context (Auth)
│   │   └── services/      # API services
│   └── App.js             # Main app component
└── README.md
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React Native** - Mobile framework
- **Expo** - Development platform
- **React Navigation** - Navigation library
- **Axios** - HTTP client
- **AsyncStorage** - Local storage

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Expo CLI (`npm install -g expo-cli`)
- Git

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd easy-study
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your configuration:
# - MongoDB connection string
# - JWT secret key
# - Port number

# Start the server
npm run dev
```

The backend server will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start the Expo development server
npm start
```

### 4. Database Setup

Make sure MongoDB is running and accessible. The application will automatically create the necessary collections.

## 📱 Running the App

1. **Start the backend server** (from `/server` directory):
   ```bash
   npm run dev
   ```

2. **Start the React Native app** (from `/client` directory):
   ```bash
   npm start
   ```

3. **Open the app**:
   - Scan the QR code with Expo Go app (iOS/Android)
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/teachers` - Get all teachers
- `GET /api/users/students` - Get all students (teachers only)
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Meetings
- `GET /api/meetings` - Get meetings
- `POST /api/meetings` - Create meeting (teachers only)
- `GET /api/meetings/:id` - Get meeting details
- `POST /api/meetings/:id/join` - Join meeting (students only)
- `DELETE /api/meetings/:id/leave` - Leave meeting (students only)

## 🎨 UI Components

### Reusable Components
- **Input**: Customizable text input with validation
- **Button**: Multi-variant button component
- **Card**: Flexible card component for content display
- **MeetingCard**: Specialized card for meeting information
- **ProfileCard**: User profile display card

## 🔐 Authentication Flow

1. User registers/logs in through the mobile app
2. Backend validates credentials and returns JWT token
3. Token is stored in AsyncStorage on the device
4. Token is included in API requests for authentication
5. Middleware validates token for protected routes

## 🚀 Deployment

### Backend Deployment
1. Deploy to platforms like Heroku, DigitalOcean, or AWS
2. Set up environment variables
3. Configure MongoDB connection
4. Update CORS settings for production

### Frontend Deployment
1. Build the app using Expo
2. Deploy to App Store/Google Play Store
3. Update API base URL for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## 🔮 Future Enhancements

- Real-time chat with WebSocket
- Video calling integration
- File sharing capabilities
- Assignment submission system
- Grade management
- Push notifications
- Offline mode support

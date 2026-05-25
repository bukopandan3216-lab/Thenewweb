# FarmDirect - Farm to Table E-commerce Platform

FarmDirect is a modern, full-stack marketplace connecting local Philippine farmers directly with buyers. Built with React, Node.js, and MySQL.

## 📱 Features

### For Buyers
- Browse fresh produce from verified local farms
- Search and filter by category, location, farmer
- Add to cart and checkout with multiple payment options
- Track orders in real-time
- Review and rate products and sellers
- Wishlist and saved items (coming soon)

### For Farmers
- Sell products directly without middlemen
- Manage inventory and product listings
- Track orders and analytics
- View revenue and sales metrics
- Customer reviews and ratings
- Farmer dashboard with insights

### For Admins
- Manage users and farmer verification
- Monitor orders and marketplace health
- View analytics and reports
- Commission tracking
- Activity logs and system monitoring

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **React Router** - Navigation
- **Axios** - HTTP client
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **Leaflet** - Maps (for location features)

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **Multer** - File uploads
- **bcryptjs** - Password hashing

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MySQL (managed service)

## 📁 Project Structure

```
Thenewweb/
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── context/         # Auth & Cart context
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layers
│   │   ├── styles/          # Global CSS
│   │   ├── api.js          # Axios client
│   │   ├── utils.js        # Utility functions
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   ├── vercel.json         # Vercel config
│   └── dist/               # Build output
│
├── backend/
│   ├── config/             # Database & Multer config
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth & error handlers
│   ├── routes/             # API routes
│   ├── scripts/            # Database scripts
│   ├── database/           # Schema files
│   ├── uploads/            # User uploads (temp)
│   ├── server.js           # Express app
│   ├── package.json
│   ├── .env.example        # Environment template
│   ├── .env               # Actual credentials (.gitignore'd)
│   ├── render.yaml        # Render config
│   └── .gitignore
│
├── database (1).sql        # Original schema
├── DEPLOYMENT.md           # Deployment guide
├── PAYMENT_INTEGRATION.md  # Payment guide
└── README.md              # This file
```

## 🚀 Quick Start

### Local Development

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Install frontend dependencies
cd ../frontend
npm install

# 3. Setup database
cd ../backend
node scripts/init-db.js --admin --seed

# 4. Create .env files (see templates)

# 5. Run backend (Terminal 1)
npm run dev

# 6. Run frontend (Terminal 2)
cd ../frontend
npm run dev
```

Visit `http://localhost:5173` to see the app.

**Admin credentials**: `admin@farmdirect.ph` / `admin123`

## 📚 API Documentation

### Authentication Endpoints

```bash
POST   /api/auth/register        # Create account
POST   /api/auth/login           # Login
GET    /api/auth/profile         # Get user profile
PUT    /api/auth/profile         # Update profile
POST   /api/auth/change-password # Change password
```

### Product Endpoints

```bash
GET    /api/products             # List products (paginated)
GET    /api/products/:id         # Get product details
GET    /api/products/farmers     # List farmers
GET    /api/products/farmers/:id # Get farmer details
GET    /api/products/reviews/:id # Get product reviews
POST   /api/products/reviews     # Submit review
```

### Order Endpoints

```bash
POST   /api/orders               # Create order
GET    /api/orders/my            # Get user orders
POST   /api/orders/:id/cancel    # Cancel order
POST   /api/orders/:id/received  # Mark as received
```

### Admin Endpoints

```bash
GET    /api/admin/dashboard      # Admin overview
GET    /api/admin/users          # List all users
GET    /api/admin/users/pending  # Pending farmers
GET    /api/admin/products       # All products
GET    /api/admin/orders         # All orders
```

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts (buyer/farmer/admin)
- `farmer_profiles` - Farmer-specific data
- `buyer_profiles` - Buyer-specific data
- `products` - Product listings
- `orders` - Customer orders
- `order_items` - Items in each order
- `reviews` - Product reviews
- `payments` - Payment records
- `commissions` - Farmer commission tracking

See `backend/database/schema.sql` for full schema.

## 🔐 Security Features

- JWT token-based authentication
- Password hashing with bcryptjs
- CORS protection
- Input validation and sanitization
- File upload restrictions
- Role-based access control (RBAC)
- Secure database connection

## 📦 Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=farmdirect
JWT_SECRET=your_secret_here
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
COMMISSION_RATE=5
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 🎨 UI/UX Features

- Responsive design (mobile, tablet, desktop)
- Dark mode support ready
- Smooth animations with Framer Motion
- Loading states and error handling
- Toast notifications (coming soon)
- Image optimization
- Accessibility features

## 🧪 Testing

```bash
# Backend syntax check
node --check backend/server.js

# Frontend build verification
cd frontend
npm run build

# Backend build
cd backend
npm install
```

## 📈 Performance Optimizations

- Image lazy loading
- Code splitting with Vite
- API request optimization
- Database query indexing
- Gzip compression
- CDN ready

## 🐛 Known Issues & Roadmap

### Current Limitations
- Payment integration is placeholder (needs gateway setup)
- Email notifications not implemented
- SMS alerts not implemented
- Image compression not automatic
- Real-time notifications not implemented

### Coming Soon
- Enhanced farmer analytics dashboard
- Buyer wishlist/favorites
- Product search filters
- Ratings and reviews (UI implemented, need more fields)
- Notification system
- Admin analytics dashboard
- Seller rating system
- Commission management
- Refund system

## 📞 Support & Documentation

- **Deployment Guide**: See `DEPLOYMENT.md`
- **Payment Integration**: See `PAYMENT_INTEGRATION.md`
- **Database Setup**: See `backend/scripts/init-db.js`
- **API Testing**: Use Postman or cURL

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am "Add feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Create Pull Request

## 📄 License

Private project - Proprietary

## 👥 Team

Built by FarmDirect Development Team

---

## Quick Commands Reference

```bash
# Backend
cd backend
npm install              # Install dependencies
npm run dev              # Run in development
npm start                # Run in production
node scripts/init-db.js  # Initialize database

# Frontend
cd frontend
npm install              # Install dependencies
npm run dev              # Run dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Database
mysql -u root -p farmdirect < schema.sql  # Restore from file
mysqldump farmdirect > backup.sql         # Export database
node scripts/init-db.js --seed            # Seed sample data
```

## 🎯 Next Steps

1. Set up production database (AWS RDS / DigitalOcean MySQL)
2. Configure payment gateway integration
3. Set up email service (SendGrid/AWS SES)
4. Implement SMS notifications (Twilio)
5. Configure CDN for image delivery
6. Set up monitoring and error tracking
7. Create mobile app (React Native)
8. Add advanced analytics dashboard

---

**Last Updated**: May 25, 2026  
**Status**: Production Ready (with payment gateway integration pending)

#!/usr/bin/env node

/**
 * FarmDirect Database Initialization & Seeding Script
 * Usage: node scripts/init-db.js
 * 
 * This script:
 * - Creates the farmdirect database
 * - Runs the schema migrations
 * - Seeds sample data if --seed flag is passed
 * - Creates admin user if --admin flag is passed
 */

require('dotenv').config()
const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
}

const args = process.argv.slice(2)
const shouldSeed = args.includes('--seed')
const shouldCreateAdmin = args.includes('--admin')

async function init() {
  let connection
  try {
    console.log('📦 Connecting to MySQL...')
    connection = await mysql.createConnection(config)
    
    console.log('📝 Creating database...')
    await connection.query('CREATE DATABASE IF NOT EXISTS farmdirect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci')
    
    console.log('🔀 Using farmdirect database...')
    await connection.query('USE farmdirect')
    
    console.log('📋 Running schema migrations...')
    const schemaPath = path.join(__dirname, '../database/schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Split by semicolons and execute each statement
    const statements = schema.split(';').filter(s => s.trim())
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement)
      }
    }
    
    console.log('✅ Schema created successfully!')
    
    if (shouldCreateAdmin) {
      console.log('👨‍💼 Seeding admin user...')
      const hashedPassword = await bcrypt.hash('admin123', 12)
      await connection.query(
        `INSERT IGNORE INTO users (username, full_name, email, password, role, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['admin', 'Admin User', 'admin@farmdirect.ph', hashedPassword, 'admin', 'active']
      )
      console.log('✅ Admin user created: admin@farmdirect.ph / admin123')
      console.log('⚠️  IMPORTANT: Change this password in production!')
    }
    
    if (shouldSeed) {
      console.log('🌱 Seeding sample data...')
      
      // Create sample farmers
      const farmers = [
        { name: 'Maria Santos', store: 'Santos Farm', location: 'Benguet', province: 'CAR' },
        { name: 'Juan Dela Cruz', store: 'Dela Cruz Agri', location: 'Laguna', province: 'Calabarzon' },
        { name: 'Rosa Garcia', store: 'Garcia Vegetables', location: 'Nueva Ecija', province: 'Region III' },
      ]
      
      const farmerIds = []
      for (const farmer of farmers) {
        const hashedPw = await bcrypt.hash('farmer123', 12)
        const [result] = await connection.query(
          `INSERT INTO users (username, full_name, email, password, role, status, contact)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            farmer.store.toLowerCase().replace(/ /g, '_'),
            farmer.name,
            `${farmer.store.toLowerCase().replace(/ /g, '_')}@farmdirect.ph`,
            hashedPw,
            'farmer',
            'active',
            '09161234567',
          ]
        )
        farmerIds.push(result.insertId)
        
        await connection.query(
          `INSERT INTO farmer_profiles (user_id, store_name, farm_location, province, bio)
           VALUES (?, ?, ?, ?, ?)`,
          [
            result.insertId,
            farmer.store,
            farmer.location,
            farmer.province,
            `Fresh organic produce from ${farmer.store} farm.`,
          ]
        )
      }
      
      // Create sample products
      const products = [
        { farmer: 0, name: 'Tomatoes', category: 'vegetables', price: 45, unit: 'kg', stock: 50 },
        { farmer: 0, name: 'Cabbage', category: 'vegetables', price: 35, unit: 'kg', stock: 40 },
        { farmer: 1, name: 'Carrots', category: 'vegetables', price: 40, unit: 'kg', stock: 60 },
        { farmer: 1, name: 'Lettuce', category: 'vegetables', price: 55, unit: 'bundle', stock: 30 },
        { farmer: 2, name: 'Mangoes', category: 'fruits', price: 80, unit: 'kg', stock: 25 },
        { farmer: 2, name: 'Bananas', category: 'fruits', price: 50, unit: 'kg', stock: 45 },
      ]
      
      for (const product of products) {
        await connection.query(
          `INSERT INTO products (farmer_id, name, category, price, unit, stock_qty, availability)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            farmerIds[product.farmer],
            product.name,
            product.category,
            product.price,
            product.unit,
            product.stock,
            'Onhand',
          ]
        )
      }
      
      console.log('✅ Sample data seeded successfully!')
    }
    
    console.log('\n✨ Database initialization complete!')
    console.log('\nNext steps:')
    console.log('1. Update your .env file with correct database credentials')
    console.log('2. Run: npm start (to start the backend server)')
    console.log('3. The API will be available at http://localhost:5000')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    if (connection) await connection.end()
  }
}

init()

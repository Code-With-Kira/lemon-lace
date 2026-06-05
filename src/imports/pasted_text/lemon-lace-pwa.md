# Lemon & Lace Inventory and Sales Management System

Build a **production-ready Progressive Web Application (PWA)** named **Lemon & Lace Inventory and Sales Management System** using:

* React (latest version)
* TypeScript
* Vite
* Tailwind CSS
* Supabase
* IndexedDB
* Service Workers
* Background Sync API
* React Router
* React Hook Form
* Zustand (preferred) or Context API
* Chart.js or Recharts
* Modern React Hooks
* Responsive Mobile-First Design

---

# Project Goal

Create a complete Inventory and Sales Management System for Lemon & Lace Snacks and Drinks.

The application must support:

* Inventory Management
* Sales Management
* Reports and Analytics
* Authentication
* Offline Mode
* Automatic Data Synchronization
* PWA Installation
* Responsive Design
* Role-Based Security
* Real-Time Dashboard Updates

The application must work flawlessly on:

* iPhone (all models)
* Android phones (all sizes)
* Tablets
* Laptops
* Desktop computers
* Ultra-wide monitors

Requirements:

* No horizontal scrolling
* Mobile-first architecture
* Fast loading performance
* Touch-friendly controls
* Accessible UI
* Professional business-grade user experience

---

# Branding

Business Name:

Lemon & Lace Snacks and Drinks

Theme Colors:

Primary Pink: #FFC0CB
Light Pink: #FADADD
Rose Pink: #FFB6C1
White: #FFFFFF
Dark Text: #333333

Design Style:

* Modern
* Clean
* Minimal
* Professional
* Cute café aesthetic
* Glassmorphism cards
* Rounded corners
* Soft shadows
* Smooth transitions
* Elegant typography

---

# UI Readability and UX Requirements

The UI must prioritize usability and readability over visual effects.

Requirements:

* Minimum body text size: 16px
* Form labels: 14–16px
* Dashboard metrics: 24–36px
* High contrast text
* Never place pink text on light pink backgrounds
* Large touch targets (minimum 44px height)
* Responsive typography using clamp()
* Consistent spacing system (8px scale)
* Clear visual hierarchy
* Sticky actions on mobile forms
* Mobile-friendly navigation
* Accessible color contrast
* Skeleton loaders
* Error states
* Empty states
* Success states
* Loading indicators

All forms must be optimized for:

* One-handed phone usage
* Touch interactions
* Small screens

---

# Authentication Module

Use Supabase Authentication.

Features:

* Email Login
* Email Registration
* Forgot Password
* Reset Password
* Email Verification
* Remember Me
* Persistent Login
* Session Refresh
* Protected Routes
* Auto Logout on Expiration

## Login

Fields:

* Email
* Password

Features:

* Show/Hide Password
* Remember Me
* Forgot Password
* Sign Up Link
* Validation
* Loading State

## Registration

Fields:

* Full Name
* Email
* Password
* Confirm Password

Validation:

* Required Fields
* Minimum 8 Character Password
* Password Strength Indicator
* Confirm Password Matching

Features:

* Email Verification
* Success Notification
* Redirect to Login

## User Profile

Display:

* Avatar
* Full Name
* Email
* Account Creation Date

Features:

* Edit Profile
* Change Password

---

# Dashboard Module

Create a modern business dashboard.

Dashboard Cards:

* Total Products
* Total Inventory Value
* Today's Sales
* Weekly Sales
* Monthly Sales
* Total Transactions
* Low Stock Products
* Best Selling Products

Charts:

* Daily Sales Chart
* Weekly Sales Chart
* Monthly Sales Chart
* Category Distribution
* Sales Trend Analysis

Widgets:

* Recent Transactions
* Low Stock Alerts
* Top Selling Products
* Sync Status

---

# Inventory Management Module

## Features

* Add Product
* Edit Product
* Delete Product
* Search Products
* Filter Products
* Sort Products
* Product Image Upload
* Stock Monitoring
* Low Stock Detection

## Product Fields

* Product ID
* Product Name
* Category
* Selling Price
* Stock Quantity
* Product Image
* Status
* Date Added
* Last Updated

## Categories (A–Z)

Display categories alphabetically in:

* Product Forms
* Filters
* Reports
* Dashboard
* Analytics
* Sales Product Selection

Categories:

* Add-Ons
* Buy 1 Take 1
* Choco Series
* Fresh Lemonade
* Fruit Soda
* Fruity Milk
* Ice Coffee
* Juice Drinks
* Milktea Series
* Siomai
* Siopao
* Snacks
* Solo
* Street Foods

## Sorting

Allow sorting by:

* Product Name
* Category
* Price
* Quantity
* Date Added

## Display

Desktop:

* Advanced Data Table
* Sticky Headers
* Pagination
* Bulk Actions
* Column Sorting

Mobile:

* Product Cards
* Quick Search
* Category Chips
* Touch-Friendly Actions

---

# Sales Module

## Features

* New Sale
* Multiple Products Per Sale
* Quantity Selection
* Automatic Totals
* Discount Support
* Receipt Generation
* Sales History

## Sales Fields

* Transaction ID
* Transaction Number
* Date
* Products Purchased
* Quantity
* Total Amount
* Payment Method

## Payment Methods

* Cash
* GCash
* Maya

## Receipt

Generate printable receipt containing:

* Business Name
* Transaction Number
* Date
* Purchased Items
* Quantity
* Price
* Total Amount
* Payment Method

---

# Reports Module

Generate:

* Daily Sales Report
* Weekly Sales Report
* Monthly Sales Report
* Inventory Report
* Low Stock Report
* Product Sales Report
* Best Selling Products Report

Features:

* Date Filters
* Search
* Export PDF
* Export Excel
* Print Reports

---

# Offline-First Architecture

Use IndexedDB.

Store locally:

* Products
* Sales
* Inventory Updates
* User Actions
* Sync Queue

Requirements:

* Fully operational offline
* Continue sales while offline
* Continue inventory updates while offline
* Queue all pending actions
* Automatic synchronization later

---

# Synchronization System

Use:

* Supabase
* Service Workers
* Background Sync API

When internet returns:

Automatically sync:

* Products
* Inventory Changes
* Sales Transactions
* User Updates

Sync Status Indicators:

* Online
* Offline
* Syncing
* Synced
* Error

Conflict Resolution:

* Prevent duplicate transactions
* Last-write-wins strategy
* Data integrity validation

---

# Progressive Web App Features

Implement:

* Service Worker
* Web Manifest
* Offline Caching
* Background Sync
* Install Prompt
* Version Updates
* Push-Ready Architecture

Users must be able to:

* Install on Android
* Install on iPhone
* Install on Desktop
* Use Offline
* Receive Update Notifications

---

# Navigation

Desktop:

* Collapsible Sidebar

Mobile:

* Bottom Navigation Bar
* Floating Action Button
* Hamburger Menu

Navigation Links:

* Dashboard
* Inventory
* Sales
* Reports
* Profile
* Settings
* Logout

---

# Settings Module

Features:

* Update Profile
* Change Password
* Theme Settings
* Data Sync Settings
* Application Information
* Cache Management

---

# Database Design (Supabase)

Create complete SQL schema.

## users

* id
* full_name
* email
* avatar_url
* created_at

## products

* id
* name
* category
* price
* stock_quantity
* image_url
* status
* created_at
* updated_at

## sales

* id
* transaction_number
* total_amount
* payment_method
* created_at

## sale_items

* id
* sale_id
* product_id
* quantity
* price

## sync_queue

* id
* action_type
* payload
* sync_status
* created_at

Implement:

* Foreign Keys
* Indexes
* Row Level Security
* Optimized Queries

---

# Responsive Design Requirements

Breakpoints:

Mobile:
320px–767px

Tablet:
768px–1023px

Laptop:
1024px–1439px

Desktop:
1440px+

Requirements:

* Mobile First
* Responsive Grid System
* Flexible Layouts
* Responsive Typography
* Responsive Tables
* Responsive Charts
* Responsive Forms
* No Horizontal Scrolling
* Accessible Components
* Consistent Spacing

---

# Security Requirements

Implement:

* Supabase Authentication
* Protected Routes
* Secure API Calls
* Input Validation
* XSS Protection
* Form Sanitization
* Session Protection
* Error Boundaries

---

# Code Quality Requirements

Generate:

* Complete Folder Structure
* TypeScript Interfaces
* Reusable Components
* Reusable Hooks
* Zustand Store
* API Services Layer
* IndexedDB Service Layer
* Sync Service Layer
* Utility Functions
* Route Guards
* Error Handling
* Form Validation
* Production-Ready Architecture

Use best practices for:

* React
* TypeScript
* Tailwind CSS
* Supabase
* PWA Development
* Offline-First Applications

---

# Deliverables

Generate the complete application including:

* Full React + TypeScript source code
* Vite configuration
* Tailwind configuration
* Supabase integration
* IndexedDB implementation
* Service Worker implementation
* Background Sync implementation
* Authentication system
* Dashboard
* Inventory Module
* Sales Module
* Reports Module
* Settings Module
* Responsive UI
* Database schema
* SQL setup scripts
* Folder structure
* Installation instructions

The final system must be production-ready, offline-capable, mobile-friendly, scalable, maintainable, and suitable for real-world use by Lemon & Lace Snacks and Drinks.

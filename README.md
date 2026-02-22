# SickleSense - AI-Powered Crisis Prevention System

![SickleSense](https://img.shields.io/badge/Status-Active-brightgreen) ![TypeScript](https://img.shields.io/badge/Frontend-TypeScript_95.4%25-blue) ![Python](https://img.shields.io/badge/Backend-Python_4%25-green) ![Hackathon](https://img.shields.io/badge/Event-Team_Invictus_Cavista_Hackathon-orange)

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [API Documentation](#api-documentation)
- [Component Documentation](#component-documentation)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Development Workflow](#development-workflow)

---

## 🎯 Project Overview

**SickleSense** is an AI-powered early-crisis prediction and prevention system designed for patients with Sickle Cell Disease. The application leverages advanced machine learning and computer vision technologies to monitor patient health metrics in real-time, detect warning signs of impending crises, and facilitate timely medical intervention.

### Problem Statement
Sickle Cell Disease patients face unpredictable vaso-occlusive crises that can be life-threatening. Early detection of crisis indicators is crucial for prevention and management. SickleSense bridges this gap by providing:

- **Real-time Health Monitoring**: Video-based hydration compliance tracking
- **Visual Crisis Indicators**: AI-powered jaundice detection through eye analysis
- **Multi-role Support System**: Patient, Caregiver, and Consultant roles
- **Secure Data Management**: Role-based access control and encrypted health records

---

## ✨ Key Features

### 🔐 Authentication & Role Management
- **Three User Roles**:
  - **Patient**: Primary user with health data and unique patient code (SC-XXXX format)
  - **Caregiver**: Family member linked to patient via patient code
  - **Consultant**: Healthcare provider with access to patient analytics

- **Secure Registration**: Email-based signup with password protection and genotype tracking
- **Unique Patient Codes**: SC-XXXX format codes for easy patient-caregiver linking

### 📹 Hydration Monitoring
- **Video-Based Verification**: Uses Gemini 2.5-Flash AI to analyze drinking videos
- **Fraud Detection**: Advanced checklist verification including:
  - Container tilt detection
  - Mouth contact verification
  - Water presence validation
  - Swallow detection via throat movement analysis
- **Compliance Tracking**: Records verified hydration logs with timestamps

### 👁️ Jaundice Detection
- **AI-Powered Eye Analysis**: Analyzes sclera (white of the eye) for yellowing
- **Severity Index** (0.0 - 10.0):
  - 0.0 - 2.0: Normal/Healthy
  - 2.1 - 5.0: Mild yellowing (Observation required)
  - 5.1 - 8.0: Significant yellowing (Possible impending crisis)
  - 8.1 - 10.0: Severe jaundice (Immediate clinical attention required)

### 📊 Health Dashboard
- Real-time health metrics visualization
- Historical health log tracking
- Crisis risk indicators
- Data charts and analytics using Recharts

### 🔄 Multi-Device Support
- Responsive design for desktop, tablet, and mobile
- Real-time data synchronization
- Seamless cross-platform experience

---

## 🏗️ Architecture

### System Overview

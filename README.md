# 🔐 LitEncryptDecrypt

A Web3-based encryption and decryption system built using **Lit Protocol** for secure data access control, integrated into an **Initial Public Offering (IPO) simulation system** developed during the ETHIndia hackathon.

---

## 🚀 Overview

LitEncryptDecrypt demonstrates how decentralized access control and encryption can be applied to real-world financial workflows like an IPO system.

It leverages **Lit Protocol** to enable secure encryption and decryption of sensitive IPO data such as investor details, bids, and allocation records, ensuring only authorized users can access specific information.

This project was built and showcased at **ETHIndia**, where it received recognition for its Web3 implementation approach.

---

## 🧠 Key Idea

Traditional IPO systems rely on centralized servers for handling sensitive financial data. This project replaces that with a decentralized encryption model using Lit Protocol, enabling:

- Secure data encryption
- Wallet-based access control
- Decentralized authorization logic

---

## 🏗️ Features

- 🔐 Encrypt & decrypt IPO-related sensitive data
- 🧾 IPO workflow simulation (investors, bids, allocations)
- 🔑 Role-based access control using Lit Protocol
- 📄 Secure PDF encryption/decryption handling
- ⚡ Node.js backend utilities
- 🧪 Multiple test scripts for validation

---


---

## 🔐 How It Works

1. **Input Data**
   - IPO-related sensitive data is loaded (JSON/PDF)

2. **Encryption**
   - Data is encrypted using Lit Protocol access control conditions

3. **Storage / Transfer**
   - Encrypted data is securely stored or transmitted

4. **Decryption**
   - Only authorized wallet users can decrypt the data

5. **Output**
   - Secure IPO report or decrypted dataset is generated

---

## ⚙️ Tech Stack

- Node.js
- JavaScript
- Lit Protocol (Web3 encryption & access control)
- PDF processing utilities
- JSON data handling

---

## 📁 Project Structure


LitEncryptDecrypt/
│
├── App.js # Main application logic
├── utils.js # Encryption/decryption helpers
├── test.js # Test cases
├── test1.js - test10.js # Additional test modules
├── IPODetails.json # IPO dataset
├── A.pdf # Sample input PDF
├── decrypted_output.pdf # Output after decryption
├── package.json
├── package-lock.json
└── .env # Environment variables

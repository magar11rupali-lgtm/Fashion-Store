# Day 1: Introduction & Environment Setup

## 🎯 Learning Objectives

By the end of today, you will:
- Understand what e-commerce websites are
- Learn about Next.js and Strapi
- Set up your development environment
- Create your project structure

## ⏱️ Estimated Time: 4-5 hours

---

## 📝 Tasks & Subtasks

### Task 1.1: Understanding the Project

**Subtask 1.1.1: Watch introduction video about e-commerce websites**
- Search YouTube for "What is an e-commerce website"
- Watch a 5-10 minute introduction video
- Take notes on key features

**Subtask 1.1.2: Explore 2-3 fashion websites**
- Visit websites like Zara, H&M, or ASOS
- Note features you see:
  - Product listings
  - Search bars
  - Shopping carts
  - Filters
  - Product details
  - Checkout process

**Subtask 1.1.3: Create a simple sketch**
- Draw your dream fashion store on paper
- Include: header, products, footer
- Think about colors and layout

---

### Task 1.2: Install Required Software

**Subtask 1.2.1: Install Node.js (v18 or higher)**

1. Go to [nodejs.org](https://nodejs.org)
2. Download the LTS (Long Term Support) version
3. Run the installer
4. Follow installation prompts
5. Accept default settings

**Subtask 1.2.2: Install VS Code editor**

1. Go to [code.visualstudio.com](https://code.visualstudio.com)
2. Download for your operating system
3. Install with default settings
4. Open VS Code

**Subtask 1.2.3: Install Git for version control**

1. Go to [git-scm.com](https://git-scm.com)
2. Download for your operating system
3. Install with default settings

**Subtask 1.2.4: Verify installations**

Open terminal/command prompt and run:

```bash
node --version
# Should show v18.x.x or higher

npm --version
# Should show version number (e.g., 9.x.x)

git --version
# Should show version number (e.g., 2.x.x)
```

---

### Task 1.3: Create Project Structure

**Subtask 1.3.1: Create main project folder**

```bash
# Navigate to where you want your project
cd Desktop

# Create main folder
mkdir fashion-store
cd fashion-store
```

**Subtask 1.3.2: Initialize Next.js project**

```bash
npx create-next-app@latest frontend --js --tailwind --app --no-src-dir
```

When prompted:
- Would you like to use TypeScript? → **No**
- Would you like to use ESLint? → **Yes**
- Would you like to use Tailwind CSS? → **Yes**
- Would you like to use `src/` directory? → **No**
- Would you like to use App Router? → **Yes**
- Would you like to customize the default import alias? → **No**

**Subtask 1.3.3: Initialize Strapi project**

```bash
npx create-strapi-app@latest backend --quickstart
```

This will:
- Create a backend folder
- Install all dependencies
- Start Strapi automatically
- Open admin panel in browser

**Subtask 1.3.4: Open projects in VS Code**

```bash
# Open VS Code in the fashion-store folder
code .
```

---

## 🤖 AI Prompts for Students

When you get stuck, try asking:

```
"Explain what Next.js is in simple terms for a 14-year-old"

"How do I check if Node.js is installed on my computer?"

"What is the difference between frontend and backend?"

"Help me troubleshoot: I'm getting an error when installing Next.js"

"Why do I need both Next.js and Strapi for my e-commerce website?"
```

---

## 📖 Tutorial Steps

### Step 1: Open Terminal/Command Prompt

**Windows:**
- Press `Win + R`
- Type `cmd` and press Enter

**Mac:**
- Press `Cmd + Space`
- Type `terminal` and press Enter

### Step 2: Navigate to Your Projects Folder

```bash
cd Desktop
# or wherever you want to create your project
```

### Step 3: Create Main Folder

```bash
mkdir fashion-store
cd fashion-store
```

### Step 4: Create Frontend (Next.js)

```bash
npx create-next-app@latest frontend --js --tailwind --app --no-src-dir
```

Wait 2-5 minutes for installation to complete.

### Step 5: Create Backend (Strapi)

```bash
npx create-strapi-app@latest backend --quickstart
```

Wait 5-10 minutes for installation to complete.

### Step 6: Test Your Setup

**Test Frontend:**

```bash
cd frontend
npm run dev
```

- Open browser to `http://localhost:3000`
- You should see the Next.js welcome page
- Press `Ctrl + C` to stop the server

**Test Backend:**

```bash
cd ../backend
npm run develop
```

- Browser should open to `http://localhost:1337/admin`
- You'll create an admin account tomorrow
- Press `Ctrl + C` to stop the server

---

## ✅ Testing & Validation

Make sure you can check all these boxes:

- [ ] Node.js is installed (v18+)
- [ ] npm is installed
- [ ] Git is installed
- [ ] VS Code is installed
- [ ] `fashion-store` folder exists
- [ ] `frontend` folder exists inside `fashion-store`
- [ ] `backend` folder exists inside `fashion-store`
- [ ] Next.js dev server runs on `localhost:3000`
- [ ] Strapi admin opens on `localhost:1337/admin`
- [ ] No error messages during installation

---

## 📁 Your Project Structure

After today, your folder structure should look like this:

```
fashion-store/
├── frontend/
│   ├── app/
│   ├── public/
│   ├── package.json
│   └── ...
└── backend/
    ├── src/
    ├── public/
    ├── package.json
    └── ...
```

---

## 🏠 Homework

Before Day 2, complete these tasks:

1. **Write 5 features** you want in your fashion store
   - Example: "I want a search bar to find products quickly"

2. **Take screenshots** of your favorite fashion website features
   - Save them in a folder for inspiration

3. **Explore VS Code**
   - Open the `frontend` folder
   - Look at the files created
   - Don't worry if you don't understand them yet!

4. **Create a color palette**
   - Choose 3-5 colors for your brand
   - Use [coolors.co](https://coolors.co) for inspiration

---

## 🐛 Common Errors & Solutions

### Error: "node is not recognized"
**Solution:** Node.js not installed properly. Reinstall and restart terminal.

### Error: "Port 3000 already in use"
**Solution:** Another app is using port 3000. Close it or use a different port:
```bash
npm run dev -- -p 3001
```

### Error: "Permission denied"
**Solution (Mac/Linux):** Add `sudo` before the command:
```bash
sudo npm install -g create-next-app
```

### Error: Installation is very slow
**Solution:** This is normal! Installing can take 5-10 minutes. Be patient.

---

## 📚 What You Learned Today

- ✅ What e-commerce websites are and their key features
- ✅ The difference between frontend (Next.js) and backend (Strapi)
- ✅ How to install development tools
- ✅ How to create a Next.js project
- ✅ How to create a Strapi project
- ✅ How to run development servers

---

## 🎉 Congratulations!

You've completed Day 1! You now have a fully set up development environment and are ready to start building your fashion e-commerce website.

**Tomorrow:** We'll learn about React components and build our homepage!

---

## 📖 Additional Reading (Optional)

- [What is Next.js?](https://nextjs.org/learn/foundations/about-nextjs)
- [What is Strapi?](https://docs.strapi.io/dev-docs/intro)
- [Introduction to React](https://react.dev/learn)

---

[← Back to Overview](./README.md) | [Day 2: React Components & Homepage →](./day-02-homepage.md)

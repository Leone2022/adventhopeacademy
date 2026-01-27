# 🔥 IMPORTANT: Correct URLs (Port 3001)

## ⚠️ Your app is running on PORT 3001, not 3000!

### ✅ Correct Login URLs:

**Admin/Staff:**
```
http://localhost:3001/auth/login
```
Email: `admin@adventhope.ac.zw`  
Password: `admin123`

**Parents:**
```
http://localhost:3001/portal/login
```
Email: `testparent@adventhope.ac.zw` OR Phone: `+263773102001`  
Password: `parent123`

**Students:**
```
http://localhost:3001/portal/login
```
Registration Number: `STU2024999`  
Password: `student123`

---

### 🎯 Quick Access Links

Click these to login:
- [Admin Login](http://localhost:3001/auth/login)
- [Parent/Student Portal Login](http://localhost:3001/portal/login)
- [Dashboard (after login)](http://localhost:3001/dashboard)

---

### ❌ Common Mistakes

**DON'T USE:** ~~http://localhost:3000~~ (wrong port!)  
**USE:** http://localhost:3001 ✅

The 404 error you saw was likely because you were using the wrong port!

---

### 📝 Note

If you see "Port 3000 is in use, trying 3001 instead" in your terminal, it means:
- Another process is using port 3000
- Next.js automatically switched to port 3001
- Always check which port your app is actually running on!

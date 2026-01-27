# 📚 Student Management System Guide
## Advent Hope Academy - Complete Student Records System

**Version:** 2.0
**Last Updated:** January 2026
**Status:** ✅ Production Ready

---

## 🎯 Overview

A comprehensive student management system with search, filtering, export capabilities, and detailed student profiles. All student data can be viewed, searched, and downloaded in multiple formats (PDF, Excel, Word).

---

## ✨ Features Implemented

### 1. **Student List View** (`/admin/students`)
- **Search Functionality**: Search by student number, name, email, or phone
- **Advanced Filters**: Filter by status, class, and gender
- **Statistics Dashboard**: View total students, active students, gender distribution
- **Quick Actions**: View individual student details
- **Responsive Table**: Professional data table with hover effects

### 2. **Export Capabilities** (List View)
Export all students or filtered results to:
- **PDF**: Professional formatted PDF with school header
- **Excel**: Multi-column spreadsheet with all student data
- **Word**: Formatted document table with student information

### 3. **Individual Student View** (`/admin/students/[id]/view`)
- **Complete Student Profile**: All personal, academic, and financial information
- **Tabbed Interface**:
  - Personal Information (demographics, contact, medical)
  - Academic & Attendance (grades, attendance records)
  - Documents (uploaded certificates and records)
- **Parent/Guardian Information**: Complete family details
- **Financial Status**: Account balance and payment history
- **Medical Records**: Allergies, conditions, blood type

### 4. **Individual Student Data Export**
Download complete student record in:
- **PDF**: Comprehensive student report
- **Excel**: Multi-sheet workbook (Personal, Parents, Grades, Attendance, Financial)
- **Word**: Professional formatted document

### 5. **Document Management**
- **View Uploaded Documents**:
  - Birth certificates
  - Academic records from previous schools
  - Medical records
  - Other supporting documents
- **Direct Download Links**: View documents in browser

---

## 📂 File Structure

```
app/
├── admin/
│   ├── students/
│   │   ├── page.tsx                    # Server component - fetch students
│   │   ├── client.tsx                  # Client component - list view with search/export
│   │   └── [id]/
│   │       └── view/
│   │           ├── page.tsx            # Server component - fetch single student
│   │           └── client.tsx          # Client component - detailed view with export
```

---

## 🚀 Usage Guide

### For Administrators:

#### **Viewing Student List**

1. Navigate to `/admin/students`
2. View statistics dashboard showing:
   - Total students enrolled
   - Active students count
   - Gender distribution
3. Use the search bar to find specific students
4. Apply filters for refined results

#### **Searching Students**

Search by:
- Student number (e.g., STU2024001)
- First name or last name
- Email address
- Phone number

**Example**: Type "John" to find all students named John

#### **Filtering Students**

Apply multiple filters simultaneously:
- **Status**: Active, Inactive, Graduated, Transferred, Suspended
- **Class**: Select from available classes
- **Gender**: Male, Female

Click "Clear Filters" to reset all filters

#### **Exporting Student Lists**

##### **Export to PDF**:
1. Click the "PDF" button
2. File automatically downloads as `students_YYYY-MM-DD.pdf`
3. Includes:
   - School header
   - Generation date
   - Student count
   - Table with all student data

##### **Export to Excel**:
1. Click the "Excel" button
2. File downloads as `students_YYYY-MM-DD.xlsx`
3. Includes 18 columns:
   - Student Number
   - Name (First, Last)
   - Gender, DOB
   - Contact information
   - Class, Status
   - Financial data
   - Medical information
   - Previous school details

##### **Export to Word**:
1. Click the "Word" button
2. File downloads as `students_YYYY-MM-DD.docx`
3. Formatted table with school branding

#### **Viewing Individual Student Details**

1. Click "View" button next to any student
2. Navigate through tabs:
   - **Personal Information**: Demographics, contact, medical
   - **Academic & Attendance**: Recent grades and attendance
   - **Documents**: View uploaded files

#### **Downloading Individual Student Data**

From student detail page:
1. Click "PDF", "Excel", or "Word" button at top right
2. File downloads with student number in filename
3. **PDF includes**:
   - Personal information
   - Parents/guardians
   - Medical information
   - Financial status
4. **Excel includes** (multiple sheets):
   - Personal Info
   - Parents
   - Grades
   - Attendance
   - Financial
5. **Word includes**:
   - Complete student profile
   - Parents details
   - Medical records

---

## 📊 Data Included in Exports

### List Export (All Students)
```
- Student Number
- Full Name
- Gender
- Date of Birth
- Email
- Phone
- Current Class
- Status
- Admission Date
- Account Balance
- Address
- Blood Group
- Allergies
- Medical Conditions
- Previous School
- Curriculum
- Boarding Status
```

### Individual Student Export
```
Personal Information:
- Student Number
- Full Name (First, Middle, Last)
- Gender, Date of Birth
- Email, Phone, Address
- National ID
- Birth Certificate Number
- Status, Admission Date
- Current Class, Curriculum
- Boarding Status

Medical Information:
- Blood Group
- Allergies
- Medical Conditions

Parents/Guardians:
- Name, Relationship
- Email, Phone
- Primary/Secondary contact
- Occupation, Employer
- Work phone

Academic:
- Recent grades by subject
- Term and academic year
- Score percentage

Attendance:
- Date, Status
- Remarks

Financial:
- Current balance
- Last payment date
- Last payment amount

Documents:
- Birth certificate
- Academic records
- Medical records
- Other documents
```

---

## 🔍 Search & Filter Examples

### Example 1: Find all active male students in Form 1A
```
1. Enter class filter: "Form 1A"
2. Select gender: "Male"
3. Select status: "Active"
4. Results show only matching students
```

### Example 2: Export all Form 2 students to Excel
```
1. Set class filter to "Form 2"
2. Click "Excel" button
3. Filtered results export to spreadsheet
```

### Example 3: Find student by registration number
```
1. Type "STU2024" in search box
2. All students from 2024 appear
3. Type full number "STU2024015" for exact match
```

---

## 🎨 UI Features

### Student List Page
- **Statistics Cards**: Visual dashboard at top
- **Search Bar**: Full-width search with icon
- **Filter Panel**: Collapsible filters section
- **Results Count**: Shows filtered vs total students
- **Action Buttons**: Color-coded export buttons (PDF=Red, Excel=Green, Word=Blue)
- **Responsive Table**: Mobile-friendly design
- **Status Badges**: Color-coded status indicators
- **Hover Effects**: Interactive table rows

### Student Detail Page
- **Back Navigation**: Return to list view
- **Export Toolbar**: Quick access to download options
- **Tabbed Interface**: Organized information sections
- **Information Cards**: Grouped related data
- **Icon Indicators**: Visual cues for data types
- **Badge System**: Priority indicators (Primary contact, Status, etc.)
- **Document Viewer**: Links to uploaded files

---

## 🔐 Security & Permissions

### Access Control:
- **List View**: SUPER_ADMIN, SCHOOL_ADMIN
- **Detail View**: SUPER_ADMIN, SCHOOL_ADMIN, TEACHER

### Data Protection:
- Server-side data fetching
- Session validation
- Role-based access control
- Secure file storage

---

## 📱 Responsive Design

All pages are fully responsive:
- **Desktop**: Full table with all columns
- **Tablet**: Optimized grid layout
- **Mobile**: Stacked cards with essential info

---

## 🛠️ Technical Details

### Dependencies Installed:
```bash
- jspdf                     # PDF generation
- jspdf-autotable          # PDF tables
- xlsx                     # Excel generation
- docx                     # Word document generation
- file-saver               # File download handling
- @types/file-saver        # TypeScript types
```

### Export Functions:

#### PDF Export:
```typescript
// Uses jsPDF with autotable plugin
- Header with school name
- Formatted tables
- Auto-pagination
- Professional styling
```

#### Excel Export:
```typescript
// Uses xlsx library
- Multi-sheet workbooks
- Column width optimization
- Data type preservation
- Formula support ready
```

#### Word Export:
```typescript
// Uses docx library
- Professional formatting
- Tables with styled headers
- Paragraph spacing
- Alignment control
```

---

## 📋 Integration with Existing System

### Connects With:
- **Student Registration**: Displays students created via `/admin/create-accounts`
- **Authentication System**: Uses NextAuth for access control
- **Database**: Prisma ORM with PostgreSQL
- **Document Uploads**: References uploaded files from `/api/upload`

### Data Sources:
- Students table (main)
- Users table (authentication)
- Classes table (current class)
- Parents table (guardians)
- Grades table (academic)
- Attendance table (attendance)
- StudentAccount table (financial)

---

## 🚨 Troubleshooting

### Issue: Export buttons not working
**Solution**: Check browser console for errors. Ensure all libraries are installed.

### Issue: No students showing
**Solution**:
1. Check if students exist in database
2. Verify user has correct permissions
3. Check filters aren't excluding all results

### Issue: Search not working
**Solution**: Clear search box and filters, then try again

### Issue: Document links not opening
**Solution**: Ensure files exist in `/public/uploads/` directory

---

## 🎯 Best Practices

### When Exporting Data:
1. **Filter first** before exporting to get relevant data
2. **Use appropriate format**:
   - PDF: Printing, formal reports
   - Excel: Data analysis, spreadsheets
   - Word: Document editing, templates
3. **Name files clearly** when saving
4. **Verify data** before distributing

### When Viewing Student Records:
1. **Check all tabs** for complete information
2. **Download individual records** for parent meetings
3. **Verify contact information** regularly
4. **Update documents** as they expire

---

## 📞 Support

For technical issues or questions:
- Check this guide first
- Review [AUTHENTICATION_MANUAL.md](AUTHENTICATION_MANUAL.md)
- Contact IT Support

---

## 🔄 Future Enhancements

Potential additions:
- [ ] Batch operations (bulk status updates)
- [ ] Email student reports to parents
- [ ] Print student ID cards
- [ ] Advanced analytics dashboard
- [ ] Custom export templates
- [ ] Schedule exports
- [ ] Photo gallery view

---

## ✅ Quick Reference

### URLs:
- Student List: `/admin/students`
- Student Detail: `/admin/students/[id]/view`
- Create Student: `/admin/create-accounts`

### Export Formats:
- PDF: `students_YYYY-MM-DD.pdf`
- Excel: `students_YYYY-MM-DD.xlsx`
- Word: `students_YYYY-MM-DD.docx`

### Search Shortcuts:
- Type student number for quick find
- Use filters for group selection
- Combine search + filters for precision

---

**Advent Hope Academy | School Management System v2.0**

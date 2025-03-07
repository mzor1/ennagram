import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database for development (since MongoDB connection is failing)
const inMemoryDB = {
  users: [],
  testResults: []
};

// Create initial admin user
const createInitialAdmin = async () => {
  // Check if admin already exists
  const adminExists = inMemoryDB.users.find(user => user.email === 'admin@example.com');
  
  if (!adminExists) {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Create admin user
    const adminUser = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date()
    };
    
    inMemoryDB.users.push(adminUser);
    console.log('Initial admin user created:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
  }
};

// Initialize in-memory database
createInitialAdmin();

// MongoDB Connection (commented out since it's failing)
/*
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/enneagram-test')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));
*/

// Models (schema definitions kept for reference)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'dealer', 'student'], required: true },
  dealerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const TestResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  personalityType: { type: Number, required: true },
  answers: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Enneagram test questions
const questions = [
  { id: 1, text: "Genellikle düzenli ve planlı olmayı tercih ederim.", type: 1 },
  { id: 2, text: "Başkalarına yardım etmek benim için önemlidir.", type: 2 },
  { id: 3, text: "Başarılı olmak ve takdir edilmek benim için çok önemlidir.", type: 3 },
  { id: 4, text: "Kendimi sıklıkla farklı ve özel hissederim.", type: 4 },
  { id: 5, text: "Bilgi toplamak ve analiz etmek benim için önemlidir.", type: 5 },
  { id: 6, text: "Güvenlik ve istikrar benim için çok önemlidir.", type: 6 },
  { id: 7, text: "Yeni deneyimler ve eğlence aramayı severim.", type: 7 },
  { id: 8, text: "Kontrolü elimde tutmak ve güçlü olmak benim için önemlidir.", type: 8 },
  { id: 9, text: "Çatışmadan kaçınmak ve huzuru korumak benim için önemlidir.", type: 9 },
  // Daha fazla soru eklenebilir
];

// Enneagram type descriptions
const enneagramTypes = {
  1: {
    typeName: "Mükemmeliyetçi",
    summary: "Prensipli, amaçlı, kendini kontrol eden ve mükemmeliyetçi",
    description: "Tip 1'ler, doğru ve yanlışı ayırt etme konusunda güçlü bir içgüdüye sahiptir. Düzenli, sorumluluk sahibi ve ilkeli kişilerdir. Kendilerine ve başkalarına karşı yüksek standartlar belirlerler.",
    positiveTraits: ["Dürüst", "Güvenilir", "İlkeli", "Organize", "Sorumluluk sahibi"],
    negativeTraits: ["Aşırı eleştirel", "Katı", "Mükemmeliyetçi", "Kendini ve başkalarını yargılayıcı"],
    secondaryTypes: [
      { type: 9, typeName: "Barışçı", compatibility: 4 },
      { type: 2, typeName: "Yardımsever", compatibility: 3 }
    ],
    motivatingFactors: ["Doğru olanı yapmak", "Düzen ve yapı", "Adalet", "Kendini geliştirme"],
    demotivatingFactors: ["Hata yapmak", "Adaletsizlik", "Düzensizlik", "Kurallara uyulmaması"],
    learningEnvironment: ["Düzenli ve yapılandırılmış ortamlar", "Net beklentiler ve kurallar", "Adil değerlendirme sistemleri"],
    learningStyle: ["Sistematik ve metodolojik öğrenme", "Detaylara dikkat", "Mükemmeliyetçi yaklaşım"],
    teacherApproach: ["Net yönergeler ve beklentiler", "Adil ve tutarlı değerlendirme", "Yapıcı geri bildirim"],
    socialLife: "Tip 1'ler sosyal ilişkilerinde dürüst ve güvenilirdir. İlkeli davranışları ve sorumluluk duyguları ile tanınırlar. Ancak bazen katı standartları nedeniyle ilişkilerde zorluk yaşayabilirler.",
    parentAdvice: ["Hata yapmanın normal olduğunu öğretin", "Esnekliği teşvik edin", "Kendilerine karşı daha anlayışlı olmalarını destekleyin"],
    careerTraits: ["Detaylara dikkat", "Yüksek standartlar", "Organize çalışma", "Sorumluluk duygusu"],
    suitableCareers: ["Hukuk", "Eğitim", "Kalite kontrol", "Proje yönetimi", "Muhasebe"]
  },
  // Diğer tipler için benzer yapılar eklenebilir
};

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = inMemoryDB.users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Bu email adresi zaten kullanılıyor.' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = {
      _id: new mongoose.Types.ObjectId().toString(),
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date()
    };
    
    inMemoryDB.users.push(user);
    
    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = inMemoryDB.users.find(user => user.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Geçersiz email veya şifre.' });
    }
    
    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Geçersiz email veya şifre.' });
    }
    
    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Yetkilendirme hatası' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = inMemoryDB.users.find(user => user._id === decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Yetkilendirme hatası' });
    }
    
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Yetkilendirme hatası' });
  }
};

// Role middleware
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }
    next();
  };
};

// Get current user
app.get('/api/auth/me', auth, (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role
  });
});

// Admin Routes
app.get('/api/admin/stats', auth, checkRole(['admin']), async (req, res) => {
  try {
    const totalDealers = inMemoryDB.users.filter(user => user.role === 'dealer').length;
    const totalStudents = inMemoryDB.users.filter(user => user.role === 'student').length;
    const completedTests = inMemoryDB.testResults.length;
    
    res.json({
      totalDealers,
      totalStudents,
      completedTests
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

app.get('/api/admin/dealers', auth, checkRole(['admin']), async (req, res) => {
  try {
    const dealers = inMemoryDB.users.filter(user => user.role === 'dealer');
    
    // Get student count for each dealer
    const dealersWithCount = dealers.map(dealer => {
      const studentCount = inMemoryDB.users.filter(user => 
        user.role === 'student' && user.dealerId === dealer._id
      ).length;
      
      return {
        ...dealer,
        password: undefined, // Remove password from response
        studentCount
      };
    });
    
    res.json(dealersWithCount);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

app.post('/api/admin/dealers', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if dealer already exists
    const existingUser = inMemoryDB.users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Bu email adresi zaten kullanılıyor.' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new dealer
    const dealer = {
      _id: new mongoose.Types.ObjectId().toString(),
      name,
      email,
      password: hashedPassword,
      role: 'dealer',
      createdAt: new Date()
    };
    
    inMemoryDB.users.push(dealer);
    
    res.status(201).json({
      _id: dealer._id,
      name: dealer.name,
      email: dealer.email,
      role: dealer.role,
      createdAt: dealer.createdAt,
      studentCount: 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

app.put('/api/admin/dealers/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const dealerId = req.params.id;
    
    const dealerIndex = inMemoryDB.users.findIndex(user => user._id === dealerId);
    if (dealerIndex === -1) {
      return res.status(404).json({ message: 'Bayi bulunamadı.' });
    }
    
    const dealer = inMemoryDB.users[dealerIndex];
    
    // Update fields
    dealer.name = name || dealer.name;
    dealer.email = email || dealer.email;
    
    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      dealer.password = await bcrypt.hash(password, salt);
    }
    
    // Update in array
    inMemoryDB.users[dealerIndex] = dealer;
    
    res.json({
      _id: dealer._id,
      name: dealer.name,
      email: dealer.email,
      role: dealer.role,
      createdAt: dealer.createdAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

app.delete('/api/admin/dealers/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const dealerId = req.params.id;
    
    const dealerIndex = inMemoryDB.users.findIndex(user => user._id === dealerId);
    if (dealerIndex === -1) {
      return res.status(404).json({ message: 'Bayi bulunamadı.' });
    }
    
    // Delete dealer
    inMemoryDB.users.splice(dealerIndex, 1);
    
    // Update students to remove dealerId
    inMemoryDB.users.forEach(user => {
      if (user.role === 'student' && user.dealerId === dealerId) {
        user.dealerId = undefined;
      }
    });
    
    res.json({ message: 'Bayi başarıyla silindi.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Dealer Routes
app.get('/api/dealer/stats', auth, checkRole(['dealer']), async (req, res) => {
  try {
    const dealerId = req.user._id;
    
    const totalStudents = inMemoryDB.users.filter(user => 
      user.role === 'student' && user.dealerId === dealerId
    ).length;
    
    const studentsWithTests = inMemoryDB.testResults.map(result => result.userId);
    const studentIds = inMemoryDB.users
      .filter(user => user.role === 'student' && user.dealerId === dealerId)
      .map(user => user._id);
    
    const completedTests = studentIds.filter(id => 
      studentsWithTests.includes(id)
    ).length;
    
    // Get personality type distribution
    const testResults = inMemoryDB.testResults.filter(result =>
      studentIds.includes(result.userId)
    );
    
    const typeCount = {};
    testResults.forEach(result => {
      const type = result.personalityType;
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    
    const personalityTypes = Object.keys(typeCount).map(type => ({
      type: parseInt(type),
      count: typeCount[type]
    }));
    
    res.json({
      totalStudents,
      completedTests,
      personalityTypes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

app.get('/api/dealer/students', auth, checkRole(['dealer']), async (req, res) => {
  try {
    const dealerId = req.user._id;
    
    const students = inMemoryDB.users.filter(user => 
      user.role === 'student' && user.dealerId === dealerId
    );
    
    // Get test results for each student
    const studentsWithTestInfo = students.map(student => {
      const testResult = inMemoryDB.testResults.find(result => result.userId === student._id);
      
      return {
        ...student,
        password: undefined, // Remove password from response
        hasCompletedTest: !!testResult,
        personalityType: testResult ? testResult.personalityType : undefined
      };
    });
    
    res.json(studentsWithTestInfo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

app.post('/api/dealer/students', auth, checkRole(['dealer']), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const dealerId = req.user._id;
    
    // Check if student already exists
    const existingUser = inMemoryDB.users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Bu email adresi zaten kullanılıyor.' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new student
    const student = {
      _id: new mongoose.Types.ObjectId().toString(),
      name,
      email,
      password: hashedPassword,
      role: 'student',
      dealerId,
      createdAt: new Date()
    };
    
    inMemoryDB.users.push(student);
    
    res.status(201).json({
      _id: student._id,
      name: student.name,
      email: student.email,
      role: student.role,
      createdAt: student.createdAt,
      hasCompletedTest: false
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

app.put('/api/dealer/students/:id', auth, checkRole(['dealer']), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const studentId = req.params.id;
    const dealerId = req.user._id;
    
    // Check if student exists and belongs to this dealer
    const studentIndex = inMemoryDB.users.findIndex(user => 
      user._id === studentId && user.role === 'student' && user.dealerId === dealerId
    );
    
    if (studentIndex === -1) {
      return res.status(404).json({ message: 'Öğrenci bulunamadı.' });
    }
    
    const student = inMemoryDB.users[studentIndex];
    
    // Update fields
    student.name = name || student.name;
    student.email = email || student.email;
    
    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      student.password = await bcrypt.hash(password, salt);
    }
    
    // Update in array
    inMemoryDB.users[studentIndex] = student;
    
    res.json({
      _id: student._id,
      name: student.name,
      email: student.email,
      role: student.role,
      createdAt: student.createdAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

app.delete('/api/dealer/students/:id', auth, checkRole(['dealer']), async (req, res) => {
  try {
    const studentId = req.params.id;
    const dealerId = req.user._id;
    
    // Check if student exists and belongs to this dealer
    const studentIndex = inMemoryDB.users.findIndex(user => 
      user._id === studentId && user.role === 'student' && user.dealerId === dealerId
    );
    
    if (studentIndex === -1) {
      return res.status(404).json({ message: 'Öğrenci bulunamadı.' });
    }
    
    // Delete student
    inMemoryDB.users.splice(studentIndex, 1);
    
    // Delete test results
    inMemoryDB.testResults = inMemoryDB.testResults.filter(result => result.userId !== studentId);
    
    res.json({ message: 'Öğrenci başarıyla silindi.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Student Routes
app.get('/api/student/info', auth, checkRole(['student']), async (req, res) => {
  try {
    const userId = req.user._id;
    
    const testResult = inMemoryDB.testResults.find(result => result.userId === userId);
    
    res.json({
      hasCompletedTest: !!testResult,
      personalityType: testResult ? testResult.personalityType : undefined
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

app.get('/api/student/results', auth, checkRole(['student']), async (req, res) => {
  try {
    const userId = req.user._id;
    
    const testResult = inMemoryDB.testResults.find(result => result.userId === userId);
    
    if (!testResult) {
      return res.status(404).json({ message: 'Test sonucu bulunamadı.' });
    }
    
    const personalityType = testResult.personalityType;
    const typeInfo = enneagramTypes[personalityType];
    
    if (!typeInfo) {
      return res.status(404).json({ message: 'Kişilik tipi bilgisi bulunamadı.' });
    }
    
    res.json({
      personalityType,
      ...typeInfo
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Test Routes
app.get('/api/test/questions', auth, async (req, res) => {
  res.json(questions);
});

app.post('/api/test/submit', auth, checkRole(['student']), async (req, res) => {
  try {
    const userId = req.user._id;
    const { answers } = req.body;
    
    // Calculate personality type based on answers
    const typeScores = {};
    
    for (const questionId in answers) {
      const question = questions.find(q => q.id === parseInt(questionId));
      if (question) {
        const type = question.type;
        const score = answers[questionId];
        
        typeScores[type] = (typeScores[type] || 0) + score;
      }
    }
    
    // Find the dominant type
    let dominantType = 1;
    let highestScore = 0;
    
    for (const type in typeScores) {
      if (typeScores[type] > highestScore) {
        highestScore = typeScores[type];
        dominantType = parseInt(type);
      }
    }
    
    // Check if test result already exists
    const testResultIndex = inMemoryDB.testResults.findIndex(result => result.userId === userId);
    
    if (testResultIndex !== -1) {
      // Update existing result
      inMemoryDB.testResults[testResultIndex] = {
        ...inMemoryDB.testResults[testResultIndex],
        personalityType: dominantType,
        answers
      };
    } else {
      // Create new result
      inMemoryDB.testResults.push({
        _id: new mongoose.Types.ObjectId().toString(),
        userId,
        personalityType: dominantType,
        answers,
        createdAt: new Date()
      });
    }
    
    res.json({
      personalityType: dominantType
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Add a route to view the database (for development purposes)
app.get('/api/dev/database', (req, res) => {
  // Return a sanitized version of the database (without passwords)
  const sanitizedUsers = inMemoryDB.users.map(user => ({
    ...user,
    password: '[HIDDEN]'
  }));
  
  res.json({
    users: sanitizedUsers,
    testResults: inMemoryDB.testResults
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Admin user created:');
  console.log('Email: admin@example.com');
  console.log('Password: admin123');
});
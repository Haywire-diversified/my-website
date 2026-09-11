/* ==========================================================================
   HAYWIRE DIVERSIFIED - ADVANCED MULTI-PURPOSE PLATFORM ENGINE
   ========================================================================== */

// Simulated Application State / Database
const AppState = {
  registeredUsers: [], // Stores user objects
  currentUser: null,   // Currently logged in user object
  pendingOTPs: {},     // Email/Phone -> Code
  activeTab: 'welcomeTab',
  activeChatGroup: 'General',
  deptQuestions: [],   // Set by admins
  approvedQuestions: [], // Approved by Super Admin
  sponsoredAds: []
};

document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  initTabNavigation();
  initAuthEngine();
  initChatEngine();
  initQuizEngine();
  initAdEngine();
});

/* ==========================================================================
   1. HERO SLIDER & DYNAMIC COLOR EXTRACTOR
   ========================================================================== */
const heroImages = [
  { url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80', color: '#1a237e' }, // Dark Blue
  { url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80', color: '#004d40' }, // Teal Green
  { url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80', color: '#3e2723' }  // Dark Brown
];
let currentSlide = 0;

function initHeroSlider() {
  const heroImg = document.getElementById('heroSlideImg');
  if (!heroImg) return;

  setInterval(() => {
    currentSlide = (currentSlide + 1) % heroImages.length;
    const slideData = heroImages[currentSlide];
    
    // Change slide image
    heroImg.src = slideData.url;

    // Dynamically change interface accent color scheme based on image
    document.documentElement.style.setProperty('--primary-theme-color', slideData.color);
    document.body.style.backgroundColor = slideData.color + '15'; // Soft tint
  }, 4000);
}

/* ==========================================================================
   2. TAB NAVIGATION SYSTEM (Gated access for members)
   ========================================================================== */
function initTabNavigation() {
  const tabLinks = document.querySelectorAll('.tab-btn');
  
  tabLinks.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetTab = e.target.dataset.tab;

      // Access Control: Block unregistered users from non-welcome tabs
      if (!AppState.currentUser && targetTab !== 'welcomeTab') {
        alert("Access Denied! Only registered and logged-in members can access this section.");
        return;
      }

      switchTab(targetTab);
    });
  });
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

  document.getElementById(tabId).classList.remove('hidden');
  const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
  if (activeBtn) activeBtn.classList.add('active');
  AppState.activeTab = tabId;
}

/* ==========================================================================
   3. AUTHENTICATION (Registration, OTP, Forgot Password, System Mail)
   ========================================================================== */
function initAuthEngine() {
  const regForm = document.getElementById('registrationForm');
  const loginForm = document.getElementById('loginForm');
  const forgotForm = document.getElementById('forgotPasswordForm');

  // Handle Registration
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const identity = document.getElementById('regIdentity').value.trim();
      const fullName = document.getElementById('regFullName').value.trim();
      const nickname = document.getElementById('regNickname').value.trim();
      const department = document.getElementById('regDepartment').value;
      const password = document.getElementById('regPassword').value;

      // Duplicate Check
      if (AppState.registeredUsers.some(u => u.identity === identity)) {
        alert("A user with this email or phone number is already registered.");
        return;
      }

      // Generate & Send OTP Code via Auto-Generated System Email
      const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
      AppState.pendingOTPs[identity] = generatedOTP;

      // Send System Mail Simulation
      sendSystemEmail(
        identity,
        "Haywire Portal Verification Code",
        `Welcome ${fullName}! Your unique access OTP code is: ${generatedOTP}`
      );

      // OTP Verification Modal Prompt
      const userEnteredOTP = prompt("A verification code has been sent to your Email/Phone. Enter code here:");
      if (userEnteredOTP === generatedOTP) {
        // Create User
        const newUser = {
          fullName,
          identity,
          nickname,
          department,
          password,
          systemEmail: `${nickname.toLowerCase().replace(/\s+/g, '')}@haywire.edu.ng`, // Auto generated
          pictureUrl: document.getElementById('regPicture').files[0] ? URL.createObjectURL(document.getElementById('regPicture').files[0]) : 'default-avatar.png'
        };

        AppState.registeredUsers.push(newUser);
        AppState.currentUser = newUser;
        alert(`Registration Successful! System Email Assigned: ${newUser.systemEmail}`);
        
        onUserLoginSuccess();
      } else {
        alert("Invalid Verification Code. Registration Failed.");
      }
    });
  }

  // Handle Forgot Password
  if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const identity = document.getElementById('forgotIdentity').value.trim();
      const user = AppState.registeredUsers.find(u => u.identity === identity);

      if (!user) {
        alert("Error: Password reset is only allowed for previously registered members.");
        return;
      }

      const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
      sendSystemEmail(identity, "Password Reset Request", `Your password reset code is: ${resetOTP}`);
      
      const enteredCode = prompt("Enter the verification code sent to your email/phone:");
      if (enteredCode === resetOTP) {
        const newPassword = prompt("Enter your new password:");
        user.password = newPassword;
        alert("Password updated successfully! You can now login.");
      } else {
        alert("Invalid code. Reset failed.");
      }
    });
  }
}

function sendSystemEmail(toRecipient, subject, body) {
  console.log(`[SYSTEM MAIL SENT] From: system-no-reply@haywire.com | To: ${toRecipient} | Subject: ${subject} | Message: ${body}`);
  alert(`[SIMULATION EMAIL RECEIVED] To: ${toRecipient}\nSubject: ${subject}\n\n${body}`);
}

function onUserLoginSuccess() {
  document.getElementById('welcomeAuthBox').classList.add('hidden');
  document.getElementById('userProfileBadge').innerHTML = `
    <span>Welcome, <b>${AppState.currentUser.nickname}</b> (${AppState.currentUser.department})</span>
    <button onclick="logout()">Logout</button>
  `;

  // Enable Dept/Mass Comm Features
  initDeptAudioFeatures();
  // Open Default Tab
  switchTab('chatTab');
}

function logout() {
  AppState.currentUser = null;
  location.reload();
}

/* ==========================================================================
   4. CHAT GROUPS & AUDIO UPLOAD RESTRICTION
   ========================================================================== */
function initChatEngine() {
  const sendBtn = document.getElementById('sendChatBtn');
  const chatInput = document.getElementById('chatInput');
  const groupSelect = document.getElementById('chatGroupSelect');

  if (groupSelect) {
    groupSelect.addEventListener('change', (e) => {
      AppState.activeChatGroup = e.target.value;
      document.getElementById('chatTitle').textContent = `${AppState.activeChatGroup} Group`;
      document.getElementById('chatStream').innerHTML = `<p class="sys-msg">Switched to ${AppState.activeChatGroup} group chat.</p>`;
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', handleSendMessage);
  }
}

function handleSendMessage() {
  const chatInput = document.getElementById('chatInput');
  const messageText = chatInput.value.trim();
  if (messageText === '') return;

  renderMessage(AppState.currentUser ? AppState.currentUser.nickname : 'Guest', messageText, 'user');
  chatInput.value = '';
}

function renderMessage(sender, text, type) {
  const chatStream = document.getElementById('chatStream');
  const bubble = document.createElement('div');
  bubble.className = `message ${type}`;
  bubble.innerHTML = `<strong>${escapeHTML(sender)}</strong><br>${escapeHTML(text)}<div class="message-meta">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>`;
  chatStream.appendChild(bubble);
  chatStream.scrollTop = chatStream.scrollHeight;
}

// Audio Upload: Restricted strictly to Mass Communication Students
function initDeptAudioFeatures() {
  const audioUploadSection = document.getElementById('audioUploadSection');
  if (!audioUploadSection) return;

  if (AppState.currentUser && AppState.currentUser.department === 'Mass Communication') {
    audioUploadSection.innerHTML = `
      <h3>Mass Comm Audio Studio</h3>
      <input type="file" id="audioFileInput" accept="audio/*">
      <button onclick="uploadAudio()">Broadcast Audio</button>
    `;
  } else {
    audioUploadSection.innerHTML = `<p class="restricted-text"><i>* Audio streaming upload interface is restricted to Mass Communication department members.</i></p>`;
  }
}

function uploadAudio() {
  const fileInput = document.getElementById('audioFileInput');
  if (fileInput.files.length === 0) return alert("Select an audio file to upload.");
  alert("Audio report uploaded successfully to the platform live bar!");
}

/* ==========================================================================
   5. DEPT TESTS & SITE ADMIN APPROVAL SYSTEM
   ========================================================================== */
function submitQuestionByAdmin() {
  const qText = document.getElementById('adminQuestion').value;
  const dept = document.getElementById('adminQuestionDept').value;
  const timer = document.getElementById('adminQuestionTimer').value;

  if (!qText) return alert("Please type a question.");

  const newQuestion = {
    id: Date.now(),
    department: dept,
    question: qText,
    timeLimitSeconds: parseInt(timer),
    isApproved: false
  };

  AppState.deptQuestions.push(newQuestion);
  alert("Question submitted for review! It requires Super Admin approval before being published to tests.");
  renderAdminApprovalList();
}

function renderAdminApprovalList() {
  const container = document.getElementById('approvalContainer');
  if (!container) return;

  container.innerHTML = AppState.deptQuestions.filter(q => !q.isApproved).map(q => `
    <div class="approval-card">
      <p><b>Dept:</b> ${q.department} | <b>Question:</b> ${q.question}</p>
      <button onclick="approveQuestion(${q.id})">Approve & Publish</button>
    </div>
  `).join('');
}

function approveQuestion(id) {
  const question = AppState.deptQuestions.find(q => q.id === id);
  if (question) {
    question.isApproved = true;
    AppState.approvedQuestions.push(question);
    alert("Question approved by Site Admin! Now active for Department Assessment.");
    renderAdminApprovalList();
  }
}

/* ==========================================================================
   6. SPONSORED ADVERTS & PAYMENT TO OPAY ACCOUNT
   ========================================================================== */
function initAdEngine() {}

function submitSponsoredAd() {
  const adTitle = document.getElementById('adTitle').value;
  const refCode = document.getElementById('paymentRefCode').value.trim();

  if (!adTitle || !refCode) {
    alert("Please enter the Ad details and Payment Reference Code.");
    return;
  }

  // Direct Ad reference code to the admin interface
  const adminAdLogs = document.getElementById('adminAdLogs');
  const logItem = document.createElement('li');
  logItem.innerHTML = `<b>Ad:</b> ${escapeHTML(adTitle)} | <b>Ref Code:</b> ${escapeHTML(refCode)} 
                       | <b>Account:</b> 8163059669 (Osuntoki Christopher Ayojesu Opay) 
                       <button onclick="this.parentElement.style.color='green'; alert('Payment Confirmed!')">Confirm Payment</button>`;
  
  if (adminAdLogs) adminAdLogs.appendChild(logItem);
  alert("Your Ad submission & Payment Reference Code have been sent to the Admin Interface for payment confirmation!");
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

import React, { useState, useEffect } from 'react';
import { api } from './services/api.ts';
import { InstituteSettings, Course, Franchise, User, NoticeItem } from './types/index.ts';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { PublicWebsite } from './components/PublicWebsite.tsx';
import { PublicVerifyCertificate } from './components/PublicVerifyCertificate.tsx';
import { PublicVerifyMarksheet } from './components/PublicVerifyMarksheet.tsx';
import { AdminPortal } from './components/AdminPortal.tsx';
import { FranchisePortal } from './components/FranchisePortal.tsx';
import { StudentPortal } from './components/StudentPortal.tsx';
import { AdmissionModal } from './components/AdmissionModal.tsx';
import { FranchiseApplyModal } from './components/FranchiseApplyModal.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { OfferTickerBanner } from './components/OfferTickerBanner.tsx';
import { SpecialOfferPopup } from './components/SpecialOfferPopup.tsx';

export default function App() {
  const [settings, setSettings] = useState<InstituteSettings>({
    instituteName: 'ADVANCE INSTITUTE OF DIGITAL TECHNOLOGY',
    tagline: 'Center for Excellence in Information Technology & Professional Computing',
    directorName: 'Mr. Amar Soni',
    directorQualification: 'MCA, Data Science',
    directorPhotoUrl: '/director-amar-soni.svg',
    email: 'advancecomputerinstitute2026@gmail.com',
    mobile: '6306242129, 8382819908',
    address: 'Near Grammar Academy Chauraha, Kaushalpuri Phase 1, Ayodhya Cantt, Ayodhya – 224001, Uttar Pradesh, India',
    website: 'advancecomputerinstitute.com',
    logoUrl: '/aidt-logo.svg',
    directorSignatureUrl: '/signature-amar-soni.svg',
    controllerSignatureUrl: '/signature-controller.svg',
    instituteStampUrl: '/stamp-official.svg',
    watermarkText: 'ADVANCE INSTITUTE OF DIGITAL TECHNOLOGY AYODHYA CANTT',
    accreditationText: 'ISO 9001:2015 Certified Educational Institute & Registered Skill Training Entity',
    offerTickerEnabled: true,
    offerTickerText: '⚡ SPECIAL ADMISSION OFFER: Flat 20% EXTRA on Every Course This Week! Limited seats in Ayodhya Cantt batch.',
    offerDurationHours: 14,
    gradingRules: [],
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Active view: 'home' | 'verify-cert' | 'verify-mark' | 'admin' | 'franchise' | 'student'
  const [activeView, setActiveView] = useState<string>('home');
  const [verificationQuery, setVerificationQuery] = useState<string>('');

  // Modals
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>();
  const [isFranchiseOpen, setIsFranchiseOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isOfferPopupOpen, setIsOfferPopupOpen] = useState(false);
  const [loginRole, setLoginRole] = useState<'admin' | 'franchise' | 'student'>('admin');

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const [sett, crs, fran, nts] = await Promise.all([
          api.getSettings(),
          api.getCourses(),
          api.getFranchises(),
          api.getNotices(),
        ]);
        if (sett) setSettings(sett);
        if (crs) setCourses(crs);
        if (fran) setFranchises(fran);
        if (nts) setNotices(nts);
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }
    init();

    // Show offer popup automatically on first visit if not dismissed today
    const lastDismissed = localStorage.getItem('aidt_offer_popup_dismissed_v1');
    const now = Date.now();
    if (!lastDismissed || now - parseInt(lastDismissed) > 24 * 60 * 60 * 1000) {
      const timer = setTimeout(() => {
        setIsOfferPopupOpen(true);
      }, 1200);
      return () => clearTimeout(timer);
    }

    // Parse URL path for direct verification QR code scans
    const path = window.location.pathname;
    if (path.includes('/verify-certificate/')) {
      const id = path.split('/verify-certificate/')[1];
      if (id) {
        setVerificationQuery(decodeURIComponent(id));
        setActiveView('verify-cert');
      }
    } else if (path.includes('/verify-marksheet/')) {
      const id = path.split('/verify-marksheet/')[1];
      if (id) {
        setVerificationQuery(decodeURIComponent(id));
        setActiveView('verify-mark');
      }
    }
  }, []);

  // Refresh home page data whenever switching back to home view
  useEffect(() => {
    if (activeView === 'home') {
      api.getSettings().then((s) => s && setSettings(s)).catch(() => {});
      api.getCourses().then((c) => c && setCourses(c)).catch(() => {});
      api.getNotices().then((n) => n && setNotices(n)).catch(() => {});
      api.getFranchises().then((f) => f && setFranchises(f)).catch(() => {});
    }
  }, [activeView]);

  const handleOpenLogin = (role: 'admin' | 'franchise' | 'student' = 'admin') => {
    setLoginRole(role);
    setIsLoginOpen(true);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveView(user.role);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('home');
  };

  const handleNavigateVerification = (type: 'certificate' | 'marksheet', query?: string) => {
    if (query) setVerificationQuery(query);
    setActiveView(type === 'certificate' ? 'verify-cert' : 'verify-mark');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdmissionWithCourse = (courseId?: string) => {
    setSelectedCourseId(courseId);
    setIsAdmissionOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Top 14-Hour Countdown Offer Ticker Banner */}
      <OfferTickerBanner
        settings={settings}
        onOpenOfferModal={() => setIsOfferPopupOpen(true)}
        onOpenAdmission={() => handleOpenAdmissionWithCourse()}
      />

      {/* Institutional Top Navbar */}
      <Navbar
        settings={settings}
        activeView={activeView}
        setActiveView={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAdmission={() => handleOpenAdmissionWithCourse()}
        onOpenFranchise={() => setIsFranchiseOpen(true)}
        onOpenLogin={handleOpenLogin}
      />

      {/* Main Body View Switching */}
      <div className="flex-1">
        {activeView === 'home' && (
          <PublicWebsite
            settings={settings}
            courses={courses}
            franchises={franchises}
            notices={notices}
            onOpenAdmission={handleOpenAdmissionWithCourse}
            onOpenFranchise={() => setIsFranchiseOpen(true)}
            onNavigateVerification={handleNavigateVerification}
            onOpenAdminNotices={() => setActiveView('admin')}
            isAdmin={currentUser?.role === 'admin'}
          />
        )}

        {activeView === 'verify-cert' && (
          <PublicVerifyCertificate
            initialSearch={verificationQuery}
            settings={settings}
          />
        )}

        {activeView === 'verify-mark' && (
          <PublicVerifyMarksheet
            initialSearch={verificationQuery}
            settings={settings}
          />
        )}

        {activeView === 'admin' && (
          <AdminPortal
            settings={settings}
            onSettingsUpdate={(updated) => setSettings(updated)}
          />
        )}

        {activeView === 'franchise' && (
          <FranchisePortal
            settings={settings}
            franchiseId={currentUser?.referenceId || 'fran-02'}
          />
        )}

        {activeView === 'student' && (
          <StudentPortal
            settings={settings}
            studentId={currentUser?.referenceId || 'stu-01'}
          />
        )}
      </div>

      {/* Institutional Footer */}
      <Footer
        settings={settings}
        setActiveView={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdmission={() => handleOpenAdmissionWithCourse()}
        onOpenFranchise={() => setIsFranchiseOpen(true)}
        onOpenLogin={handleOpenLogin}
      />

      {/* Special Offer Pop-up with Live Countdown Clock */}
      <SpecialOfferPopup
        isOpen={isOfferPopupOpen}
        onClose={() => setIsOfferPopupOpen(false)}
        onOpenAdmission={(cId) => handleOpenAdmissionWithCourse(cId)}
        courses={courses}
        settings={settings}
      />

      {/* Student Admission Modal */}
      <AdmissionModal
        isOpen={isAdmissionOpen}
        onClose={() => setIsAdmissionOpen(false)}
        courses={courses}
        franchises={franchises}
        selectedCourseId={selectedCourseId}
      />

      {/* Franchise Affiliation Modal */}
      <FranchiseApplyModal
        isOpen={isFranchiseOpen}
        onClose={() => setIsFranchiseOpen(false)}
      />

      {/* Multi-role Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        defaultRole={loginRole}
      />
    </div>
  );
}

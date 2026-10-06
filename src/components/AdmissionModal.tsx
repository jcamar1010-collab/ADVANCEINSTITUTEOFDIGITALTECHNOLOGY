import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { Course, Franchise, Student } from '../types/index.ts';
import { PhotoUploader } from './PhotoUploader.tsx';
import { X, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  franchises: Franchise[];
  selectedCourseId?: string;
  onSuccess?: (student: Student) => void;
}

export const AdmissionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  courses,
  franchises,
  selectedCourseId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    motherName: '',
    dob: '2004-01-01',
    gender: 'Male',
    mobile: '',
    email: '',
    address: '',
    courseId: selectedCourseId || courses[0]?.id || 'course-adca',
    franchiseId: franchises[0]?.id || 'fran-01',
    photoUrl: '',
  });

  React.useEffect(() => {
    if (selectedCourseId) {
      setFormData((prev) => ({ ...prev, courseId: selectedCourseId }));
    }
  }, [selectedCourseId, isOpen]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdStudent, setCreatedStudent] = useState<Student | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.fatherName || !formData.mobile) {
      setError('Please fill in Student Name, Father Name, and Mobile Number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.applyAdmission(formData);
      if (res.success && res.student) {
        setCreatedStudent(res.student);
        if (onSuccess) onSuccess(res.student);
      } else {
        setError(res.error || 'Failed to submit admission application.');
      }
    } catch (err: any) {
      setError('Network error while submitting admission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 relative animate-in fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-5">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                Online Student Admission Form
              </h3>
              <p className="text-xs text-slate-500">
                Advance Institute of Digital Technology • Ayodhya Cantt
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {createdStudent ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">
              Admission Application Submitted!
            </h4>
            <p className="text-slate-600 text-sm mt-1 max-w-md mx-auto">
              Your registration has been recorded in the institute database and assigned unique institutional credentials.
            </p>

            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-bold text-slate-900">{createdStudent.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Registration Number:</span>
                <span className="font-mono font-bold text-amber-800">{createdStudent.registrationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Enrollment Number:</span>
                <span className="font-mono font-bold text-blue-900">{createdStudent.enrollmentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Course:</span>
                <span className="font-medium text-slate-800">{createdStudent.courseName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Admission Status:</span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded">
                  {createdStudent.admissionStatus} (Under Admin Review)
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-4 max-w-sm mx-auto">
              Note: As per institute policy, academic marksheets and certificates will only be generated after Director/Admin verification.
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#0f2942] text-white text-xs font-semibold rounded-lg hover:bg-[#1a3d60] transition-colors"
              >
                Close &amp; Return to Website
              </button>
            </div>
          </div>
        ) : (
          /* Input Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name of Student *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Vikas Kumar"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#0f2942]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Father's Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  placeholder="e.g. Shri Rajesh Kumar"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#0f2942]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mother's Name
                </label>
                <input
                  type="text"
                  value={formData.motherName}
                  onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  placeholder="e.g. Smt. Geeta Devi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#0f2942]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#0f2942]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#0f2942]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number (WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#0f2942]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. student@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#0f2942]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Program / Course *
                </label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#0f2942]"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.duration}) — ₹{c.fee.toLocaleString()} (was ₹{(c.originalFee || Math.round(c.fee * 1.5)).toLocaleString()})
                    </option>
                  ))}
                </select>
                {(() => {
                  const currentCourse = courses.find((c) => c.id === formData.courseId);
                  if (!currentCourse) return null;
                  const orig = currentCourse.originalFee || Math.round(currentCourse.fee * 1.5);
                  return (
                    <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs">
                      <span className="text-amber-900 font-bold flex items-center gap-1">
                        ⚡ Limited Admission Fee:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="line-through text-slate-400 font-semibold">₹{orig.toLocaleString()}</span>
                        <span className="font-black text-emerald-700 text-sm">₹{currentCourse.fee.toLocaleString()}</span>
                        <span className="bg-red-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                          {currentCourse.badgeText || 'OFFER'}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Training Center *
                </label>
                <select
                  value={formData.franchiseId}
                  onChange={(e) => setFormData({ ...formData, franchiseId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#0f2942]"
                >
                  {franchises.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.centerName} ({f.centerCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interactive Student Passport Photo Upload */}
            <div className="pt-1">
              <PhotoUploader
                photoUrl={formData.photoUrl}
                onChange={(url) => setFormData({ ...formData, photoUrl: url })}
                required={true}
                label="Student Passport Photograph (Required for Certificate & Marksheet)"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Complete Residential Address
              </label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Village/Mohalla, Post, Ayodhya, Uttar Pradesh"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#0f2942]"
              />
            </div>

            <div className="pt-3 border-t flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#0f2942] text-white text-xs font-semibold rounded-lg hover:bg-[#1a3d60] transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Submitting Application...' : 'Submit Admission'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

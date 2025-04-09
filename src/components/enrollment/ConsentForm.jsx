import React, { useState } from "react";
import { ChevronRight, X, Check, ShieldCheck } from "lucide-react";

const ConsentForm = ({ onAccept, onDecline }) => {
  const [consentAccepted, setConsentAccepted] = useState(false);
  
  const handleAccept = () => {
    if (consentAccepted) {
      onAccept();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-70 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex justify-between items-center relative">
          {/* Yellow accent bar at top */}
          <div className="absolute top-0 left-0 h-1 w-full bg-[#F6BA18]"></div>
          
          {/* Header content */}
          <div className="flex items-center">
            <ShieldCheck size={24} className="text-[#F6BA18] mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-[#212529]">Privacy Policy & Data Consent</h2>
              <p className="text-gray-500 text-sm mt-1">Please read carefully before proceeding</p>
            </div>
          </div>
          <button 
            onClick={onDecline}
            className="text-gray-500 hover:text-gray-700 bg-white hover:bg-gray-100 rounded-full p-2 transition-colors shadow-sm"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 md:p-8 flex-grow bg-gray-50">
          <div className="space-y-8 bg-white p-8 rounded-xl shadow-sm">
            <h3 className="font-semibold text-xl text-[#212529] pb-4 border-b border-gray-100">PRIVACY POLICY AND DATA CONSENT AGREEMENT</h3>
            
            <p className="text-gray-700">Last Updated: April 2025</p>
            
            <div>
              <p className="font-bold text-[#212529] mb-3">1. INTRODUCTION</p>
              <p className="text-gray-700 leading-relaxed">
                This Privacy Policy and Data Consent Agreement ("Agreement") describes how the University of Santo Tomas (UST) and UST National Service Training Program - Literacy Training Service (NSTP LTS) ("we," "us," or "our") collect, use, store, and protect your personal information when you use the ARALKADEMY Learning Management System ("ARALKADEMY LMS" or the "Platform"). We respect your privacy and are committed to protecting your personal data in accordance with the Data Privacy Act of 2012 (Republic Act No. 10173).
              </p>
            </div>
            
            <div>
              <p className="font-bold text-[#212529] mb-3">2. INFORMATION WE COLLECT</p>
              <p className="text-gray-700 mb-3">
                We collect the following personal information when you enroll in ARALKADEMY LMS:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-gray-700">
                <li>Full name (first name, middle initial, last name)</li>
                <li>Contact information (email address, contact number)</li>
                <li>Date of birth</li>
                <li>School information (student ID, year level)</li>
                <li>Login credentials (email and password)</li>
                <li>Educational records and academic performance</li>
                <li>Technical data (IP address, browser type, device information)</li>
                <li>Platform usage data and learning analytics</li>
                <li>Communications and feedback you provide</li>
              </ul>
            </div>
            
            <div>
              <p className="font-bold text-[#212529] mb-3">3. PURPOSE OF DATA COLLECTION</p>
              <p className="text-gray-700 mb-3">
                Your personal information is collected and processed for the following purposes:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-gray-700">
                <li>To create and maintain your ARALKADEMY LMS account</li>
                <li>To provide educational content and services</li>
                <li>To track your progress and assess performance</li>
                <li>To communicate with you regarding course updates, announcements, and feedback</li>
                <li>To improve our platform and services through analysis of usage patterns</li>
                <li>To provide technical support and address issues</li>
                <li>To comply with legal and regulatory requirements</li>
                <li>To prevent fraud and ensure platform security</li>
                <li>To generate anonymized statistical data for research and reporting purposes</li>
              </ul>
            </div>
            
            <div>
              <p className="font-bold text-[#212529] mb-3">4. LEGAL BASIS FOR PROCESSING</p>
              <p className="text-gray-700 mb-3">
                We process your personal information based on:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-gray-700">
                <li>Your consent provided through this Agreement</li>
                <li>The fulfillment of our educational service contract with you</li>
                <li>Compliance with legal obligations</li>
                <li>Legitimate interests in providing and improving educational services</li>
              </ul>
            </div>
            
            <div>
              <p className="font-bold text-[#212529] mb-3">5. DATA SHARING AND DISCLOSURE</p>
              <p className="text-gray-700 mb-3">
                We may share your personal information with:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-gray-700">
                <li>UST faculty, staff, and administrators involved in your education</li>
                <li>Third-party service providers who assist in platform operations</li>
                <li>Government agencies when required by law</li>
                <li>Academic researchers (using anonymized data only)</li>
              </ul>
              <p className="text-gray-700 mt-3">
                All third parties are required to maintain the confidentiality and security of your information and use it only for the specified purposes.
              </p>
            </div>
            
            <div>
              <p className="font-bold text-[#212529] mb-3">6. DATA SECURITY</p>
              <p className="text-gray-700 mb-3">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-gray-700">
                <li>Data encryption in transit and at rest</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Regular security assessments and audits</li>
                <li>Staff training on data protection</li>
                <li>Physical security measures for our servers and facilities</li>
              </ul>
              <p className="text-gray-700 mt-3">
                While we strive to use commercially acceptable means to protect your personal information, no method of transmission over the internet or electronic storage is 100% secure. Therefore, we cannot guarantee absolute security.
              </p>
            </div>
            
            <div>
              <p className="font-bold text-[#212529] mb-3">7. DATA RETENTION</p>
              <p className="text-gray-700 mb-3">
                We will retain your personal information for as long as necessary to fulfill the purposes outlined in this Agreement, unless a longer retention period is required or permitted by law. The criteria used to determine our retention periods include:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-gray-700">
                <li>The duration of your enrollment and active use of the platform</li>
                <li>Legal and regulatory requirements</li>
                <li>Academic record-keeping standards</li>
              </ul>
            </div>
            
            <div>
              <p className="font-bold text-[#212529] mb-3">8. YOUR PRIVACY RIGHTS</p>
              <p className="text-gray-700 mb-3">
                Under the Data Privacy Act of 2012, you have the right to:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-gray-700">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of incomplete, inaccurate, or outdated information</li>
                <li>Object to processing in certain circumstances</li>
                <li>Request the deletion or blocking of your data when legally permissible</li>
                <li>Be informed of data breaches affecting your information</li>
                <li>Lodge a complaint with the National Privacy Commission</li>
              </ul>
              <p className="text-gray-700 mt-3">
                To exercise these rights, please contact our Data Protection Officer at the contact information provided below.
              </p>
            </div>
            
            <div>
              <p className="font-bold text-[#212529] mb-3">9. LIMITATION OF LIABILITY</p>
              <p className="text-gray-700 mb-3">
                While we take all reasonable measures to protect your personal information, we are not liable for any data breach or compromise that occurs due to:
              </p>
              <ul className="list-disc ml-6 space-y-2 text-gray-700">
                <li>Factors beyond our reasonable control</li>
                <li>Sophisticated cyber attacks that circumvent our security measures</li>
                <li>User actions that compromise account security (e.g., sharing passwords)</li>
                <li>Force majeure events</li>
                <li>Failures of third-party systems or networks outside our direct control</li>
              </ul>
              <p className="text-gray-700 mt-3">
                Our liability is limited to the extent permitted by applicable law and shall not include indirect, consequential, or punitive damages.
              </p>
            </div>
            
            <div>
              <p className="font-bold text-[#212529] mb-3">10. CHANGES TO THIS PRIVACY POLICY</p>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on the Platform and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </div>
            
            <div>
              <p className="font-bold text-[#212529] mb-3">11. CONTACT INFORMATION</p>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy or our data practices, please contact:
              </p>
              <div className="mt-3 p-4 bg-gray-50 border-l-4 border-[#F6BA18] rounded-lg text-gray-700">
                UST NSTP LTS Data Protection Officer<br />
                University of Santo Tomas<br />
                España Boulevard, Sampaloc, Manila, 1015<br />
                Email: privacy@aralkademy.ust.edu.ph<br />
                Phone: (02) 8406-1611
              </div>
            </div>
            
            <div>
              <p className="font-bold text-[#212529] mb-3">12. CONSENT</p>
              <p className="text-gray-700">
                By checking the box below, you acknowledge that you have read and understood this Privacy Policy and Data Consent Agreement, and you freely and voluntarily consent to the collection, use, storage, and processing of your personal information as described herein.
              </p>
            </div>
          </div>
        </div>

        {/* Footer with Accept/Decline buttons */}
        <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <input 
                  type="checkbox" 
                  id="consent-checkbox"
                  checked={consentAccepted}
                  onChange={() => setConsentAccepted(!consentAccepted)}
                  className="sr-only" // Hide default checkbox but keep functionality
                />
                <div 
                  className={`w-6 h-6 flex items-center justify-center rounded-md border-2 cursor-pointer transition-all duration-200 ${
                    consentAccepted 
                      ? 'bg-[#F6BA18] border-[#F6BA18] shadow-inner' 
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  onClick={() => setConsentAccepted(!consentAccepted)}
                >
                  {consentAccepted && <Check size={16} className="text-[#212529]" />}
                </div>
              </div>
              <label 
                htmlFor="consent-checkbox" 
                className="text-sm text-gray-700 cursor-pointer select-none font-medium"
              >
                I have read and agree to the Privacy Policy and Data Consent Agreement
              </label>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
              <button
                onClick={onDecline}
                className="flex-1 md:flex-initial px-6 py-3 border border-gray-300 text-[#212529] rounded-lg hover:bg-gray-100 text-sm font-medium transition-colors"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                disabled={!consentAccepted}
                className={`flex-1 md:flex-initial px-8 py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-3 transition-all duration-200 shadow-md hover:shadow-lg ${
                  consentAccepted 
                    ? 'bg-[#212529] hover:bg-[#F6BA18] hover:text-[#212529] text-white' 
                    : 'bg-gray-400 text-white cursor-not-allowed opacity-70'
                }`}
              >
                Accept and Continue
                <ChevronRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentForm;

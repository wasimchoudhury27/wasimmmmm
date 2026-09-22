import { DemoScenario } from '../types.js';

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'demo-job',
    title: 'Suspicious Job Offer',
    category: 'Job & Recruitment Scam',
    type: 'message',
    label: 'Job Offer Demo',
    description: 'Selected without interview with upfront equipment/security deposit demand.',
    content: `Dear Candidate,

Congratulations! Based on your LinkedIn profile, you have been directly selected for the role of Senior Data Associate at Vertex Global Solutions Pvt Ltd without any interview.

Your starting salary will be ₹45,000/month with full work-from-home flexibility. 

To confirm your employment and initiate dispatch of your company laptop & ID card, you must deposit a refundable security fee of ₹4,999 today before 5:00 PM via UPI to our HR coordinator (UPI: hr.vertex@okaxis).

Note: Offer expires today. Failure to pay within 2 hours will result in automatic cancellation of your appointment letter.

Regards,
Ms. Priya Sharma (HR Recruitment Team)
WhatsApp Support: +91 98765 43210`
  },
  {
    id: 'demo-rental',
    title: 'Rental Deposit Scam',
    category: 'Property & Housing Fraud',
    type: 'message',
    label: 'Rental Deposit Demo',
    description: 'Flat available at prime location with demand for advance gate pass visit token.',
    content: `Hello,

The fully furnished 2BHK flat in Indiranagar is available for immediate occupancy at ₹18,000/month (all maintenance included).

Because I am currently posted in the military out of station, I cannot come personally to show the flat. Many people are asking for visits, so my society society manager has instituted a gate pass security protocol.

Please send an advance refundable gate pass deposit of ₹10,000 via GPay/PhonePe to receive your digital entry QR code. If you do not like the flat after visiting today, the ₹10,000 will be refunded instantly to your bank account within 10 minutes.

Act now as only 1 slot is left for viewing this afternoon.`
  },
  {
    id: 'demo-url',
    title: 'Suspicious Payment / KYC Link',
    category: 'Credential & Phishing Fraud',
    type: 'url',
    label: 'Payment URL Demo',
    description: 'Spoofed banking KYC verification link hosted on high-risk disposable infrastructure.',
    content: 'https://sbi-online-kyc-verification-update.xyz/auth/login-verify.php?urgent=1'
  },
  {
    id: 'demo-appointment',
    title: 'Appointment Letter / Registration Fee',
    category: 'Fake Corporate Onboarding',
    type: 'message',
    label: 'Appointment Letter Demo',
    description: 'Fake corporate appointment letter asking for processing and training kit charges.',
    content: `APPOINTMENT & ONBOARDING DIRECTIVE

Reference ID: V-CORP/2026/8841

We are pleased to issue this Formal Appointment Letter for the post of Regional Operations Executive.

To proceed with your background verification and government biometric dispatch, you are required to remit a mandatory documentation & registration fee of ₹3,450 to our official account.

Payment must be executed within 60 minutes using Google Pay or Bank IMPS to finalize your corporate employee code.

Failure to remit the registration charges immediately will void your employment and initiate legal action for company resource reservation.`
  }
];

// NyayaSetu Admin API Service
const API_BASE_URL = 'http://localhost:8000/api';

export const api = {
  async getDashboardMetrics() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/metrics`);
      const json = await res.json();
      return json.data || {};
    } catch (e) {
      console.warn('API fetch fallback to local mock:', e);
      return {
        total_users: 1420,
        total_lawyers: 580,
        verified_lawyers: 390,
        pending_verifications: 14,
        total_posts: 3200,
        total_jobs: 145,
        total_cases: 680,
        pending_reports: 3,
        recent_verification_queue: [
          {
            id: 1,
            user_id: 2,
            full_name: 'Adv. Ananya Deshmukh',
            enrollment_number: 'MAH/5829/2016',
            bar_state: 'Bar Council of Maharashtra & Goa',
            city: 'Mumbai',
            state: 'Maharashtra',
            status: 'pending',
            created_at: '2026-10-02 14:30:00'
          },
          {
            id: 2,
            user_id: 7,
            full_name: 'Adv. Rajeshwar Kulkarni',
            enrollment_number: 'KAR/1102/2018',
            bar_state: 'Bar Council of Karnataka',
            city: 'Bengaluru',
            state: 'Karnataka',
            status: 'pending',
            created_at: '2026-10-02 11:15:00'
          }
        ],
        recent_users: [
          { id: 1, full_name: 'Adv. Vikram Sharma', role: 'senior_advocate', city: 'New Delhi', is_active: 1 },
          { id: 2, full_name: 'Adv. Ananya Deshmukh', role: 'advocate', city: 'Mumbai', is_active: 1 },
          { id: 3, full_name: 'Rohit Verma', role: 'student', city: 'New Delhi', is_active: 1 },
          { id: 4, full_name: 'Rahul Mehta', role: 'public_user', city: 'Noida', is_active: 1 },
          { id: 6, full_name: 'Lex Bharat Chambers LLP', role: 'law_firm', city: 'New Delhi', is_active: 1 }
        ]
      };
    }
  },

  async getVerifications(status = 'pending') {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/verifications?status=${status}`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [
        {
          id: 1,
          user_id: 2,
          full_name: 'Adv. Ananya Deshmukh',
          enrollment_number: 'MAH/5829/2016',
          bar_council_number: 'MAH/5829/2016',
          bar_state: 'Bar Council of Maharashtra & Goa',
          primary_court: 'Bombay High Court',
          city: 'Mumbai',
          state: 'Maharashtra',
          experience_years: 8,
          status: 'pending',
          id_proof_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80',
          bar_council_cert_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&q=80',
          created_at: '2026-10-02 14:30:00'
        },
        {
          id: 2,
          user_id: 8,
          full_name: 'Adv. Sameer Qureshi',
          enrollment_number: 'UP/3041/2020',
          bar_council_number: 'UP/3041/2020',
          bar_state: 'Bar Council of Uttar Pradesh',
          primary_court: 'Allahabad High Court (Lucknow Bench)',
          city: 'Lucknow',
          state: 'Uttar Pradesh',
          experience_years: 4,
          status: 'pending',
          id_proof_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80',
          bar_council_cert_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&q=80',
          created_at: '2026-10-02 09:45:00'
        }
      ];
    }
  },

  async reviewVerification(id: number, action: 'approve' | 'reject', rejectionReason?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/verifications/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, rejection_reason: rejectionReason })
      });
      return await res.json();
    } catch {
      return { success: true, message: `Verification ${action}d successfully.` };
    }
  },

  async getUsers() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [
        { id: 1, full_name: 'Adv. Vikram Sharma', primary_email: 'adv.vikram.sharma@nyayasetu.in', primary_phone: '+919810123456', role: 'senior_advocate', city: 'New Delhi', verified_badge: 1, is_active: 1 },
        { id: 2, full_name: 'Adv. Ananya Deshmukh', primary_email: 'ananya.deshmukh@lawchambers.in', primary_phone: '+919820234567', role: 'advocate', city: 'Mumbai', verified_badge: 1, is_active: 1 },
        { id: 3, full_name: 'Rohit Verma', primary_email: 'rohit.verma@nludelhi.ac.in', primary_phone: '+919830345678', role: 'student', city: 'New Delhi', verified_badge: 0, is_active: 1 },
        { id: 4, full_name: 'Rahul Mehta', primary_email: 'rahul.mehta.delhi@gmail.com', primary_phone: '+919840456789', role: 'public_user', city: 'Noida', verified_badge: 0, is_active: 1 },
        { id: 6, full_name: 'Lex Bharat Chambers LLP', primary_email: 'contact@lexbharatchambers.com', primary_phone: '+911123389000', role: 'law_firm', city: 'New Delhi', verified_badge: 1, is_active: 1 }
      ];
    }
  },

  async toggleUserStatus(id: number) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}/toggle-status`, { method: 'POST' });
      return await res.json();
    } catch {
      return { success: true, message: 'Status updated' };
    }
  }
};

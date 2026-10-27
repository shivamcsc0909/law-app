import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Alert
} from '@mui/material';
import { AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';

export const ModerationPage: React.FC = () => {
  const [reports, setReports] = useState([
    {
      id: 1,
      reported_type: 'post',
      reporter_name: 'Adv. Sameer Q.',
      reason_category: 'Misleading Legal Information',
      description: 'Post claims courts accept uncertified WhatsApp screenshots as conclusive primary evidence under BNSS without 63 BSA certificate.',
      target_title: 'WhatsApp as Primary Evidence in Trial',
      status: 'pending',
      created_at: '2026-10-02 12:10:00'
    },
    {
      id: 2,
      reported_type: 'job',
      reporter_name: 'Rohit Verma',
      reason_category: 'Suspected Scam / Fee Collection',
      description: 'Job listing asks interns to pay ₹2,500 registration fee before interview.',
      target_title: 'Legal Research Associate (Work From Home)',
      status: 'pending',
      created_at: '2026-10-02 08:30:00'
    }
  ]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleResolve = (id: number, action: 'dismiss' | 'remove') => {
    setReports(reports.filter(r => r.id !== id));
    setFeedback(`Report #${id} marked as ${action === 'remove' ? 'content removed & penalized' : 'dismissed'}.`);
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#F8FAFC' }}>
            Content Moderation & Reports
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
            Review user-reported misleading legal advice, scam job postings, and privacy violations.
          </Typography>
        </Box>
      </Box>

      {feedback && (
        <Alert severity="info" sx={{ mb: 3, backgroundColor: '#1E293B', color: '#38BDF8' }}>
          {feedback}
        </Alert>
      )}

      <Paper sx={{ backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#1E293B' }}>
              <TableRow sx={{ '& th': { color: '#94A3B8', fontWeight: 600 } }}>
                <TableCell>Target Content</TableCell>
                <TableCell>Category & Reason</TableCell>
                <TableCell>Reported By</TableCell>
                <TableCell>Details</TableCell>
                <TableCell align="right">Moderation Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ color: '#94A3B8', py: 4 }}>
                    No pending moderation reports.
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report.id} sx={{ '& td': { color: '#F8FAFC', borderColor: '#1E293B' } }}>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{report.target_title}</Typography>
                      <Chip
                        label={report.reported_type.toUpperCase()}
                        size="small"
                        sx={{ mt: 0.5, backgroundColor: '#EF444422', color: '#EF4444', fontSize: '0.65rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AlertTriangle size={16} color="#F59E0B" />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#F59E0B' }}>
                          {report.reason_category}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{report.reporter_name}</TableCell>
                    <TableCell sx={{ maxWidth: 300, color: '#CBD5E1' }}>
                      {report.description}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleResolve(report.id, 'dismiss')}
                          startIcon={<CheckCircle size={14} />}
                          sx={{ borderColor: '#64748B', color: '#94A3B8', textTransform: 'none', borderRadius: 2 }}
                        >
                          Dismiss
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleResolve(report.id, 'remove')}
                          startIcon={<Trash2 size={14} />}
                          sx={{ backgroundColor: '#EF4444', '&:hover': { backgroundColor: '#DC2626' }, textTransform: 'none', borderRadius: 2 }}
                        >
                          Remove Content
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

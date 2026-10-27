import React, { useEffect, useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Alert
} from '@mui/material';
import { ShieldCheck, XCircle, CheckCircle, ExternalLink, FileText } from 'lucide-react';
import { api } from '../services/api';

export const VerificationsPage: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    const data = await api.getVerifications('pending');
    setRequests(data);
  };

  const handleOpenReview = (req: any) => {
    setSelectedReq(req);
    setRejectionReason('');
    setOpenReviewDialog(true);
  };

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selectedReq) return;
    const res = await api.reviewVerification(selectedReq.id, action, rejectionReason);
    setFeedback(res.message || `Lawyer verification ${action}d.`);
    setOpenReviewDialog(false);
    loadVerifications();
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#F8FAFC' }}>
            Advocate & Professional Verification
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
            Review state Bar Council enrollment certificates, ID credentials, and assign verified practitioner badges.
          </Typography>
        </Box>
      </Box>

      {feedback && (
        <Alert severity="success" sx={{ mb: 3, backgroundColor: '#064E3B', color: '#6EE7B7' }}>
          {feedback}
        </Alert>
      )}

      <Paper sx={{ backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#1E293B' }}>
              <TableRow sx={{ '& th': { color: '#94A3B8', fontWeight: 600 } }}>
                <TableCell>Advocate / Candidate</TableCell>
                <TableCell>Bar State & Council</TableCell>
                <TableCell>Enrollment Number</TableCell>
                <TableCell>Primary Court</TableCell>
                <TableCell>Experience</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ color: '#94A3B8', py: 4 }}>
                    No pending verification requests in queue.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id} sx={{ '& td': { color: '#F8FAFC', borderColor: '#1E293B' } }}>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{req.full_name}</Typography>
                      <Typography variant="caption" sx={{ color: '#94A3B8' }}>{req.city}, {req.state}</Typography>
                    </TableCell>
                    <TableCell>{req.bar_state}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', color: '#38BDF8', fontWeight: 600 }}>
                      {req.enrollment_number}
                    </TableCell>
                    <TableCell>{req.primary_court || 'High Court'}</TableCell>
                    <TableCell>{req.experience_years} Years</TableCell>
                    <TableCell>
                      <Chip label="Pending Review" size="small" sx={{ backgroundColor: '#F59E0B22', color: '#F59E0B', fontWeight: 600 }} />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleOpenReview(req)}
                        sx={{ backgroundColor: '#D4AF37', color: '#0B1426', fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
                      >
                        Inspect & Verify
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Verification Review Modal */}
      <Dialog
        open={openReviewDialog}
        onClose={() => setOpenReviewDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { backgroundColor: '#0F172A', border: '1px solid #334155', color: '#F8FAFC', borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShieldCheck size={22} color="#D4AF37" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Inspect Bar Council Credentials: {selectedReq?.full_name}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 2 }}>
                <CardMedia
                  component="img"
                  height="220"
                  image={selectedReq?.bar_council_cert_url || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80'}
                  alt="Bar Council Certificate"
                />
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#F8FAFC', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FileText size={16} color="#D4AF37" /> Bar Council Certificate / Sanad
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                    Uploaded official document proof.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ p: 2, backgroundColor: '#1E293B', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>Claimed Bar Enrollment Number</Typography>
                  <Typography variant="h6" sx={{ color: '#38BDF8', fontFamily: 'monospace', fontWeight: 700 }}>
                    {selectedReq?.enrollment_number}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, backgroundColor: '#1E293B', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>Bar Council State Jurisdiction</Typography>
                  <Typography variant="body1" sx={{ color: '#F8FAFC', fontWeight: 600 }}>
                    {selectedReq?.bar_state}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, backgroundColor: '#1E293B', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>Primary Practice Court</Typography>
                  <Typography variant="body1" sx={{ color: '#F8FAFC', fontWeight: 600 }}>
                    {selectedReq?.primary_court || 'Delhi High Court'}
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Rejection Reason (if applicable)"
                  placeholder="e.g. Blurred certificate, Bar number mismatch..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  sx={{
                    '& .MuiInputLabel-root': { color: '#94A3B8' },
                    '& .MuiOutlinedInput-root': {
                      color: '#F8FAFC',
                      backgroundColor: '#1E293B',
                      '& fieldset': { borderColor: '#334155' }
                    }
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #1E293B' }}>
          <Button onClick={() => setOpenReviewDialog(false)} sx={{ color: '#94A3B8', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleAction('reject')}
            startIcon={<XCircle size={18} />}
            sx={{ borderColor: '#EF4444', color: '#EF4444', textTransform: 'none', borderRadius: 2 }}
          >
            Reject Request
          </Button>
          <Button
            variant="contained"
            onClick={() => handleAction('approve')}
            startIcon={<CheckCircle size={18} />}
            sx={{ backgroundColor: '#10B981', '&:hover': { backgroundColor: '#059669' }, color: '#FFFFFF', textTransform: 'none', borderRadius: 2 }}
          >
            Approve & Grant Badge
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

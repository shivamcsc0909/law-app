import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress
} from '@mui/material';
import {
  ShieldCheck,
  Users,
  Briefcase,
  AlertTriangle,
  FileCheck2,
  Scale,
  TrendingUp,
  Clock
} from 'lucide-react';
import { api } from '../services/api';

interface DashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ onNavigateTab }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await api.getDashboardMetrics();
    setMetrics(data);
    setLoading(false);
  };

  if (loading) {
    return <LinearProgress sx={{ backgroundColor: '#1E293B', '& .MuiLinearProgress-bar': { backgroundColor: '#D4AF37' } }} />;
  }

  const statCards = [
    { title: 'Total Registered Users', value: metrics?.total_users || 0, icon: <Users size={24} color="#38BDF8" />, sub: '+12% this month' },
    { title: 'Verified Advocates', value: metrics?.verified_lawyers || 0, icon: <ShieldCheck size={24} color="#10B981" />, sub: 'Bar Verified' },
    { title: 'Pending Verifications', value: metrics?.pending_verifications || 0, icon: <Clock size={24} color="#F59E0B" />, sub: 'Action Required', highlight: true },
    { title: 'Active Cases & Workspaces', value: metrics?.total_cases || 0, icon: <Scale size={24} color="#A78BFA" />, sub: 'Client Workspaces' },
    { title: 'Open Jobs & Internships', value: metrics?.total_jobs || 0, icon: <Briefcase size={24} color="#FB7185" />, sub: 'Career Market' },
    { title: 'Pending Reports', value: metrics?.pending_reports || 0, icon: <AlertTriangle size={24} color="#EF4444" />, sub: 'Moderation Queue' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#F8FAFC' }}>
            System Executive Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
            Real-time ecosystem metrics across Indian legal professionals, students, citizens & law firms.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={loadData}
          sx={{
            backgroundColor: '#1E3A8A',
            '&:hover': { backgroundColor: '#1D4ED8' },
            textTransform: 'none',
            borderRadius: 2
          }}
        >
          Refresh Data
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {statCards.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card
              sx={{
                backgroundColor: stat.highlight ? '#1E293B' : '#0F172A',
                border: `1px solid ${stat.highlight ? '#F59E0B' : '#334155'}`,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                    {stat.title}
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 2, backgroundColor: '#1E293B' }}>
                    {stat.icon}
                  </Box>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#F8FAFC', my: 1 }}>
                  {stat.value}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TrendingUp size={14} color="#10B981" />
                  <Typography variant="caption" sx={{ color: stat.highlight ? '#F59E0B' : '#94A3B8', fontWeight: 600 }}>
                    {stat.sub}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Verification Action Queue */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              p: 3,
              backgroundColor: '#0F172A',
              border: '1px solid #334155',
              borderRadius: 3
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FileCheck2 size={20} color="#D4AF37" />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#F8FAFC' }}>
                  Lawyer Verification Queue
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={() => onNavigateTab('verifications')}
                sx={{ color: '#38BDF8', textTransform: 'none' }}
              >
                View All ({metrics?.pending_verifications || 0})
              </Button>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { color: '#94A3B8', borderColor: '#334155', fontWeight: 600 } }}>
                    <TableCell>Advocate Name</TableCell>
                    <TableCell>Bar State</TableCell>
                    <TableCell>Enrollment No.</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metrics?.recent_verification_queue?.map((req: any) => (
                    <TableRow key={req.id} sx={{ '& td': { color: '#F8FAFC', borderColor: '#1E293B' } }}>
                      <TableCell sx={{ fontWeight: 600 }}>{req.full_name}</TableCell>
                      <TableCell>{req.bar_state}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', color: '#38BDF8' }}>{req.enrollment_number}</TableCell>
                      <TableCell>
                        <Chip label="Pending" size="small" sx={{ backgroundColor: '#F59E0B22', color: '#F59E0B', fontWeight: 600 }} />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => onNavigateTab('verifications')}
                          sx={{ borderColor: '#D4AF37', color: '#D4AF37', textTransform: 'none', borderRadius: 1.5 }}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              p: 3,
              backgroundColor: '#0F172A',
              border: '1px solid #334155',
              borderRadius: 3
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Users size={20} color="#38BDF8" />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#F8FAFC' }}>
                  Recent Registrations
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={() => onNavigateTab('users')}
                sx={{ color: '#38BDF8', textTransform: 'none' }}
              >
                Manage
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {metrics?.recent_users?.map((u: any) => (
                <Box
                  key={u.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: '#1E293B'
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#F8FAFC', fontWeight: 600 }}>
                      {u.full_name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                      {u.city || 'India'} • {u.role.replace('_', ' ').toUpperCase()}
                    </Typography>
                  </Box>
                  <Chip
                    label={u.role.replace('_', ' ')}
                    size="small"
                    sx={{
                      backgroundColor: u.role.includes('advocate') ? '#10B98122' : '#38BDF822',
                      color: u.role.includes('advocate') ? '#10B981' : '#38BDF8',
                      textTransform: 'capitalize',
                      fontSize: '0.7rem'
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

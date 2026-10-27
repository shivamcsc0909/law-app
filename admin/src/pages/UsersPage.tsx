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
  TextField,
  InputAdornment
} from '@mui/material';
import { Search, ShieldCheck, UserX, UserCheck } from 'lucide-react';
import { api } from '../services/api';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await api.getUsers();
    setUsers(data);
  };

  const handleToggleStatus = async (id: number) => {
    await api.toggleUserStatus(id);
    setUsers(users.map(u => u.id === id ? { ...u, is_active: u.is_active ? 0 : 1 } : u));
  };

  const filteredUsers = users.filter(u =>
    (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.primary_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#F8FAFC' }}>
            User & Organization Directory
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
            Manage permissions, advocate privileges, and account status across all platform roles.
          </Typography>
        </Box>
        <TextField
          size="small"
          placeholder="Search users by name, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} color="#94A3B8" />
              </InputAdornment>
            ),
          }}
          sx={{
            width: 300,
            '& .MuiOutlinedInput-root': {
              color: '#F8FAFC',
              backgroundColor: '#0F172A',
              '& fieldset': { borderColor: '#334155' }
            }
          }}
        />
      </Box>

      <Paper sx={{ backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#1E293B' }}>
              <TableRow sx={{ '& th': { color: '#94A3B8', fontWeight: 600 } }}>
                <TableCell>Name & Identifier</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Verification</TableCell>
                <TableCell>Account State</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} sx={{ '& td': { color: '#F8FAFC', borderColor: '#1E293B' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{user.full_name}</Typography>
                      {user.verified_badge === 1 && <ShieldCheck size={16} color="#10B981" />}
                    </Box>
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>{user.primary_email || user.primary_phone}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role.replace('_', ' ').toUpperCase()}
                      size="small"
                      sx={{
                        backgroundColor: user.role.includes('advocate') ? '#10B98122' : '#38BDF822',
                        color: user.role.includes('advocate') ? '#10B981' : '#38BDF8',
                        fontWeight: 600,
                        fontSize: '0.7rem'
                      }}
                    />
                  </TableCell>
                  <TableCell>{user.city || 'India'}</TableCell>
                  <TableCell>
                    {user.verified_badge === 1 ? (
                      <Chip label="Verified" size="small" sx={{ backgroundColor: '#10B98122', color: '#10B981', fontWeight: 600 }} />
                    ) : (
                      <Chip label="Unverified" size="small" sx={{ backgroundColor: '#64748B22', color: '#94A3B8' }} />
                    )}
                  </TableCell>
                  <TableCell>
                    {user.is_active ? (
                      <Chip label="Active" size="small" sx={{ backgroundColor: '#10B98122', color: '#10B981' }} />
                    ) : (
                      <Chip label="Suspended" size="small" sx={{ backgroundColor: '#EF444422', color: '#EF4444' }} />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleToggleStatus(user.id)}
                      startIcon={user.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                      sx={{
                        borderColor: user.is_active ? '#EF4444' : '#10B981',
                        color: user.is_active ? '#EF4444' : '#10B981',
                        textTransform: 'none',
                        borderRadius: 2
                      }}
                    >
                      {user.is_active ? 'Suspend' : 'Activate'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

'use client';

import React, { useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
  Box, Grid, Typography, Card, CardContent, TextField,
  Button, Divider, Alert, Chip, CircularProgress,
} from '@mui/material';
import { useAdminProfile, useSettings, useSessions, useApiKeys } from '@/lib/useApi';
import { updateAdminProfile, changeAdminPassword, updateSettings, revokeSession, flushSessions, createApiKey, deleteApiKey } from '@/lib/api';


const CYAN = '#00F5D4';
const PURPLE = '#8A2BE2';

const cardSx = {
  background: 'linear-gradient(127.09deg, rgba(6,11,40,0.94) 19.41%, rgba(10,14,35,0.49) 76.65%)',
  backdropFilter: 'blur(120px)',
  borderRadius: '20px',
  border: '1px solid rgba(226,232,240,0.1)',
  mb: 3,
};

const labelSx = { color: '#A0AEC0', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', mb: 0.5 };
const valueSx = { color: CYAN, fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', wordBreak: 'break-all' };
const fieldSx = { '& .MuiInputBase-root': { color: '#fff' }, '& label': { color: '#A0AEC0' } };

function StatusFeedback({ success, error }) {
  if (success) return <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>{success}</Alert>;
  if (error)   return <Alert severity="error"   sx={{ mt: 2, borderRadius: 2 }}>{error}</Alert>;
  return null;
}

function ProfilePanel({ profile, onSaved }) {
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ success: null, error: null });

  React.useEffect(() => {
    if (profile) { setDisplayName(profile.display_name ?? ''); setEmail(profile.email ?? ''); }
  }, [profile]);

  const handleSave = useCallback(async () => {
    setSaving(true); setFeedback({ success: null, error: null });
    try {
      await updateAdminProfile({ display_name: displayName, email });
      setFeedback({ success: 'Profile updated successfully.', error: null });
      onSaved?.();
    } catch (err) {
      setFeedback({ success: null, error: err?.data?.error ?? err?.message ?? 'Update failed' });
    } finally { setSaving(false); }
  }, [displayName, email, onSaved]);

  if (!profile) return <CircularProgress size={24} sx={{ color: CYAN }} />;

  return (
    <Box>
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6}>
          <Typography sx={labelSx}>Username</Typography>
          <Typography sx={valueSx}>{profile.username}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography sx={labelSx}>Role</Typography>
          <Chip label={profile.role} size="small" sx={{ background: `${PURPLE}33`, color: CYAN, border: `1px solid ${PURPLE}`, fontFamily: 'monospace' }} />
        </Grid>
        <Grid item xs={12}>
          <Typography sx={labelSx}>Last Updated</Typography>
          <Typography sx={{ ...valueSx, color: '#A0AEC0' }}>
            {profile.updated_at_ms ? new Date(profile.updated_at_ms).toLocaleString() : '—'}
          </Typography>
        </Grid>
      </Grid>
      <Divider sx={{ mb: 3, borderColor: 'rgba(226,232,240,0.1)' }} />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} fullWidth size="small" inputProps={{ maxLength: 80 }} sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth size="small" inputProps={{ maxLength: 254 }} sx={fieldSx} />
        </Grid>
      </Grid>
      <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ mt: 2, background: CYAN, color: '#000', fontWeight: 700, borderRadius: 2, '&:hover': { background: '#00c8ad' } }}>
        {saving ? <CircularProgress size={18} sx={{ color: '#000' }} /> : 'Save Profile'}
      </Button>
      <StatusFeedback {...feedback} />
    </Box>
  );
}

function PasswordPanel() {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ success: null, error: null });
  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = useCallback(async () => {
    setSaving(true); setFeedback({ success: null, error: null });
    try {
      await changeAdminPassword(form);
      setFeedback({ success: 'Password changed. Re-login with the new password.', error: null });
      setForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setFeedback({ success: null, error: err?.data?.error ?? err?.message ?? 'Password change failed' });
    } finally { setSaving(false); }
  }, [form]);

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField label="Current Password" type="password" value={form.current_password} onChange={handleChange('current_password')} fullWidth size="small" sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="New Password (≥ 12 chars)" type="password" value={form.new_password} onChange={handleChange('new_password')} fullWidth size="small" sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Confirm New Password" type="password" value={form.confirm_password} onChange={handleChange('confirm_password')} fullWidth size="small" sx={fieldSx} />
        </Grid>
      </Grid>
      <Button variant="outlined" onClick={handleSubmit}
        disabled={saving || !form.current_password || !form.new_password || !form.confirm_password}
        sx={{ mt: 2, borderColor: PURPLE, color: CYAN, fontWeight: 700, borderRadius: 2, '&:hover': { borderColor: CYAN } }}>
        {saving ? <CircularProgress size={18} sx={{ color: CYAN }} /> : 'Change Password'}
      </Button>
      <StatusFeedback {...feedback} />
    </Box>
  );
}

function SettingsPanel({ settings, onSaved }) {
  const [logLevel, setLogLevel] = useState(settings?.system_settings?.log_level ?? 'info');
  const [refreshInterval, setRefreshInterval] = useState(settings?.user_settings?.refresh_interval_secs ?? 5);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ success: null, error: null });

  React.useEffect(() => {
    if (settings) {
      setLogLevel(settings.system_settings?.log_level ?? 'info');
      setRefreshInterval(settings.user_settings?.refresh_interval_secs ?? 5);
    }
  }, [settings]);

  const handleSave = useCallback(async () => {
    setSaving(true); setFeedback({ success: null, error: null });
    try {
      await updateSettings({ system_settings: { log_level: logLevel }, user_settings: { refresh_interval_secs: Number(refreshInterval) } });
      setFeedback({ success: 'Settings saved successfully.', error: null });
      onSaved?.();
    } catch (err) {
      setFeedback({ success: null, error: err?.data?.error ?? err?.message ?? 'Settings update failed' });
    } finally { setSaving(false); }
  }, [logLevel, refreshInterval, onSaved]);

  if (!settings) return <CircularProgress size={24} sx={{ color: CYAN }} />;
  const { cryptographic_identity: ci, security_policies: sp } = settings;

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ color: PURPLE, fontWeight: 700, mb: 1.5, letterSpacing: '0.05em' }}>CRYPTOGRAPHIC IDENTITY — IMMUTABLE</Typography>
      <Grid container spacing={2} mb={3}>
        {[['Node ID', ci?.node_id], ['KEM Algorithm', ci?.kem_algorithm], ['DSA Algorithm', ci?.dsa_algorithm], ['Signer Fingerprint', ci?.signer_pub_fingerprint]].map(([label, val]) => (
          <Grid item xs={12} sm={6} key={label}>
            <Typography sx={labelSx}>{label}</Typography>
            <Typography sx={valueSx}>{val ?? '—'}</Typography>
          </Grid>
        ))}
      </Grid>
      <Divider sx={{ mb: 2, borderColor: 'rgba(226,232,240,0.1)' }} />
      <Typography variant="subtitle2" sx={{ color: '#A0AEC0', fontWeight: 700, mb: 1.5, letterSpacing: '0.05em' }}>SECURITY POLICIES</Typography>
      <Grid container spacing={2} mb={3}>
        {[['Min Password Length', sp?.min_password_length], ['Session Idle Timeout', sp ? `${sp.session_idle_timeout_secs}s` : '—'], ['Session Hard Timeout', sp ? `${sp.session_hard_timeout_secs}s` : '—'], ['Max Failed Logins', sp?.max_failed_logins]].map(([label, val]) => (
          <Grid item xs={12} sm={6} key={label}>
            <Typography sx={labelSx}>{label}</Typography>
            <Typography sx={valueSx}>{val ?? '—'}</Typography>
          </Grid>
        ))}
      </Grid>
      <Divider sx={{ mb: 2, borderColor: 'rgba(226,232,240,0.1)' }} />
      <Typography variant="subtitle2" sx={{ color: CYAN, fontWeight: 700, mb: 1.5, letterSpacing: '0.05em' }}>OPERATIONAL SETTINGS</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField select label="Log Level" value={logLevel} onChange={(e) => setLogLevel(e.target.value)} fullWidth size="small" SelectProps={{ native: true }} sx={fieldSx}>
            {['trace', 'debug', 'info', 'warn', 'error'].map((l) => <option key={l} value={l} style={{ background: '#0F1525' }}>{l}</option>)}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="UI Refresh Interval (secs)" type="number" value={refreshInterval} onChange={(e) => setRefreshInterval(e.target.value)} fullWidth size="small" inputProps={{ min: 1, max: 3600 }} sx={fieldSx} />
        </Grid>
      </Grid>
      <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ mt: 2, background: CYAN, color: '#000', fontWeight: 700, borderRadius: 2, '&:hover': { background: '#00c8ad' } }}>
        {saving ? <CircularProgress size={18} sx={{ color: '#000' }} /> : 'Save Settings'}
      </Button>
      <StatusFeedback {...feedback} />
    </Box>
  );
}


function SessionsPanel({ sessions, onRefetch }) {
  const [busy, setBusy] = useState(null);
  const [feedback, setFeedback] = useState({ success: null, error: null });

  const handleRevoke = useCallback(async (sessionId) => {
    setBusy(sessionId); setFeedback({ success: null, error: null });
    try {
      await revokeSession(sessionId);
      setFeedback({ success: `Session ${sessionId} revoked.`, error: null });
      onRefetch?.();
    } catch (err) {
      setFeedback({ success: null, error: err?.data?.error ?? err?.message ?? 'Revoke failed' });
    } finally { setBusy(null); }
  }, [onRefetch]);

  const handleFlush = useCallback(async () => {
    setBusy('flush'); setFeedback({ success: null, error: null });
    try {
      const res = await flushSessions(true);
      setFeedback({ success: `Flushed ${res?.flushed ?? '?'} session(s). Your session is preserved.`, error: null });
      onRefetch?.();
    } catch (err) {
      setFeedback({ success: null, error: err?.data?.error ?? err?.message ?? 'Flush failed' });
    } finally { setBusy(null); }
  }, [onRefetch]);

  const list = sessions?.sessions ?? [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" sx={{ color: '#A0AEC0' }}>{list.length} active session{list.length !== 1 ? 's' : ''}</Typography>
        <Button variant="outlined" size="small" onClick={handleFlush} disabled={busy === 'flush'}
          sx={{ borderColor: '#ff4444', color: '#ff4444', borderRadius: 2, fontWeight: 700, '&:hover': { borderColor: '#ff6666' } }}>
          {busy === 'flush' ? <CircularProgress size={14} sx={{ color: '#ff4444' }} /> : 'Flush All Others'}
        </Button>
      </Box>
      {list.length === 0 && <Typography sx={{ color: '#A0AEC0', fontSize: '0.85rem' }}>No active sessions.</Typography>}
      {list.map((s) => (
        <Box key={s.session_id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, p: 1.5, borderRadius: 2, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(226,232,240,0.08)' }}>
          <Box>
            <Typography sx={{ ...valueSx, fontSize: '0.8rem' }}>{s.session_id}</Typography>
            <Typography sx={{ color: '#A0AEC0', fontSize: '0.72rem' }}>
              {s.username} · {s.node_id ?? 'local'} · {s.created_at_ms ? new Date(s.created_at_ms).toLocaleString() : ''}
              {s.revoked ? ' · REVOKED' : ''}
            </Typography>
          </Box>
          <Button size="small" variant="outlined" onClick={() => handleRevoke(s.session_id)}
            disabled={!!busy || s.revoked}
            sx={{ borderColor: PURPLE, color: CYAN, borderRadius: 2, fontSize: '0.72rem', '&:hover': { borderColor: CYAN } }}>
            {busy === s.session_id ? <CircularProgress size={12} sx={{ color: CYAN }} /> : 'Revoke'}
          </Button>
        </Box>
      ))}
      <StatusFeedback {...feedback} />
    </Box>
  );
}

function ApiKeysPanel({ apiKeys, onRefetch }) {
  const [newName, setNewName] = useState('');
  const [newExpiry, setNewExpiry] = useState('');
  const [creating, setCreating] = useState(false);
  const [newSecret, setNewSecret] = useState(null);
  const [busy, setBusy] = useState(null);
  const [feedback, setFeedback] = useState({ success: null, error: null });

  const handleCreate = useCallback(async () => {
    setCreating(true); setFeedback({ success: null, error: null }); setNewSecret(null);
    try {
      const res = await createApiKey(newName.trim(), newExpiry ? Number(newExpiry) : null);
      setNewSecret(res?.secret ?? null);
      setNewName(''); setNewExpiry('');
      setFeedback({ success: `API key "${res?.id}" created. Copy the secret now — it will not be shown again.`, error: null });
      onRefetch?.();
    } catch (err) {
      setFeedback({ success: null, error: err?.data?.error ?? err?.message ?? 'Create failed' });
    } finally { setCreating(false); }
  }, [newName, newExpiry, onRefetch]);

  const handleDelete = useCallback(async (id) => {
    setBusy(id); setFeedback({ success: null, error: null });
    try {
      await deleteApiKey(id);
      setFeedback({ success: `API key ${id} revoked.`, error: null });
      onRefetch?.();
    } catch (err) {
      setFeedback({ success: null, error: err?.data?.error ?? err?.message ?? 'Delete failed' });
    } finally { setBusy(null); }
  }, [onRefetch]);

  const keys = apiKeys?.keys ?? [];

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <TextField label="Key Name" value={newName} onChange={(e) => setNewName(e.target.value)}
          size="small" sx={{ ...fieldSx, flex: 2, minWidth: 160 }} inputProps={{ maxLength: 64 }} />
        <TextField label="Expires (days, optional)" type="number" value={newExpiry} onChange={(e) => setNewExpiry(e.target.value)}
          size="small" sx={{ ...fieldSx, flex: 1, minWidth: 120 }} inputProps={{ min: 1 }} />
        <Button variant="contained" onClick={handleCreate} disabled={creating || !newName.trim()}
          sx={{ background: CYAN, color: '#000', fontWeight: 700, borderRadius: 2, '&:hover': { background: '#00c8ad' } }}>
          {creating ? <CircularProgress size={16} sx={{ color: '#000' }} /> : 'Create Key'}
        </Button>
      </Box>
      {newSecret && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          <strong>Secret (shown once):</strong>
          <Typography sx={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all', mt: 0.5 }}>{newSecret}</Typography>
        </Alert>
      )}
      {keys.length === 0 && <Typography sx={{ color: '#A0AEC0', fontSize: '0.85rem' }}>No API keys configured.</Typography>}
      {keys.map((k) => (
        <Box key={k.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, p: 1.5, borderRadius: 2, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(226,232,240,0.08)' }}>
          <Box>
            <Typography sx={{ ...valueSx, fontSize: '0.8rem' }}>{k.id}</Typography>
            <Typography sx={{ color: '#A0AEC0', fontSize: '0.72rem' }}>
              {k.name} · created {k.created_at_ms ? new Date(k.created_at_ms).toLocaleString() : ''}
              {k.expires_at_ms ? ` · expires ${new Date(k.expires_at_ms).toLocaleString()}` : ' · never expires'}
              {!k.active ? ' · REVOKED' : ''}
            </Typography>
          </Box>
          <Button size="small" variant="outlined" onClick={() => handleDelete(k.id)}
            disabled={!!busy || !k.active}
            sx={{ borderColor: PURPLE, color: CYAN, borderRadius: 2, fontSize: '0.72rem', '&:hover': { borderColor: CYAN } }}>
            {busy === k.id ? <CircularProgress size={12} sx={{ color: CYAN }} /> : 'Revoke'}
          </Button>
        </Box>
      ))}
      <StatusFeedback {...feedback} />
    </Box>
  );
}

export default function AdminPage() {
  const { data: profile, loading: profileLoading, error: profileError, refetch: refetchProfile } = useAdminProfile();
  const { data: settings, loading: settingsLoading, error: settingsError, refetch: refetchSettings } = useSettings();
  const { data: sessions, loading: sessionsLoading, error: sessionsError, refetch: refetchSessions } = useSessions(30000);
  const { data: apiKeys, loading: apiKeysLoading, error: apiKeysError, refetch: refetchApiKeys } = useApiKeys();

  return (
    <DashboardLayout title="Admin">
      <Box sx={{ maxWidth: 960, mx: 'auto' }}>
        <Card sx={cardSx}>
          <CardContent>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>Administrator Profile</Typography>
            <Typography variant="body2" sx={{ color: '#A0AEC0', mb: 3 }}>Update your display name and email. Username and role are immutable.</Typography>
            {profileLoading && <CircularProgress size={24} sx={{ color: CYAN }} />}
            {profileError && <Alert severity="error" sx={{ borderRadius: 2 }}>Failed to load profile: {profileError?.message ?? 'Unknown error'}</Alert>}
            {!profileLoading && !profileError && <ProfilePanel profile={profile} onSaved={refetchProfile} />}
          </CardContent>
        </Card>

        <Card sx={cardSx}>
          <CardContent>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>Change Password</Typography>
            <Typography variant="body2" sx={{ color: '#A0AEC0', mb: 3 }}>Passwords must be at least 12 characters. Current session tokens remain valid until the next login.</Typography>
            <PasswordPanel />
          </CardContent>
        </Card>

        <Card sx={cardSx}>
          <CardContent>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>System Settings</Typography>
            <Typography variant="body2" sx={{ color: '#A0AEC0', mb: 3 }}>Cryptographic identity is enforced by the runtime. Operational settings are persisted to the credential store.</Typography>
            {settingsLoading && <CircularProgress size={24} sx={{ color: CYAN }} />}
            {settingsError && <Alert severity="error" sx={{ borderRadius: 2 }}>Failed to load settings: {settingsError?.message ?? 'Unknown error'}</Alert>}
            {!settingsLoading && !settingsError && <SettingsPanel settings={settings} onSaved={refetchSettings} />}
          </CardContent>
        </Card>

        <Card sx={cardSx}>
          <CardContent>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>Active Sessions</Typography>
            <Typography variant="body2" sx={{ color: '#A0AEC0', mb: 3 }}>
              All authenticated sessions. Revoke individual sessions or flush all others (your current session is always preserved).
            </Typography>
            {sessionsLoading && <CircularProgress size={24} sx={{ color: CYAN }} />}
            {sessionsError && <Alert severity="error" sx={{ borderRadius: 2 }}>Failed to load sessions: {sessionsError?.message ?? 'Unknown error'}</Alert>}
            {!sessionsLoading && !sessionsError && <SessionsPanel sessions={sessions} onRefetch={refetchSessions} />}
          </CardContent>
        </Card>

        <Card sx={cardSx}>
          <CardContent>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>API Keys</Typography>
            <Typography variant="body2" sx={{ color: '#A0AEC0', mb: 3 }}>
              Machine-to-machine credentials. Secrets are shown only at creation time and stored as BLAKE3 hashes.
            </Typography>
            {apiKeysLoading && <CircularProgress size={24} sx={{ color: CYAN }} />}
            {apiKeysError && <Alert severity="error" sx={{ borderRadius: 2 }}>Failed to load API keys: {apiKeysError?.message ?? 'Unknown error'}</Alert>}
            {!apiKeysLoading && !apiKeysError && <ApiKeysPanel apiKeys={apiKeys} onRefetch={refetchApiKeys} />}
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}


import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { Role } from '../../../security/roles/roles';
import { getRoleBadgeClass } from '../../../shared/utils/helpers';
import { apiClient } from '../../../services/api';
import {
  User as UserIcon,
  Mail,
  Building2,
  Calendar,
  MapPin,
  Clock,
  TrendingUp,
  FileText,
  Settings,
  Download,
  LogOut as LogOutIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = Array.from({ length: 16 }, (_, i) => (2020 + i).toString());

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'performance' | 'documents' | 'security'>('overview');

  // MFA / 2FA States
  const [mfaStatus, setMfaStatus] = useState<{ enabled: boolean; verifiedAt: string | null }>({ enabled: false, verifiedAt: null });
  const [setupData, setSetupData] = useState<{ secret: string; qrCodeDataUrl: string; otpauthUrl: string } | null>(null);
  const [enrollCode, setEnrollCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [isDisableMode, setIsDisableMode] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [regenPassword, setRegenPassword] = useState('');

  const fetchMfaStatus = async () => {
    try {
      const res = await apiClient.get('/v1/auth/mfa/totp/status');
      if (res.data && res.data.success) {
        setMfaStatus(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'security') {
      fetchMfaStatus();
      setSetupData(null);
      setIsSetupMode(false);
      setIsDisableMode(false);
      setSecurityError('');
      setSecuritySuccess('');
      setRecoveryCodes([]);
    }
  }, [activeTab]);

  const handleStartSetup = async () => {
    setSecurityError('');
    setSecuritySuccess('');
    setSecurityLoading(true);
    try {
      const res = await apiClient.post('/v1/auth/mfa/totp/enroll');
      if (res.data && res.data.success) {
        setSetupData(res.data.data);
        setIsSetupMode(true);
      }
    } catch (err: any) {
      setSecurityError(err.response?.data?.message || 'Failed to initiate MFA setup.');
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleVerifyEnroll = async () => {
    setSecurityError('');
    setSecuritySuccess('');
    setSecurityLoading(true);
    try {
      const res = await apiClient.post('/v1/auth/mfa/totp/enroll/verify', { code: enrollCode });
      if (res.data && res.data.success) {
        setRecoveryCodes(res.data.data.recoveryCodes);
        setMfaStatus({ enabled: true, verifiedAt: new Date().toISOString() });
        setIsSetupMode(false);
        setEnrollCode('');
        setSecuritySuccess('Two-Factor Authentication enabled successfully! Store your recovery codes safely.');
      }
    } catch (err: any) {
      setSecurityError(err.response?.data?.message || 'Verification failed. Try again.');
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleConfirmDisable = async () => {
    setSecurityError('');
    setSecuritySuccess('');
    setSecurityLoading(true);
    try {
      const res = await apiClient.post('/v1/auth/mfa/totp/disable', {
        password: disablePassword,
        code: disableCode
      });
      if (res.data && res.data.success) {
        setMfaStatus({ enabled: false, verifiedAt: null });
        setIsDisableMode(false);
        setDisablePassword('');
        setDisableCode('');
        setSecuritySuccess('Two-Factor Authentication disabled successfully.');
      }
    } catch (err: any) {
      setSecurityError(err.response?.data?.message || 'Disable request failed.');
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleRegenCodes = async () => {
    setSecurityError('');
    setSecuritySuccess('');
    setSecurityLoading(true);
    try {
      const res = await apiClient.post('/v1/auth/mfa/totp/recovery-codes/regenerate', { password: regenPassword });
      if (res.data && res.data.success) {
        setRecoveryCodes(res.data.data.recoveryCodes);
        setRegenPassword('');
        setShowRegenModal(false);
        setSecuritySuccess('New recovery codes generated successfully!');
      }
    } catch (err: any) {
      setSecurityError(err.response?.data?.message || 'Failed to regenerate recovery codes.');
    } finally {
      setSecurityLoading(false);
    }
  };

  const [selectedMonth, setSelectedMonth] = useState('August');
  const [selectedYear, setSelectedYear] = useState('2026');

  const monthIndex = MONTHS.indexOf(selectedMonth);
  const yearNum = parseInt(selectedYear, 10);

  // Dynamic calculations for days and starting weekday
  const daysInMonth = new Date(yearNum, monthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(yearNum, monthIndex, 1).getDay(); // 0: Sun, 1: Mon, etc.

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptySlots = Array.from({ length: firstDayOfWeek });

  const handlePrevMonth = () => {
    if (monthIndex === 0) {
      setSelectedMonth('December');
      setSelectedYear((prev) => (parseInt(prev, 10) - 1).toString());
    } else {
      setSelectedMonth(MONTHS[monthIndex - 1]);
    }
  };

  const handleNextMonth = () => {
    if (monthIndex === 11) {
      setSelectedMonth('January');
      setSelectedYear((prev) => (parseInt(prev, 10) + 1).toString());
    } else {
      setSelectedMonth(MONTHS[monthIndex + 1]);
    }
  };

  const handleGoToToday = () => {
    const today = new Date();
    setSelectedMonth(MONTHS[today.getMonth()]);
    setSelectedYear(today.getFullYear().toString());
  };

  const [clientId, setClientId] = useState(() => localStorage.getItem('google_calendar_client_id') || '');
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('google_calendar_token') || '');
  const [events, setEvents] = useState<any[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (document.getElementById('google-gsi-client')) {
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    return () => script.remove();
  }, []);

  const fetchCalendarEvents = async (token: string) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=2026-08-01T00:00:00Z&timeMax=2026-08-31T23:59:59Z&singleEvents=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch events.');
      }
      const data = await response.json();
      setEvents(data.items || []);
    } catch (err: any) {
      console.error(err);
      setAccessToken('');
      localStorage.removeItem('google_calendar_token');
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchCalendarEvents(accessToken);
    }
  }, [accessToken]);

  const handleConnectGoogle = () => {
    if (!clientId) {
      setShowSettings(true);
      return;
    }
    if (!(window as any).google) {
      alert('Google API client is loading, please try again in a moment.');
      return;
    }
    setIsConnecting(true);
    try {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/calendar.readonly',
        callback: (response: any) => {
          setIsConnecting(false);
          if (response.error) {
            alert('Google authentication error: ' + response.error);
            return;
          }
          if (response.access_token) {
            setAccessToken(response.access_token);
            localStorage.setItem('google_calendar_token', response.access_token);
            fetchCalendarEvents(response.access_token);
          }
        },
      });
      client.requestAccessToken();
    } catch (error) {
      console.error(error);
      setIsConnecting(false);
      alert('Initialization error. Please verify your Google Client ID.');
    }
  };

  const handleDisconnectGoogle = () => {
    setAccessToken('');
    setEvents([]);
    localStorage.removeItem('google_calendar_token');
  };

  const getDayStatus = (day: number, dayOfWeek: number) => {
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return 'weekend';
    }

    // Check if there is a matching live event for this day
    const dayStr = `${selectedYear}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const dayEvents = events.filter(event => {
      const start = event.start?.date || event.start?.dateTime || '';
      return start.startsWith(dayStr);
    });

    if (dayEvents.length > 0) {
      const isLeave = dayEvents.some(e => {
        const summary = (e.summary || '').toLowerCase();
        return summary.includes('leave') || summary.includes('vacation') || summary.includes('ooo') || summary.includes('out of office');
      });
      if (isLeave) return 'leave';

      const isWfh = dayEvents.some(e => {
        const summary = (e.summary || '').toLowerCase();
        return summary.includes('wfh') || summary.includes('remote') || summary.includes('home');
      });
      if (isWfh) return 'wfh';

      return 'present';
    }

    // Fallback static calendar logic if no events are fetched
    if (selectedMonth === 'August' && selectedYear === '2026') {
      if (day === 5 || day === 12 || day === 19 || day === 26) {
        return 'wfh';
      } else if (day === 14) {
        return 'leave';
      }
    }
    return 'present';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Header Banner */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">User Profile</h2>
        <p className="text-xs text-slate-400">Manage employee credentials, attendance summary, performance ratings, and documents</p>
      </div>

      {/* Main Profile Card */}
      <div className="glass-panel p-6 md:p-8 space-y-6">
        {/* Profile Info Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-[var(--border-color)] pb-6">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
            alt={user?.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-xl shrink-0"
          />
          <div className="text-center sm:text-left space-y-1 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h3 className="text-xl font-extrabold text-[var(--text-primary)]">{user?.name || 'Maheswari Pinneti'}</h3>
              <span className={`badge ${getRoleBadgeClass(user?.role || Role.EMPLOYEE)} self-center sm:self-auto`}>
                {user?.role}
              </span>
            </div>
            <p className="text-xs font-semibold text-blue-500">{user?.title || 'Frontend Developer'}</p>
            <p className="text-xs text-slate-400 font-medium">{user?.department || 'Engineering Department'}</p>
          </div>

          <div className="text-center sm:text-right flex flex-col items-center sm:items-end gap-2 shrink-0">
            <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/30">
              ID: STK-1005
            </span>
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOutIcon size={13} /> Log Out
            </button>
          </div>
        </div>

        {/* Profile Navigation Tabs */}
        <div className="flex border-b border-[var(--border-color)] gap-4 text-xs font-bold">
          {[
            { id: 'overview', label: 'Overview', icon: <UserIcon size={14} /> },
            { id: 'attendance', label: 'Attendance', icon: <Clock size={14} /> },
            { id: 'performance', label: 'Performance', icon: <TrendingUp size={14} /> },
            { id: 'documents', label: 'Documents', icon: <FileText size={14} /> },
            { id: 'security', label: 'Security', icon: <Settings size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-500 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center gap-3">
                <Mail size={18} className="text-blue-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Official Email</p>
                  <p className="font-bold text-[var(--text-primary)]">{user?.email || 'maheswari@thestackly.com'}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center gap-3">
                <Building2 size={18} className="text-purple-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Department</p>
                  <p className="font-bold text-[var(--text-primary)]">{user?.department || 'Engineering Department'}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center gap-3">
                <MapPin size={18} className="text-amber-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Location / Branch</p>
                  <p className="font-bold text-[var(--text-primary)]">New York HQ - Tech Campus</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center gap-3">
                <Calendar size={18} className="text-emerald-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Joining Date</p>
                  <p className="font-bold text-[var(--text-primary)]">Feb 1, 2023</p>
                </div>
              </div>
            </div>

            {/* Removed Security Permissions */}
          </div>
        )}

        {/* Tab 2: Attendance */}
        {activeTab === 'attendance' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[10px] text-emerald-400 font-bold">Present Days</p>
                <p className="text-lg font-black text-emerald-500">22 Days</p>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-[10px] text-indigo-400 font-bold">Remote WFH</p>
                <p className="text-lg font-black text-indigo-500">4 Days</p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-[10px] text-amber-400 font-bold">Leave Taken</p>
                <p className="text-lg font-black text-amber-500">1 Day</p>
              </div>
            </div>

            {/* Google Calendar API Connection Section */}
            <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h5 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Google Calendar Integration
                  </h5>
                  <p className="text-[10px] text-slate-400">Sync live shifts, leaves, and WFH schedules</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-slate-400 hover:text-blue-500 transition-colors"
                    title="Google API Credentials"
                  >
                    <Settings size={14} />
                  </button>
                  {accessToken ? (
                    <button
                      onClick={handleDisconnectGoogle}
                      className="text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-xl hover:bg-red-500/20 transition-colors"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectGoogle}
                      disabled={isConnecting}
                      className="text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
                    >
                      {isConnecting ? 'Connecting...' : 'Connect Calendar'}
                    </button>
                  )}
                </div>
              </div>

              {showSettings && (
                <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-2 animate-fadeIn">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Google OAuth Client ID</label>
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => {
                        setClientId(e.target.value);
                        localStorage.setItem('google_calendar_client_id', e.target.value);
                      }}
                      placeholder="Enter your OAuth 2.0 Client ID..."
                      className="w-full text-xs bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-2.5 py-1.5 text-[var(--text-primary)] focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <p className="text-[9px] text-slate-500 leading-normal">
                    * Make sure to add <strong>{window.location.origin}</strong> to the Authorized JavaScript origins in the Google Cloud Console.
                  </p>
                </div>
              )}

              {accessToken && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1.5 rounded-xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Successfully synced {events.length} calendar events for August 2026.
                </div>
              )}
            </div>

            {/* Attendance Calendar Card */}
            <div className="p-6 rounded-3xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] shadow-2xl font-sans text-slate-200 space-y-6">
              
              {/* Calendar Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  {/* Prev Button */}
                  <button 
                    onClick={handlePrevMonth}
                    className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {/* Next Button */}
                  <button 
                    onClick={handleNextMonth}
                    className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>

                  {/* Month Dropdown Selector */}
                  <div className="relative">
                    <select 
                      value={selectedMonth} 
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="appearance-none bg-slate-800/60 hover:bg-slate-700/60 border border-slate-800 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
                    >
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Year Dropdown Selector */}
                  <div className="relative">
                    <select 
                      value={selectedYear} 
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="appearance-none bg-slate-800/60 hover:bg-slate-700/60 border border-slate-800 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Today Button */}
                <button 
                  onClick={handleGoToToday}
                  className="px-4 py-2 bg-slate-800/65 hover:bg-slate-700/65 border border-slate-800 text-xs font-bold rounded-xl text-slate-200 transition-colors cursor-pointer"
                >
                  Today
                </button>
              </div>

              {/* Calendar Grid Container */}
              <div className="space-y-4">
                
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 tracking-wider">
                  <div>Su</div>
                  <div>Mo</div>
                  <div>Tu</div>
                  <div>We</div>
                  <div>Th</div>
                  <div>Fr</div>
                  <div>Sa</div>
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2 text-center">
                  {/* Empty Slots */}
                  {emptySlots.map((_, idx) => (
                    <div key={`empty-${idx}`} className="aspect-square flex items-center justify-center text-sm font-semibold text-slate-700" />
                  ))}

                  {/* Day numbers */}
                  {days.map((day) => {
                    const dayOfWeek = (day + firstDayOfWeek) % 7; // Correct weekday index
                    const isToday = day === 5 && selectedMonth === 'August' && selectedYear === '2026';
                    
                    const status = getDayStatus(day, dayOfWeek);

                    let bgClass = 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
                    let tooltip = 'Present';

                    if (status === 'weekend') {
                      bgClass = 'bg-slate-500/5 text-slate-400 border border-slate-500/10 opacity-40';
                      tooltip = 'Weekend';
                    } else if (status === 'wfh') {
                      bgClass = 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20';
                      tooltip = 'Remote (WFH)';
                    } else if (status === 'leave') {
                      bgClass = 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
                      tooltip = 'Leave';
                    }

                    let borderClass = 'border-transparent';
                    if (isToday) {
                      borderClass = 'border-slate-300/80 bg-slate-800/20';
                    }

                    return (
                      <div
                        key={day}
                        title={tooltip}
                        className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-bold transition-all hover:scale-105 border-2 ${borderClass} ${bgClass}`}
                      >
                        <span>{day}</span>
                        {status !== 'weekend' && (
                          <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                            status === 'present' ? 'bg-emerald-500' : status === 'wfh' ? 'bg-indigo-500' : 'bg-amber-500'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Performance */}
        {activeTab === 'performance' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-purple-400">Quarterly KPI Score</p>
                <p className="text-2xl font-black text-purple-500">96 / 100</p>
              </div>
              <span className="badge badge-success">Top 5% Performer</span>
            </div>
          </div>
        )}

        {/* Tab 4: Documents */}
        {activeTab === 'documents' && (
          <div className="space-y-2 text-xs animate-fadeIn">
            {[
              { name: 'Employment Offer Letter & Contract.pdf', size: '2.4 MB' },
              { name: 'Q1 Performance Appraisal Review.pdf', size: '1.1 MB' },
              { name: 'Non-Disclosure Agreement (NDA).pdf', size: '850 KB' },
            ].map((doc, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-blue-500" />
                  <span className="font-semibold text-[var(--text-primary)]">{doc.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                  {doc.size}
                  <button className="p-1 hover:text-blue-500"><Download size={14} /></button>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: Security Settings */}
        {activeTab === 'security' && (
          <div className="space-y-6 text-xs animate-fadeIn text-[var(--text-primary)]">
            <h4 className="text-sm font-extrabold border-b border-[var(--border-color)] pb-2 flex items-center gap-1.5">
              <Settings size={16} className="text-blue-500" /> Two-Factor Authentication (2FA)
            </h4>

            {securityError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-bold">
                {securityError}
              </div>
            )}

            {securitySuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold">
                {securitySuccess}
              </div>
            )}

            {/* Recovery Codes Display Box */}
            {recoveryCodes.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-800/10 border border-blue-500/20 space-y-3">
                <p className="font-extrabold text-blue-500 text-xs">⚠️ IMPORTANT: Store these 10 one-time recovery codes safely!</p>
                <p className="text-[10px] text-slate-400">If you lose your authenticator app access, you can use these codes to log in. Each code can be used only once.</p>
                <div className="grid grid-cols-2 gap-2 font-mono font-bold text-center">
                  {recoveryCodes.map((code, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
                      {code}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const text = recoveryCodes.join('\n');
                    navigator.clipboard.writeText(text);
                    alert('Recovery codes copied to clipboard.');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  Copy to Clipboard
                </button>
              </div>
            )}

            {!isSetupMode && !isDisableMode ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
                  <div>
                    <p className="font-extrabold text-xs">MFA via Authenticator Application</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {mfaStatus.enabled
                        ? `Enabled (Verified on ${new Date(mfaStatus.verifiedAt!).toLocaleDateString()})`
                        : 'Disabled'}
                    </p>
                  </div>
                  {mfaStatus.enabled ? (
                    <button
                      onClick={() => {
                        setIsDisableMode(true);
                        setSecurityError('');
                        setSecuritySuccess('');
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-colors cursor-pointer"
                    >
                      Disable 2FA
                    </button>
                  ) : (
                    <button
                      onClick={handleStartSetup}
                      disabled={securityLoading}
                      className="px-4 py-2 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors cursor-pointer"
                    >
                      {securityLoading ? 'Loading...' : 'Enable 2FA'}
                    </button>
                  )}
                </div>

                {mfaStatus.enabled && (
                  <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-3">
                    <p className="font-extrabold text-xs">Backup Recovery Actions</p>
                    <p className="text-[10px] text-slate-400">Regenerate a new set of 10 one-time recovery codes. Generating new codes makes all previous recovery codes invalid.</p>
                    {showRegenModal ? (
                      <div className="space-y-3 mt-2 max-w-sm">
                        <label className="text-[10px] text-slate-400 font-bold block">Confirm Password</label>
                        <input
                          type="password"
                          value={regenPassword}
                          onChange={(e) => setRegenPassword(e.target.value)}
                          placeholder="Enter your account password"
                          className="auth-input text-xs"
                          style={{ padding: '0.5rem' }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleRegenCodes}
                            disabled={securityLoading || !regenPassword}
                            className="px-3 py-1.5 rounded-lg bg-blue-500 text-white font-bold hover:bg-blue-600 text-xs cursor-pointer"
                          >
                            {securityLoading ? 'Generating...' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setShowRegenModal(false)}
                            className="px-3 py-1.5 rounded-lg bg-[var(--border-color)] text-[var(--text-secondary)] font-bold text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setShowRegenModal(true);
                          setSecurityError('');
                          setSecuritySuccess('');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[var(--border-color)] hover:bg-[var(--border-color)]/80 text-[var(--text-primary)] font-bold border border-[var(--border-color)] cursor-pointer"
                      >
                        Regenerate Recovery Codes
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : isSetupMode ? (
              <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-4 max-w-md mx-auto animate-fadeIn">
                <p className="font-extrabold text-center text-xs">MFA Setup Procedure</p>
                {setupData && (
                  <div className="space-y-4 flex flex-col items-center">
                    <p className="text-[10px] text-slate-400 text-center font-bold">⚠️ Scan this QR code using Microsoft Authenticator ONLY. (Google Authenticator is blocked by organizational policy.)</p>
                    <img src={setupData.qrCodeDataUrl} alt="Setup QR Code" className="w-40 h-40 border border-[var(--border-color)] p-2 rounded-lg bg-white" />
                    <div className="w-full text-center">
                      <p className="text-[10px] text-slate-400">Manual Setup Secret Key:</p>
                      <code className="text-xs font-mono font-bold block bg-[var(--bg-tertiary)] p-2 rounded-lg border border-[var(--border-color)] mt-1 select-all">{setupData.secret}</code>
                    </div>
                    <div className="w-full space-y-2">
                      <label className="text-[10px] text-slate-400 font-bold block">Enter Verification Code</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={enrollCode}
                        onChange={(e) => setEnrollCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="6-digit OTP code"
                        className="auth-input text-center text-sm"
                        style={{ padding: '0.5rem', letterSpacing: '0.1em' }}
                      />
                    </div>
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={handleVerifyEnroll}
                        disabled={securityLoading || enrollCode.length !== 6}
                        className="flex-1 py-2 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors cursor-pointer"
                      >
                        {securityLoading ? 'Verifying...' : 'Verify & Enable'}
                      </button>
                      <button
                        onClick={() => {
                          setIsSetupMode(false);
                          setSetupData(null);
                          setEnrollCode('');
                        }}
                        className="px-4 py-2 rounded-xl bg-[var(--border-color)] text-[var(--text-secondary)] font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-4 max-w-md mx-auto animate-fadeIn">
                <p className="font-extrabold text-center text-xs text-rose-500">Disable Two-Factor Authentication</p>
                <p className="text-[10px] text-slate-400 text-center">Confirm with your password and a current authenticator/recovery code to disable 2FA.</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Account Password</label>
                    <input
                      type="password"
                      value={disablePassword}
                      onChange={(e) => setDisablePassword(e.target.value)}
                      placeholder="Enter account password"
                      className="auth-input text-xs"
                      style={{ padding: '0.5rem' }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">MFA/Recovery Code</label>
                    <input
                      type="text"
                      value={disableCode}
                      onChange={(e) => setDisableCode(e.target.value)}
                      placeholder="Authenticator code or Recovery code"
                      className="auth-input text-xs"
                      style={{ padding: '0.5rem' }}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleConfirmDisable}
                      disabled={securityLoading || !disablePassword || !disableCode}
                      className="flex-1 py-2 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-colors cursor-pointer"
                    >
                      {securityLoading ? 'Disabling...' : 'Confirm Disable'}
                    </button>
                    <button
                      onClick={() => {
                        setIsDisableMode(false);
                        setDisablePassword('');
                        setDisableCode('');
                      }}
                      className="px-4 py-2 rounded-xl bg-[var(--border-color)] text-[var(--text-secondary)] font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

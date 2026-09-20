'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardShell } from '@/shared/layout/dashboard-shell';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Icon } from '@/shared/components/ui/icon';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { MeetingsService, Meeting, AttendanceRecord } from '@/modules/meetings/meetings.service';
import { useTeam } from '@/shared/hooks/useTeam';
import { useAuth } from '@/shared/context/auth-context';

export default function MeetingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params?.id as string;

  const { user } = useAuth();
  const { members } = useTeam();

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Attendance local state (Map of memberId -> boolean isPresent)
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>({});
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);
  const [attendanceSaveMsg, setAttendanceSaveMsg] = useState<string | null>(null);

  // MoM local state
  const [momContent, setMomContent] = useState('');
  const [isSavingMoM, setIsSavingMoM] = useState(false);
  const [momSaveMsg, setMomSaveMsg] = useState<string | null>(null);

  // Active Tab: Attendance vs MoM
  const [activeTab, setActiveTab] = useState<'attendance' | 'mom'>('attendance');

  const loadMeeting = async () => {
    if (!meetingId) return;
    setIsLoading(true);
    try {
      const data = await MeetingsService.getMeetingById(meetingId);
      if (!data) {
        setError('Meeting not found');
      } else {
        setMeeting(data);
        setMomContent(data.mom?.content || '');

        // Populate attendance map from existing records
        const map: Record<string, boolean> = {};
        if (data.attendance && data.attendance.length > 0) {
          data.attendance.forEach((rec) => {
            map[rec.memberId] = Boolean(rec.isPresent);
          });
        }
        setAttendanceMap(map);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load meeting details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMeeting();
  }, [meetingId]);

  // Exclusion Rule: Filter members for domain attendance
  // Exclude Domain Seniors, Domain Leads, Chapter Leads, Developers
  const eligibleAttendanceMembers = useMemo(() => {
    return members.filter((m) => {
      const roleUpper = (m.role || '').toUpperCase();
      const isLeadership =
        roleUpper === 'LEAD' ||
        roleUpper === 'DOMAIN_SENIOR' ||
        roleUpper === 'DOMAIN_LEAD' ||
        roleUpper === 'DEVELOPER' ||
        m.leadTitle;
      return !isLeadership;
    });
  }, [members]);

  // Permission Checks
  const isLeadership = Boolean(
    user && (user.role === 'DEVELOPER' || user.role === 'LEAD' || user.role === 'DOMAIN_SENIOR')
  );

  const isAssignedInCharge = Boolean(
    user &&
      meeting?.assignedInCharge &&
      (meeting.assignedInCharge.id === user.id ||
        (meeting.assignedInCharge.name &&
          user.name &&
          meeting.assignedInCharge.name.toLowerCase().includes(user.name.toLowerCase())))
  );

  const canEdit = isLeadership || isAssignedInCharge;

  // 2-Hour Lock Calculation
  const isAttendanceLocked = useMemo(() => {
    if (!meeting || !meeting.date) return false;
    try {
      const timePart = (meeting.time || '18:00').split(' ')[0];
      const meetingDateTime = new Date(`${meeting.date} ${timePart}`);
      if (isNaN(meetingDateTime.getTime())) return false;

      const twoHoursMs = 2 * 60 * 60 * 1000;
      const now = Date.now();
      // If 2 hours have passed since meeting time
      return now > meetingDateTime.getTime() + twoHoursMs && !isLeadership;
    } catch {
      return false;
    }
  }, [meeting, isLeadership]);

  // Toggle single member attendance checkbox
  const handleToggleAttendance = (memberId: string) => {
    if (!canEdit || isAttendanceLocked) return;
    setAttendanceMap((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  // Mark all present / absent
  const handleMarkAll = (status: boolean) => {
    if (!canEdit || isAttendanceLocked) return;
    const next: Record<string, boolean> = {};
    eligibleAttendanceMembers.forEach((m) => {
      next[m.id] = status;
    });
    setAttendanceMap(next);
  };

  // Save Attendance
  const handleSaveAttendance = async () => {
    if (!meeting || !canEdit || isAttendanceLocked) return;
    setIsSavingAttendance(true);
    setAttendanceSaveMsg(null);

    try {
      const records: AttendanceRecord[] = eligibleAttendanceMembers.map((m) => ({
        memberId: m.id,
        memberName: m.name,
        domain: m.domain || 'General',
        isPresent: Boolean(attendanceMap[m.id]),
        markedAt: new Date().toISOString(),
      }));

      const updated = await MeetingsService.updateAttendance(meeting.id, records);
      setMeeting(updated);
      setAttendanceSaveMsg('Attendance recorded successfully.');
      setTimeout(() => setAttendanceSaveMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save attendance');
    } finally {
      setIsSavingAttendance(false);
    }
  };

  // Save MoM
  const handleSaveMoM = async () => {
    if (!meeting || !canEdit) return;
    setIsSavingMoM(true);
    setMomSaveMsg(null);

    try {
      const updated = await MeetingsService.updateMoM(meeting.id, momContent);
      setMeeting(updated);
      setMomSaveMsg('Minutes of Meeting (MoM) saved successfully.');
      setTimeout(() => setMomSaveMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save MoM');
    } finally {
      setIsSavingMoM(false);
    }
  };

  // Attendance stats
  const presentCount = eligibleAttendanceMembers.filter((m) => attendanceMap[m.id]).length;
  const totalEligible = eligibleAttendanceMembers.length;

  if (isLoading) {
    return (
      <DashboardShell>
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Icon name="sync" size={28} className="spin" />
          <p style={{ marginTop: '12px', fontSize: '0.9375rem' }}>Loading meeting details...</p>
        </div>
      </DashboardShell>
    );
  }

  if (error || !meeting) {
    return (
      <DashboardShell>
        <div style={{ maxWidth: '600px', margin: '40px auto' }}>
          <EmptyState
            title="Meeting Not Found"
            description={error || 'This meeting could not be retrieved or has been removed.'}
            actionLabel="Back to Meetings"
            onAction={() => router.push('/meetings')}
            icon="event_busy"
          />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1080px', margin: '0 auto' }}>
        {/* Back navigation & Meeting Header */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link href="/meetings">
                <Button variant="secondary" size="sm" leftIcon={<Icon name="arrow_back" size={16} />}>
                  Meetings
                </Button>
              </Link>
              <Badge variant={meeting.mode === 'ONLINE' ? 'blue' : 'green'}>
                {meeting.mode === 'ONLINE' ? 'Online Google Meet' : 'Offline In-Person'}
              </Badge>
              {meeting.status === 'LIVE_NOW' && <Badge variant="green">Live Now</Badge>}
              {meeting.status === 'CONCLUDED' && <Badge variant="gray">Concluded</Badge>}
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', margin: '4px 0 0', letterSpacing: '-0.02em' }}>
              {meeting.title}
            </h1>

            {meeting.agenda && (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                {meeting.agenda}
              </p>
            )}

            {/* In-Charge Member Banner */}
            {meeting.assignedInCharge && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--gdg-blue)', marginTop: '4px' }}>
                <Icon name="badge" size={16} color="var(--gdg-blue)" />
                <span>
                  Assigned for Attendance &amp; MoM: <strong>{meeting.assignedInCharge.name}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Quick Actions / Link Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <span>📅 {meeting.date}</span>
              <span>⏰ {meeting.time}</span>
            </div>

            {meeting.mode === 'ONLINE' && meeting.meetLink ? (
              <a href={meeting.meetLink} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <Button variant="primary" leftIcon={<Icon name="videocam" size={18} />}>
                  Join Google Meet
                </Button>
              </a>
            ) : meeting.location ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-main)', background: 'var(--bg-elevated)', padding: '6px 12px', borderRadius: 'var(--radius-md)' }}>
                <Icon name="location_on" size={16} color="var(--gdg-red)" />
                <span><strong>Venue:</strong> {meeting.location}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Tab Navigation: Attendance vs MoM */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            background: 'var(--bg-card)',
            padding: '6px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-color)',
            width: 'fit-content',
          }}
        >
          <button
            onClick={() => setActiveTab('attendance')}
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: activeTab === 'attendance' ? 'var(--md-primary)' : 'transparent',
              color: activeTab === 'attendance' ? 'var(--md-on-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'attendance' ? 700 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
            className="m3-interactive"
          >
            <Icon name="how_to_reg" size={18} />
            <span>Attendance ({presentCount}/{totalEligible})</span>
          </button>

          <button
            onClick={() => setActiveTab('mom')}
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: activeTab === 'mom' ? 'var(--md-primary)' : 'transparent',
              color: activeTab === 'mom' ? 'var(--md-on-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'mom' ? 700 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
            className="m3-interactive"
          >
            <Icon name="description" size={18} />
            <span>Minutes of Meeting (MoM)</span>
          </button>
        </div>

        {/* ========================================================
            SECTION 1: ATTENDANCE
           ======================================================== */}
        {activeTab === 'attendance' && (
          <Card style={{ padding: '24px', borderRadius: 'var(--radius-xl)' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '18px',
                paddingBottom: '14px',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  Domain Members Attendance
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Attendance is taken exclusively for chapter domain members (excluding Domain Seniors &amp; Leads).
                </p>
              </div>

              {/* Status / Lock Alert */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isAttendanceLocked ? (
                  <Badge variant="red">
                    <Icon name="lock" size={14} /> Locked (2-Hour Window Closed)
                  </Badge>
                ) : canEdit ? (
                  <Badge variant="green">
                    <Icon name="edit" size={14} /> Editing Enabled
                  </Badge>
                ) : (
                  <Badge variant="gray">
                    <Icon name="visibility" size={14} /> View Only (Assigned In-Charge access)
                  </Badge>
                )}
              </div>
            </div>

            {/* Quick Bulk Action & Save Row */}
            {canEdit && !isAttendanceLocked && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--bg-elevated)',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleMarkAll(true)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--gdg-green)',
                      cursor: 'pointer',
                    }}
                  >
                    + Mark All Present
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkAll(false)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--gdg-red)',
                      cursor: 'pointer',
                    }}
                  >
                    Clear All
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {attendanceSaveMsg && (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--gdg-green)', fontWeight: 600 }}>
                      {attendanceSaveMsg}
                    </span>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Icon name="save" size={16} />}
                    disabled={isSavingAttendance}
                    onClick={handleSaveAttendance}
                  >
                    {isSavingAttendance ? 'Saving...' : 'Save Attendance'}
                  </Button>
                </div>
              </div>
            )}

            {/* Members Attendance Checklist Table */}
            {eligibleAttendanceMembers.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No eligible domain members found in roster.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {eligibleAttendanceMembers.map((m) => {
                  const isPresent = Boolean(attendanceMap[m.id]);

                  return (
                    <div
                      key={m.id}
                      onClick={() => canEdit && !isAttendanceLocked && handleToggleAttendance(m.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-lg)',
                        background: isPresent ? 'rgba(30, 142, 62, 0.08)' : 'var(--bg-elevated)',
                        border: isPresent ? '1px solid rgba(30, 142, 62, 0.3)' : '1px solid var(--border-color)',
                        cursor: canEdit && !isAttendanceLocked ? 'pointer' : 'default',
                        transition: 'all 0.15s ease',
                      }}
                      className={canEdit && !isAttendanceLocked ? 'm3-interactive' : ''}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                          type="checkbox"
                          checked={isPresent}
                          disabled={!canEdit || isAttendanceLocked}
                          onChange={() => {}}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: canEdit && !isAttendanceLocked ? 'pointer' : 'default',
                            accentColor: 'var(--gdg-green)',
                          }}
                        />
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                            {m.name}
                          </span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {m.domain || 'General Member'} &bull; {m.role}
                          </div>
                        </div>
                      </div>

                      <Badge variant={isPresent ? 'green' : 'gray'}>
                        {isPresent ? 'Present' : 'Absent'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {/* ========================================================
            SECTION 2: MINUTES OF MEETING (MoM)
           ======================================================== */}
        {activeTab === 'mom' && (
          <Card style={{ padding: '24px', borderRadius: 'var(--radius-xl)' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '18px',
                paddingBottom: '14px',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  Minutes of Meeting (MoM)
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Document key discussion points, decisions made, and assigned action items.
                </p>
              </div>

              {meeting.mom?.writtenBy && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Written by <strong>{meeting.mom.writtenBy}</strong>
                  {meeting.mom.updatedAt && ` &bull; ${new Date(meeting.mom.updatedAt).toLocaleString()}`}
                </div>
              )}
            </div>

            {canEdit ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <textarea
                  placeholder="Draft Minutes of Meeting (MoM)...
- Key Announcements
- Discussion Points
- Action Items & Next Deadlines"
                  rows={12}
                  value={momContent}
                  onChange={(e) => setMomContent(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    color: 'var(--text-main)',
                    fontSize: '0.9375rem',
                    fontFamily: 'var(--font-main)',
                    lineHeight: 1.6,
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
                  {momSaveMsg && (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--gdg-green)', fontWeight: 600 }}>
                      {momSaveMsg}
                    </span>
                  )}
                  <Button
                    variant="primary"
                    leftIcon={<Icon name="save" size={18} />}
                    disabled={isSavingMoM}
                    onClick={handleSaveMoM}
                  >
                    {isSavingMoM ? 'Saving...' : 'Save Minutes of Meeting'}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {meeting.mom?.content ? (
                  <div
                    style={{
                      background: 'var(--bg-elevated)',
                      padding: '20px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.9375rem',
                      lineHeight: 1.6,
                      color: 'var(--text-main)',
                    }}
                  >
                    {meeting.mom.content}
                  </div>
                ) : (
                  <EmptyState
                    title="No Minutes of Meeting Yet"
                    description="The assigned member has not yet published the MoM for this session."
                    icon="description"
                  />
                )}
              </div>
            )}
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}

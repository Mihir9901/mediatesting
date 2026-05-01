import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Calendar, Download, Search, UserCheck, Users } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const MARK_OPTIONS = ['Present', 'Absent'];

const TeamHeadAttendance = () => {
  const { user } = useContext(AuthContext);

  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [draftSelections, setDraftSelections] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportDate = useMemo(
    () =>
      new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    [],
  );

  const teamName = useMemo(() => {
    const raw = typeof user?.teamName === 'string' ? user.teamName.trim() : '';
    return raw || 'Assigned Team';
  }, [user?.teamName]);

  const fallbackTeamHeadEntry = useMemo(
    () => ({
      _id: `teamhead-fallback-${user?.id || 'current'}`,
      employee_id: `TEAMHEAD-${user?.id || 'current'}`,
      name: user?.name || 'Team Head',
      domain: 'Team Head',
      departmentName: teamName,
      isTeamHeadSelf: true,
    }),
    [teamName, user?.id, user?.name],
  );

  useEffect(() => {
    let mounted = true;

    const loadAttendance = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/attendance/attendance-data');
        if (!mounted) {
          return;
        }

        setEmployees(response.data?.employees || []);

        const incomingRecords = response.data?.attendanceRecords || {};
        const nextRecords = {};
        Object.entries(incomingRecords).forEach(([employeeId, details]) => {
          nextRecords[employeeId] = details?.status || 'Pending';
        });
        setAttendanceRecords(nextRecords);
      } catch (err) {
        if (!mounted) {
          return;
        }
        setError(err.response?.data?.message || 'Failed to load attendance data. Please try again.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAttendance();
    return () => {
      mounted = false;
    };
  }, []);

  const teamHeadEntry = useMemo(
    () => employees.find((entry) => entry.isTeamHeadSelf) || fallbackTeamHeadEntry,
    [employees, fallbackTeamHeadEntry],
  );

  const teamMembers = useMemo(
    () => employees.filter((entry) => !entry.isTeamHeadSelf),
    [employees],
  );

  const visibleMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return teamMembers;
    }

    return teamMembers.filter((member) => {
      const haystack = `${member.name || ''} ${member.employee_id || ''} ${member.domain || ''} ${member.departmentName || ''}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [search, teamMembers]);

  const getCurrentStatus = (entry) => {
    if (!entry?.employee_id) {
      return 'Pending';
    }
    return attendanceRecords[entry.employee_id] || 'Pending';
  };

  const reportEntries = useMemo(() => {
    const visibleEntries = [...teamMembers];
    if (teamHeadEntry) {
      visibleEntries.unshift(teamHeadEntry);
    }
    return visibleEntries;
  }, [teamHeadEntry, teamMembers]);

  const totalEntries = reportEntries.length;
  const markedCount = reportEntries.filter((entry) => getCurrentStatus(entry) !== 'Pending').length;
  const presentCount = reportEntries.filter((entry) => getCurrentStatus(entry) === 'Present').length;
  const absentCount = reportEntries.filter((entry) => getCurrentStatus(entry) === 'Absent').length;
  const pendingCount = Math.max(totalEntries - markedCount, 0);
  const selectedCount = Object.keys(draftSelections).length;

  const handleDraftSelect = (employeeId, nextStatus) => {
    setDraftSelections((current) => ({
      ...current,
      [employeeId]: nextStatus,
    }));
  };

  const handleSubmitAttendance = async () => {
    const selections = Object.entries(draftSelections);
    if (selections.length === 0) {
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('');

    try {
      await Promise.all(
        selections.map(([employeeId, status]) =>
          api.post('/attendance/mark', {
            employee_id: employeeId,
            status,
          }),
        ),
      );

      setAttendanceRecords((current) => {
        const updated = { ...current };
        selections.forEach(([employeeId, status]) => {
          updated[employeeId] = status;
        });
        return updated;
      });

      setDraftSelections({});
      setStatusMessage('Attendance submitted successfully.');
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Failed to submit attendance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadReport = () => {
    const headerRows = [
      ['Team', teamName],
      ['Date', reportDate],
      ['Downloaded By', user?.name || 'Team Head'],
      [''],
      ['Employee ID', 'Name', 'Role', 'Attendance'],
    ];

    const bodyRows = reportEntries.map((entry) => [
      entry.employee_id || '',
      entry.name || '',
      entry.isTeamHeadSelf ? 'Team Head' : entry.domain || entry.departmentName || 'Intern',
      getCurrentStatus(entry),
    ]);

    const csv = [...headerRows, ...bodyRows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `team-head-attendance-${reportDate.replaceAll(' ', '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderStatus = (entry) => {
    const status = getCurrentStatus(entry);
    const tone =
      status === 'Present'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : status === 'Absent'
          ? 'bg-rose-50 text-rose-700 border-rose-200'
          : 'bg-amber-50 text-amber-700 border-amber-200';

    return (
      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${tone}`}>
        {status === 'Pending' ? 'Not marked' : status}
      </span>
    );
  };

  const renderActionCell = (entry) => {
    const currentStatus = getCurrentStatus(entry);
    const isLocked = currentStatus !== 'Pending';
    const selectedStatus = draftSelections[entry.employee_id] || '';

    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {MARK_OPTIONS.map((option) => {
            const isActive = option === selectedStatus;
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleDraftSelect(entry.employee_id, option)}
                disabled={isLocked}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                  isActive
                    ? 'border-amber-400 bg-amber-400 text-slate-950 shadow-lg shadow-amber-200/70'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700'
                } ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        <p className="text-xs font-medium text-slate-500">
          {isLocked
            ? 'Submitted and saved.'
            : selectedStatus
              ? `Selected as ${selectedStatus}. Submit attendance to finalize.`
              : 'Choose Present or Absent, then submit attendance.'}
        </p>
      </div>
    );
  };

  const renderRow = (entry, label) => (
    <article
      key={entry.employee_id}
      className="grid gap-4 rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-[0_22px_50px_-36px_rgba(15,23,42,0.4)] lg:grid-cols-[2.1fr_1.2fr_1.3fr_1.1fr_2fr]"
    >
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black text-white ${entry.isTeamHeadSelf ? 'bg-slate-900' : 'bg-blue-600'}`}>
          {(entry.name || 'TH')
            .split(' ')
            .slice(0, 2)
            .map((part) => part[0])
            .join('')
            .toUpperCase()}
        </div>
        <div>
          <strong className="block text-base font-black text-slate-900">{entry.name}</strong>
          <p className="text-sm font-medium text-slate-600">{label}</p>
        </div>
      </div>

      <div className="text-sm font-semibold text-slate-700">
        <span className="mb-1 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
          ID
        </span>
        {entry.employee_id}
      </div>

      <div className="text-sm font-semibold text-slate-700">
        <span className="mb-1 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
          Role
        </span>
        {entry.isTeamHeadSelf ? 'Team Head' : entry.domain || entry.departmentName || 'Intern'}
      </div>

      <div>
        <span className="mb-1 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
          Status
        </span>
        {renderStatus(entry)}
      </div>

      <div>
        <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
          Mark Attendance
        </span>
        {renderActionCell(entry)}
      </div>
    </article>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/60">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-6 text-white shadow-[0_26px_70px_-34px_rgba(79,70,229,0.65)]">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-12 left-20 h-32 w-32 rounded-full bg-amber-300/20 blur-3xl" />

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-100">
                Team Head Attendance
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
                Attendance Hub
              </h1>
              <p className="mt-2 max-w-3xl text-sm font-semibold text-blue-50/90">
                Mark attendance for your assigned team and your own Team Head entry from one
                clean attendance table.
              </p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
              <span className="block text-[11px] font-black uppercase tracking-[0.22em] text-blue-100">
                Selected Date
              </span>
              <span className="mt-1 flex items-center gap-2 text-base font-black">
                <Calendar className="h-4 w-4" />
                {reportDate}
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.5fr_0.9fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.22em] text-blue-700">
                  Attendance Overview
                </span>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                  Daily attendance command center
                </h2>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
                  Every row starts unmarked until the Team Head selects Present or Absent and
                  submits the final attendance set.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadReport}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
              >
                <Download className="h-4 w-4" />
                Download report
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-5">
                <span className="text-sm font-medium text-slate-500">Marked today</span>
                <strong className="mt-3 block text-4xl font-black text-slate-950">
                  {markedCount}/{totalEntries}
                </strong>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <span className="text-sm font-medium text-slate-500">Present</span>
                <strong className="mt-3 block text-4xl font-black text-slate-950">
                  {presentCount}
                </strong>
              </div>
              <div className="rounded-3xl bg-amber-50 p-5">
                <span className="text-sm font-medium text-amber-700">Pending action</span>
                <strong className="mt-3 block text-4xl font-black text-slate-950">
                  {pendingCount}
                </strong>
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)]">
            <span className="text-xs font-black uppercase tracking-[0.22em] text-blue-700">
              Team Scope
            </span>
            <div className="mt-4 space-y-4">
              <div className="rounded-3xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-slate-900 p-3 text-white">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Team Head
                    </p>
                    <p className="text-lg font-black text-slate-950">{user?.name || 'Team Head'}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-blue-600 p-3 text-white">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Team
                    </p>
                    <p className="text-lg font-black text-slate-950">{teamName}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Included Entries
                </p>
                <p className="mt-2 text-lg font-black text-slate-950">{totalEntries}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Team Head self-attendance plus assigned team members.
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.22em] text-blue-700">
                Attendance Table
              </span>
              <h3 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                Mark attendance for the full team
              </h3>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative block min-w-[280px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, role, or ID"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
                />
              </label>

              <button
                type="button"
                onClick={handleSubmitAttendance}
                disabled={selectedCount === 0 || isSubmitting}
                className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-200/80 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {isSubmitting ? 'Submitting...' : `Submit Attendance${selectedCount ? ` (${selectedCount})` : ''}`}
              </button>
            </div>
          </div>

          {statusMessage ? (
            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
              {statusMessage}
            </div>
          ) : null}

          {loading ? (
            <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 px-6 py-14 text-center text-sm font-semibold text-slate-500">
              Loading attendance data...
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              {error ? (
                <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-center text-sm font-semibold text-rose-700">
                  {error}
                </div>
              ) : null}

              <div className="hidden rounded-2xl bg-slate-50 px-5 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-slate-400 lg:grid lg:grid-cols-[2.1fr_1.2fr_1.3fr_1.1fr_2fr]">
                <span>Person</span>
                <span>ID</span>
                <span>Role</span>
                <span>Status</span>
                <span>Mark Attendance</span>
              </div>

              {teamHeadEntry ? (
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-black uppercase tracking-[0.22em] text-blue-700">
                      Team Head Self Attendance
                    </span>
                    <h4 className="mt-2 text-xl font-black text-slate-950">
                      Marked separately from intern attendance
                    </h4>
                  </div>
                  {renderRow(teamHeadEntry, 'Team Head')}
                </div>
              ) : null}

              <div className="space-y-3">
                <div>
                  <span className="text-xs font-black uppercase tracking-[0.22em] text-blue-700">
                    Assigned Team Members
                  </span>
                  <h4 className="mt-2 text-xl font-black text-slate-950">Intern attendance list</h4>
                </div>

                {visibleMembers.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm font-semibold text-slate-500">
                    {employees.length === 0
                      ? 'Assigned team members could not be loaded right now.'
                      : 'No team members matched your search.'}
                  </div>
                ) : (
                  visibleMembers.map((member) =>
                    renderRow(member, member.domain || member.departmentName || 'Intern'),
                  )
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TeamHeadAttendance;

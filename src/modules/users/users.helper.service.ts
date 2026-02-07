import { Injectable } from '@nestjs/common';
import * as moment from 'moment-timezone';

export type AttendanceType = 'IN' | 'OUT';

export interface AttendanceLog {
  userId: string;
  employeeCode: string;
  deviceId: string;
  timestamp: string; // ISO
  type: AttendanceType;
}

export interface PenaltyEntry {
  date: string;
  fraction: 0.25;
  reason: "Missing IN/OUT";
  amount?: number; // اختياري لو تحب تعرف قيمة الخصم بالجنيه
}

interface WorkSession {
  inTime: moment.Moment;
  outTime: moment.Moment;
  startDay: string;      // يوم الـ IN
  durationHours: number; // ساعات فعلية
}

export interface LateEntry { date: string; minutes: number; formatted?: string }
export interface EarlyEntry { date: string; minutes: number; formatted?: string }

export interface OvertimeShiftEntry {
  shiftNum: 1 | 2 | 3;
  hours: number;
  weightedHours: number;
}

export interface OvertimeEntry {
  date: string;
  shifts: OvertimeShiftEntry[];
  totalPay: number;   // ✅ جديد بدل totals
}

export interface HolidayWorkEntry {
  date: string;
  workedHours: number;
  hourRate: number;
  payMultiplier: number;
  totalPay: number;
}

export interface Summary {
  cameLate: LateEntry[];
  leaveEarly: EarlyEntry[];
  overTime: OvertimeEntry[];
  absences: string[];
  holidayWork: HolidayWorkEntry[];
  reviewDays: ReviewDayEntry[]; // ✅ جديد
  totals: TotalsSummary;         // ✅ جديد


}

export interface HolidayDoc {
  year: number;
  regularWeekend: string[];
  official: Array<{
    name: string;
    date?: string;
    dates?: string[];
    dateRange?: { from: string; to: string };
    type?: string;
    notes?: string | null;
  }>;
}

export interface ReviewDayEntry {
  date: string;
  reason: "Missing IN/OUT";
  rawLogs: AttendanceLog[];
}

export interface TotalsSummary {
  cameLateHours: number;

  leaveEarlyHours: number;

  overTimeHours: number;          // ساعات إضافي فعلية
  overTimeWeightedHours: number;  // ساعات موزونة
  overTimePay: number;            // فلوس الإضافي

  holidayWorkHours: number;       // ساعات شغل في الإجازات/الويك اند
  holidayWorkPay: number;         // فلوسها
}

const TZ = 'Africa/Cairo';

const SHIFT_START = '07:15';
const SHIFT_END = '16:00';
const GRACE_MINUTES = 15;

@Injectable()
export class UsersHelperService {

  summarizeUserAttendance(
    logs: AttendanceLog[],
    userId: string,
    startDateIso: string,
    endDateIso: string,
    holidayDoc: HolidayDoc,
    userAbsences: { approve: boolean; day: string }[] = [],
    salaryMonthly: number = 0,
    events: { name: string; type: string; date: string; action: string }[] = [],
  ){

    const start = this.toMoment(startDateIso).startOf('day');
    const end = this.toMoment(endDateIso).endOf('day');
    const penalties = events.filter(e => e.type === 'PENALTY');

    const weekendSet = new Set(
      (holidayDoc?.regularWeekend ?? ['friday','saturday']).map(x => x.toLowerCase())
    );
    const officialSet = this.buildOfficialSet(holidayDoc);
    const approvedAbsenceSet = this.buildApprovedAbsenceSet(userAbsences);

    const hourRate = this.calcHourRate(salaryMonthly);

    // 1) filter by user + range
    const userHasLogs = logs.some(l => l.userId === userId);
    if (!userHasLogs) {
      return {};
    }

    // 2) group by YYYY-MM-DD
    const filtered = logs
      .filter(l => {
        const t = this.toMoment(l.timestamp);
        return l.userId === userId && t.isBetween(start, end, undefined, '[]');
      })
      .sort((a,b)=> this.toMoment(a.timestamp).valueOf() - this.toMoment(b.timestamp).valueOf());

      const rawByDay = new Map<string, AttendanceLog[]>();
      for (const l of filtered) {
        const dayKey = this.toMoment(l.timestamp).format('YYYY-MM-DD');
        if (!rawByDay.has(dayKey)) rawByDay.set(dayKey, []);
        rawByDay.get(dayKey)!.push(l);
      }
    const sessions = this.buildSessions(filtered);

    // خريطة sessions حسب يوم البداية
    const sessionsByStartDay = new Map<string, WorkSession[]>();
    // أيام فيها OUT مكمل من أمس (عشان ما تتحسبش غياب)
    const daysWithCarryOut = new Set<string>();

    for (const s of sessions) {
      if (!sessionsByStartDay.has(s.startDay)) sessionsByStartDay.set(s.startDay, []);
      sessionsByStartDay.get(s.startDay)!.push(s);

      const outDay = s.outTime.format('YYYY-MM-DD');
      if (outDay !== s.startDay) daysWithCarryOut.add(outDay);
    }

    const cameLate: LateEntry[] = [];
    const leaveEarly: EarlyEntry[] = [];
    const overTime: OvertimeEntry[] = [];
    const absences: string[] = [];
    const holidayWork: HolidayWorkEntry[] = [];
    const reviewDays: ReviewDayEntry[] = [];

    // 3) loop every day
    for (const day of this.eachDay(start, end)) {
    const dayStr = day.format('YYYY-MM-DD');

    const rawLogs = rawByDay.get(dayStr) ?? [];
    const hasInSameDay = rawLogs.some(x => x.type === 'IN');
    const hasOutSameDay = rawLogs.some(x => x.type === 'OUT');


    const hasPairIssue = (hasInSameDay && !hasOutSameDay) || (!hasInSameDay && hasOutSameDay);

    const isWeekend = this.isWeekend(day, weekendSet);
    const isOfficial = officialSet.has(dayStr);
    const isHolidayOrWeekend = isWeekend || isOfficial;

    const daySessions = sessionsByStartDay.get(dayStr) ?? [];

    // ✅ (1) لو يوم إجازة/ويك إند وفيه شغل → احسب حسب multipliers الجديدة
    if (isHolidayOrWeekend && daySessions.length) {
      const segments = daySessions.flatMap(s =>
        this.splitSessionWithMultipliers(s.inTime, s.outTime, officialSet)
      );

      const workedHours = segments.reduce((a,x)=>a+x.hours,0);
      const totalWeightedHours = segments.reduce((a,x)=>a+x.weightedHours,0);

      let totalPay = segments.reduce(
        (a,x)=> a + x.hours * hourRate * x.multiplier,
        0
      );

      if (hasPairIssue) {
        reviewDays.push({
          date: dayStr,
          reason: "Missing IN/OUT",
          rawLogs
        });
        continue; // مهم جدًا: يمنع أي حسابات على اليوم ده
      }

      holidayWork.push({
        date: dayStr,
        workedHours: Number(workedHours.toFixed(2)),
        hourRate: Number(hourRate.toFixed(2)),
        payMultiplier: workedHours > 0
          ? Number((totalWeightedHours / workedHours).toFixed(2))
          : 0,
        totalPay: Number(totalPay.toFixed(2))
      });

      continue;
    }



    // ✅ (2) استثناء الويك إند/الإجازات من الغياب
    if (isHolidayOrWeekend) continue;

    // ✅ (3) غياب: لا جلسات بدأت اليوم + مش مكمل من أمس + مش approved
    if (daySessions.length === 0) {
      if (!daysWithCarryOut.has(dayStr) && !approvedAbsenceSet.has(dayStr)) {
        absences.push(dayStr);
      }
      continue;
    }

    // ✅ Penalty في يوم الشغل العادي
    if (hasPairIssue) {
      reviewDays.push({
        date: dayStr,
        reason: "Missing IN/OUT",
        rawLogs
      });
      continue; // مهم جدًا: يمنع أي حسابات على اليوم ده
    }


    // ✅ (4) late/early/overtime من أول IN وآخر OUT للجلسات
    const firstIn = daySessions[0].inTime.clone();

    // آخر خروج طبيعي
    let lastOut = daySessions[daySessions.length - 1].outTime.clone();

    const shiftStart = moment.tz(`${dayStr} ${SHIFT_START}`, 'YYYY-MM-DD HH:mm', TZ);
    const shiftEnd   = moment.tz(`${dayStr} ${SHIFT_END}`,   'YYYY-MM-DD HH:mm', TZ);

    if (hasInSameDay && !hasOutSameDay) {
      lastOut = shiftEnd.clone();
    }

    const lateRaw = firstIn.diff(shiftStart, 'minutes');
    const lateMin = Math.max(lateRaw - GRACE_MINUTES, 0);
    if (lateMin > 0) cameLate.push({ date: dayStr, minutes: lateMin, formatted: this.minutesToHdotMM(lateMin) });

    if (lastOut.isBefore(shiftEnd)) {
      const earlyMin = shiftEnd.diff(lastOut, 'minutes');
      if (earlyMin > 0) leaveEarly.push({ date: dayStr, minutes: earlyMin, formatted: this.minutesToHdotMM(earlyMin) });
    }

    // ✅ overtime يبدأ بعد 5م (ساعة سماح من 4→5 بدون زيادة)
    const otStart = shiftEnd.clone().add(1, 'hour'); // 17:00

    if (lastOut.isAfter(otStart)) {
      const shifts = this.splitOvertime(dayStr, otStart, lastOut);

      // ✅ totalPay = مجموع الساعات الموزونة * سعر الساعة
      const totalPay = shifts.reduce(
        (sum, sh) => sum + (sh.weightedHours * hourRate),
        0
      );

      overTime.push({
        date: dayStr,
        shifts,
        totalPay: Number(totalPay.toFixed(2))
      });
    }


  }


    const cameLateMinutesTotal =
      cameLate.reduce((sum, x) => sum + x.minutes, 0);

    const leaveEarlyMinutesTotal =
      leaveEarly.reduce((sum, x) => sum + x.minutes, 0);

    // overTime totals (مجموع كل الشيفتات في كل الأيام)
    const overTimeHoursTotal =
      overTime.reduce((sum, d) =>
        sum + d.shifts.reduce((s, sh) => s + sh.hours, 0)
      , 0);

    const overTimeWeightedHoursTotal =
      overTime.reduce((sum, d) =>
        sum + d.shifts.reduce((s, sh) => s + sh.weightedHours, 0)
      , 0);

    const overTimePayTotal =
      overTime.reduce((sum, d) => sum + (d.totalPay ?? 0), 0);

    // holidayWork totals
    const holidayWorkHoursTotal =
      holidayWork.reduce((sum, d) => sum + d.workedHours, 0);

    const holidayWorkPayTotal =
      holidayWork.reduce((sum, d) => sum + d.totalPay, 0);

    const totals: TotalsSummary = {
      cameLateHours: Number((cameLateMinutesTotal / 60).toFixed(2)),

      leaveEarlyHours: Number((leaveEarlyMinutesTotal / 60).toFixed(2)),

      overTimeHours: Number(overTimeHoursTotal.toFixed(2)),
      overTimeWeightedHours: Number(overTimeWeightedHoursTotal.toFixed(2)),
      overTimePay: Number(overTimePayTotal.toFixed(2)),

      holidayWorkHours: Number(holidayWorkHoursTotal.toFixed(2)),
      holidayWorkPay: Number(holidayWorkPayTotal.toFixed(2)),
    };

    // =========================
    // ✅ KPIs
    // =========================

    // KPI الغياب: أكتر من يوم غياب غير معتمد في الشهر => -1 غير كده +1
    const absenceKpi = absences.length > 1 ? -1 : 1;

    // KPI penalties من الـ docs/events:
    // لو في أي event نوعه PENALTY => -1
    // لو مفيش => +1
    const penaltiesKpi = penalties.length > 0 ? -1 : 1;

    // KPI التأخير:
    // إجمالي التأخير < 2 ساعات
    // وأقصى تأخير في اليوم <= 1 ساعة
    const latePerDayOk = cameLate.every(x => x.minutes <= 60);
    const lateTotalOk = totals.cameLateHours < 2;
    const lateKpi = (latePerDayOk && lateTotalOk) ? 1 : -1;

    // KPI الخروج بدري:
    // إجمالي الخروج بدري < 2 ساعات
    // وأقصى خروج بدري في اليوم <= 1 ساعة
    const earlyPerDayOk = leaveEarly.every(x => x.minutes <= 60);
    const earlyTotalOk = totals.leaveEarlyHours < 2;
    const earlyKpi = (earlyPerDayOk && earlyTotalOk) ? 1 : -1;

    // ✅ لو مفيش penalties docs خالص، ضيف event مكافأة
    let finalEvents = events;
    if (penaltiesKpi === 1) {
      finalEvents = [
        ...events,
        {
          name: "No Penalties Reward",
          type: "REWARD",
          date: end.format('YYYY-MM-DD'),
          action: "ADD_BONUS_POINT"
        }
      ];
    }


    return {
      cameLate,
      leaveEarly,
      overTime,
      absences,
      holidayWork,
      reviewDays,
      // reviewDays, // لو موجودة
      totals,
      kpis: {
        absenceKpi,
        penaltiesKpi,
        lateKpi,
        earlyKpi,
        score: absenceKpi + penaltiesKpi + lateKpi + earlyKpi
      },
      events: finalEvents
    };
  }

  private splitSessionWithMultipliers(
  inTime: moment.Moment,
  outTime: moment.Moment,
  officialSet: Set<string>
) {
  const segments: Array<{hours:number; multiplier:number; weightedHours:number}> = [];
  let cursor = inTime.clone();

  while (cursor.isBefore(outTime)) {
    const dayStr = cursor.format("YYYY-MM-DD");
    const dayStart = moment.tz(dayStr, "YYYY-MM-DD", TZ).startOf("day");
    const nextDayStart = dayStart.clone().add(1, "day");

    const isOfficial = officialSet.has(dayStr);
    const isFriday = dayStart.day() === 5;
    const isSaturday = dayStart.day() === 6;

    const t0715 = dayStart.clone().hour(7).minute(15);
    const t1600 = dayStart.clone().hour(16).minute(0);
    const t2000 = dayStart.clone().hour(20).minute(0);
    const t2400 = nextDayStart.clone(); // 00:00
    const t0300 = nextDayStart.clone().hour(3).minute(0);

    let boundaries: { start: moment.Moment; end: moment.Moment; mult: number }[];

    if (isFriday) {
      boundaries = [{ start: dayStart, end: nextDayStart, mult: 2.0 }];
    } else if (isSaturday) {
      boundaries = [
        { start: t0715, end: t2000, mult: 1.35 },
        { start: t2000, end: t2400, mult: 1.7 },
        { start: t2400, end: t0300, mult: 2.0 },
      ];
    } else {
      boundaries = [
        { start: t0715, end: t1600, mult: 1.0 },
        { start: t1600, end: t2000, mult: 1.35 },
        { start: t2000, end: t2400, mult: 1.7 },
        { start: t2400, end: t0300, mult: 2.0 },
      ];
    }

    const block = boundaries.find(b =>
      cursor.isSameOrAfter(b.start) && cursor.isBefore(b.end)
    );

    // لو قبل أول boundary (مثلاً دخل 6 ص) خليه multiplier 1
    if (!block) {
      const endSeg = moment.min(outTime, boundaries[0].start);
      const hours = Math.max(endSeg.diff(cursor,'minutes')/60,0);
      if (hours>0){
        segments.push({
          hours: Number(hours.toFixed(2)),
          multiplier: Math.max(1.0, isOfficial ? 2.0 : 0), // max-rule
          weightedHours: Number((hours * Math.max(1.0, isOfficial ? 2.0 : 0)).toFixed(2))
        });
      }
      cursor = endSeg;
      continue;
    }

    const endSeg = moment.min(outTime, block.end);
    const hours = Math.max(endSeg.diff(cursor,'minutes')/60,0);
    if (hours>0){
      const finalMult = Math.max(block.mult, isOfficial ? 2.0 : 0); // ✅ أكبر قاعدة فقط
      segments.push({
        hours: Number(hours.toFixed(2)),
        multiplier: finalMult,
        weightedHours: Number((hours * finalMult).toFixed(2))
      });
    }

    cursor = endSeg;
  }

  return segments;
}


  /** ===== helpers (Moment only) ===== */

  private toMoment(iso: string) {
    return moment.tz(iso, TZ);
  }

  private buildSessions(sortedLogs: AttendanceLog[]): WorkSession[] {
    const sessions: WorkSession[] = [];
    let openIn: moment.Moment | null = null;

    for (const log of sortedLogs) {
      const t = this.toMoment(log.timestamp);

      if (log.type === 'IN') {
        if (!openIn) openIn = t;        // افتح جلسة
        // لو فيه openIn already: سيبه (IN زيادة)
      } else { // OUT
        if (openIn) {
          if (t.isAfter(openIn)) {
            const hours = t.diff(openIn, 'minutes') / 60;
            sessions.push({
              inTime: openIn,
              outTime: t,
              startDay: openIn.format('YYYY-MM-DD'),
              durationHours: Number(hours.toFixed(2)),
            });
          }
          openIn = null; // اقفل الجلسة
        }
        // OUT من غير IN: تجاهله
      }
    }

    return sessions;
  }

  private eachDay(start: moment.Moment, end: moment.Moment) {
    const days: moment.Moment[] = [];
    let cur = start.clone().startOf('day');
    const last = end.clone().startOf('day');

    while (cur.isBefore(last) || cur.isSame(last, 'day')) {
      days.push(cur.clone());
      cur.add(1, 'day');
    }
    return days;
  }

  private minutesToHdotMM(minutes: number) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}.${String(m).padStart(2,'0')}`;
  }

  private calcHourRate(salaryMonthly: number) {
    if (!salaryMonthly || salaryMonthly <= 0) return 0;
    return salaryMonthly / 30 / 8;
  }

  private calcWorkedHours(firstIn: moment.Moment, lastOut: moment.Moment) {
    const mins = lastOut.diff(firstIn, 'minutes');
    return Math.max(mins / 60, 0);
  }

  private normalizeDayString(dayStr: string) {
    const parts = dayStr.split('/');
    if (parts.length !== 3) return dayStr;

    const [d,m,y] = parts.map(Number);
    if (!d || !m || !y) return dayStr;

    return moment.tz(`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`, TZ)
      .format('YYYY-MM-DD');
  }

  private buildApprovedAbsenceSet(userAbsences: { approve: boolean; day: string }[]) {
    const set = new Set<string>();
    for (const a of userAbsences || []) {
      if (a.approve) set.add(this.normalizeDayString(a.day));
    }
    return set;
  }

  private buildOfficialSet(holidayDoc: HolidayDoc) {
    const set = new Set<string>();
    if (!holidayDoc?.official?.length) return set;

    for (const h of holidayDoc.official) {
      if (h.date) set.add(h.date);

      if (h.dates?.length) {
        for (const d of h.dates) set.add(d);
      }

      if (h.dateRange?.from && h.dateRange?.to) {
        let cur = moment.tz(h.dateRange.from, TZ).startOf('day');
        const last = moment.tz(h.dateRange.to, TZ).startOf('day');

        while (cur.isBefore(last) || cur.isSame(last, 'day')) {
          set.add(cur.format('YYYY-MM-DD'));
          cur.add(1,'day');
        }
      }
    }
    return set;
  }

  private isWeekend(day: moment.Moment, weekendSet: Set<string>) {
    // moment: 0=Sunday .. 5=Friday 6=Saturday
    const dow = day.day();
    const name =
      dow === 0 ? 'sunday' :
      dow === 1 ? 'monday' :
      dow === 2 ? 'tuesday' :
      dow === 3 ? 'wednesday' :
      dow === 4 ? 'thursday' :
      dow === 5 ? 'friday' :
      'saturday';

    return weekendSet.has(name);
  }

  private getHolidayMultiplier(day: moment.Moment, isOfficial: boolean): number | null {
    if (isOfficial) return 2; // الإجازة الرسمية

    const dow = day.day(); // 0=Sunday .. 5=Friday 6=Saturday
    if (dow === 5) return 2;      // Friday
    if (dow === 6) return 1.35;   // Saturday

    return null; // مش يوم إجازة
  }

  private splitOvertime(dayStr: string, otStart: moment.Moment, otEnd: moment.Moment): OvertimeShiftEntry[] {
    const day = moment.tz(dayStr, 'YYYY-MM-DD', TZ).startOf('day');
    const nextDay = day.clone().add(1,'day');

    const s1Start = day.clone().hour(16).minute(0);
    const s1End   = day.clone().hour(20).minute(0);

    const s2Start = day.clone().hour(20).minute(0);
    const s2End   = nextDay.clone().hour(0).minute(0);

    const s3Start = nextDay.clone().hour(0).minute(0);
    const s3End   = nextDay.clone().hour(7).minute(0);

    const shifts = [
      { num: 1 as const, start: s1Start, end: s1End, mult: 1.35 },
      { num: 2 as const, start: s2Start, end: s2End, mult: 1.7 },
      { num: 3 as const, start: s3Start, end: s3End, mult: 2.0 },
    ];

    const res: OvertimeShiftEntry[] = [];

    for (const sh of shifts) {
      const start = otStart.isAfter(sh.start) ? otStart : sh.start;
      const end = otEnd.isBefore(sh.end) ? otEnd : sh.end;

      if (end.isAfter(start)) {
        const hours = end.diff(start, 'minutes') / 60;
        res.push({
          shiftNum: sh.num,
          hours: Number(hours.toFixed(2)),
          weightedHours: Number((hours * sh.mult).toFixed(2)),
        });
      }
    }

    return res;
  }
}

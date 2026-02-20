const ms = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;
const ml = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const ds = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const dl = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export function formatDate(date: Date, format: string): string {
  const has = (t: string) => format.includes(t);

  const cache: Record<string, string> = {};
  const get = (key: string, fn: () => string) => {
    const val = cache[key];
    if (val) return val;
    cache[key] = fn();
    return cache[key];
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;

  const tokens: [string, () => string][] = [
    // Year
    ['YYYY', () => String(date.getFullYear())],
    ['YY', () => String(date.getFullYear()).slice(-2)],

    // Month
    ['MMMM', () => ml[date.getMonth()]],
    ['MMM', () => ms[date.getMonth()]],
    ['MM', () => pad(date.getMonth() + 1)],
    ['M', () => String(date.getMonth() + 1)],

    // Day
    ['DDDD', () => dl[date.getDay()]],
    ['DDD', () => ds[date.getDay()]],
    ['DD', () => pad(date.getDate())],
    ['D', () => String(date.getDate())],

    // Time - Hours
    ['HH', () => pad(hours24)],
    ['H', () => String(hours24)],
    ['hh', () => pad(hours12)],
    ['h', () => String(hours12)],

    // Minutes
    ['mm', () => pad(date.getMinutes())],
    ['m', () => String(date.getMinutes())],

    // Seconds
    ['ss', () => pad(date.getSeconds())],
    ['s', () => String(date.getSeconds())],

    // AM / PM
    ['A', () => (hours24 >= 12 ? 'PM' : 'AM')],
    ['a', () => (hours24 >= 12 ? 'pm' : 'am')],
  ];

  let result = format;

  tokens.forEach(([token, fn]) => {
    if (has(token)) {
      result = result.replace(new RegExp(token, 'g'), get(token, fn));
    }
  });

  return result;
}

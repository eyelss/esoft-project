import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

export const parseTime = (timestamp: number) => dayjs.unix(timestamp).tz('Africa/Abidjan');
import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatRelativeDate(isoDate:string) {
    const date = parseISO(isoDate);
    const now = new Date();
    const distance = formatDistanceToNow(date, { addSuffix: true });
  
    // Check for today or yesterday
    const today = format(now, 'yyyy-MM-dd');
    const yesterday = format(new Date(now.setDate(now.getDate() - 1)), 'yyyy-MM-dd');
  
    const formattedDate = format(date, 'yyyy-MM-dd');
  
    if (formattedDate === today) {
      return 'today';
    } else if (formattedDate === yesterday) {
      return 'yesterday';
    } else {
      return distance;
    }
  }

  export function formatTimeFromISOString(isoString:any) {
    const date = new Date(isoString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // The hour '0' should be '12'
    const minutesFormatted = minutes < 10 ? '0' + minutes : minutes;
    const formattedTime = `${hours}:${minutesFormatted}${ampm}`;
    return formattedTime;
  }

  
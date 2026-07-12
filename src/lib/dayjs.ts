import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';


dayjs.extend(relativeTime);

export const formatTimeAgo = (date: string | Date | number) => {
  if (!date) return '';
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return 'Unknown time';
  }

  return dayjs(parsedDate).fromNow();
};
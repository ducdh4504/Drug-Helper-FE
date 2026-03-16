export const formatTime = (timeString: string) => {
  const date = new Date(`1970-01-01T${timeString}`)
  if (!date || isNaN(date.getTime())) return "N/A"
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`
}

export const getHourMinuteFromISO = (isoString: string | Date): string => {
  try {
    let date: Date;
    
    if (isoString instanceof Date) {
      date = isoString;
    } 
    else if (typeof isoString === 'string') {
      const fixed = isoString.replace(/T(\d):/, "T0$1:");
      date = new Date(fixed);
    } 
    else {
      console.error('Invalid input type:', typeof isoString);
      return "N/A";
    }
    
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', date);
      return "N/A";
    }
    
    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");
    return `${hour}:${minute}`;
  } catch (error) {
    console.error('Error in getHourMinuteFromISO:', error, 'Input:', isoString);
    return "N/A";
  }
}

// Lấy endTime (giờ kết thúc) từ selectedSlot, trả về HH:mm
export const getEndTimeFromSlot = (selectedSlot: string): string => {
  if (!selectedSlot) return "";
  
  try {
    const [h, m = "00"] = selectedSlot.split(":");
    const hour = (Number(h) + 1).toString().padStart(2, "0");
    return `${hour}:${m}`;
  } catch (error) {
    console.error('Error in getEndTimeFromSlot:', error);
    return "";
  }
}

export const getTimeSpan = (hour: any, minute: any) => {
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`;
}
// Get all the months name
const monthNames = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "May",
  "JUNE",
  "JULY",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

export const getMonthName = (monthNumber: number): string => {
  if (monthNumber < 1 || monthNumber > 12) {
    throw new Error("Invalid month number");
  }
  return monthNames[monthNumber - 1];
};

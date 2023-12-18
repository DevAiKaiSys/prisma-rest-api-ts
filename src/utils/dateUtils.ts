// import moment from "moment-timezone";
// // Set the default timezone for your application
// moment.tz.setDefault("Asia/Bangkok"); // Change 'Asia/Bangkok' to your desired timezone

// export const getCurrentDatePrisma = (offset?: number): string => {
//   if (offset) {
//     return moment().utcOffset(offset).format("YYYY-MM-DDTHH:mm:ss[Z]");
//   }
//   return moment().format("YYYY-MM-DDTHH:mm:ss[Z]");
// };

export const getCurrentDatePrisma = (offset: number = 7): Date => {
  const currentDate = new Date();

  if (offset !== 0) {
    currentDate.setHours(currentDate.getHours() + offset);
  }

  return currentDate;
};

// Generate random number such as (invoice, orderNumber)
export const generateRandomNumber = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = 6;
  let randomNumber = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomNumber += characters.charAt(randomIndex);
  }
  return randomNumber;
};

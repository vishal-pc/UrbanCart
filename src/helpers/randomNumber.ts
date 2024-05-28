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

// Search random query function
export const parseSearchQuery = (query: string) => {
  const result: any = {
    keywords: [],
    priceRange: null,
    attributes: [],
  };

  const priceRegex = /under (\d+)/i;
  const priceMatch = query.match(priceRegex);

  if (priceMatch) {
    result.priceRange = { max: Number(priceMatch[1]) };
    query = query.replace(priceMatch[0], "").trim();
  }

  const attributeRegex = /for\s+(\w+)/i;
  const attributeMatch = query.match(attributeRegex);

  if (attributeMatch) {
    result.attributes.push(attributeMatch[1].toLowerCase());
    query = query.replace(attributeMatch[0], "").trim();
  }

  result.keywords = query.split(/\s+/).map((word) => word.trim().toLowerCase());

  return result;
};

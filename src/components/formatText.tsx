export const formatText = (text: string): string => {
  return text
    .replace(/'/g, '') // Remove single quotes
    .replace(/"/g, '') // Remove double quotes
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[()]/g, ','); // Replace parentheses with commas
};

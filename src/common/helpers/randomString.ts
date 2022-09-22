export const randomStrings = (word: string) => {
  return (
    (Math.random() + 1).toString(36).substring(7) +
    '-' +
    word.split(' ').join('_')
  );
};

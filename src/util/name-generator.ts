export const randomNameGenerator = (ext: string): string => {
  return `${Math.round(Math.random() * 10 ** 10)}-${Math.round(Math.random() * 10 ** 10)}.${ext}`;
};

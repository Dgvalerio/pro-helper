export const sortBy =
  <T = Record<string, unknown>>(param: keyof T, reverse: boolean = false) =>
  (a: T, b: T): number => {
    if (a[param] < b[param]) return reverse ? 1 : -1;
    else if (a[param] > b[param]) return reverse ? -1 : 1;
    else return 0;
  };

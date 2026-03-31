export const sanitizeData = <T extends Record<string, unknown>>(payload: T) => {
  return Object.fromEntries(
    Object.entries(payload).filter(
      ([_, value]) =>
        value !== undefined &&
        value !== null &&
        !(typeof value === "string" && value.trim() === ""),
    ),
  ) as Partial<T>
};

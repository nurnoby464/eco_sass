export const useSkip = ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}): number => {
  return (page - 1) * limit;
};

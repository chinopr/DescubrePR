type QueryError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
} | null | undefined;

export function isMissingBoostColumnError(error: QueryError) {
  if (!error) return false;

  const haystack = `${error.message || ''} ${error.details || ''} ${error.hint || ''}`.toLowerCase();
  return error.code === '42703' || haystack.includes('boost_score');
}

# Supabase rules

- Create append-only migrations; do not rewrite migrations that may have been applied.
- Enable RLS on every user-owned table before shipping.
- Add both `using` and `with check` expressions for write-capable policies.
- Keep service-role credentials server-only.
- Store normalized records and source provenance. Do not store raw microphone audio by default.
- Review cascades, indexes, constraints, and rollback implications for every schema change.
- Never apply a production migration from an autonomous loop without human approval.

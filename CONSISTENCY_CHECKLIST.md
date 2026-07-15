# Consistency Checklist

Use this checklist when reviewing inventory, POS, or other stateful flows in Jayabima POS.

## 1. Keep one data shape at the store boundary

- Map every API response into the app model before storing it.
- Do not mix raw JSON objects and typed app objects in the same Zustand store.
- Treat date and nullable fields consistently on every read and write path.

## 2. Preserve business intent across API and UI

- If the client sends a field, the server should either persist it or reject it explicitly.
- Avoid silently overriding fields unless there is a documented business rule.
- Make create and update handlers match the store’s expected model.

## 3. Await dependent operations

- If one action depends on another, wait for the first one to finish before finalizing the second.
- Do not record a sale before stock updates succeed.
- Use `await` for checkout, inventory deduction, payment capture, and similar chained steps.

## 4. Reconcile by id, not by append

- When updating a list, replace existing entries with the same id.
- Only append when the item is known to be new.
- This prevents duplicates after retries, reactivation, or optimistic updates.

## 5. Avoid unsafe optimistic assumptions

- Do not use non-null assertions for data that can disappear between render and action.
- Check whether the item still exists before moving it between active and inactive lists.
- Make rollback logic symmetrical with the optimistic change.

## 6. Verify the failure path

- Test what happens when an API call fails after a local optimistic update.
- Test stale ids, duplicate submissions, and repeated retries.
- Confirm the store returns to a valid state after rollback.

## 7. Inventory-specific rules

- Deduct stock only after the sale is confirmed or in the same transactional flow.
- Prevent negative stock at both the UI and server layers.
- Keep active and inactive product lists mutually exclusive.

## 8. Checkout-specific rules

- Total, payment, and stock changes should move together.
- A sale should not be committed if stock deduction fails.
- If checkout touches multiple products, process them in a way that preserves correctness.

## 9. Review questions before merging

- Does every write path return the same shape that the store expects?
- Can a retry create a duplicate or stale state entry?
- Does a failed server call leave the UI in a believable but incorrect state?
- Would a reload reproduce the same state as the optimistic UI?

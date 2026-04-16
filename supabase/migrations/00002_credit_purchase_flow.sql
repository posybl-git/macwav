-- ================================================================
-- macwav — Credit Purchase Flow (Milestone 2 / Task 2.1)
-- ================================================================

CREATE OR REPLACE FUNCTION public.record_credit_purchase(
  p_user_id UUID,
  p_amount INTEGER,
  p_stripe_payment_id TEXT,
  p_description TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  SELECT credit_balance
    INTO current_balance
    FROM public.profiles
   WHERE id = p_user_id
   FOR UPDATE;

  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF EXISTS (
    SELECT 1
      FROM public.credit_transactions
     WHERE stripe_payment_id = p_stripe_payment_id
  ) THEN
    RETURN current_balance;
  END IF;

  UPDATE public.profiles
     SET credit_balance = credit_balance + p_amount,
         updated_at = now()
   WHERE id = p_user_id
   RETURNING credit_balance INTO new_balance;

  INSERT INTO public.credit_transactions (
    id,
    user_id,
    type,
    amount,
    balance_after,
    description,
    stripe_payment_id,
    created_at
  ) VALUES (
    gen_random_uuid(),
    p_user_id,
    'purchase',
    p_amount,
    new_balance,
    p_description,
    p_stripe_payment_id,
    now()
  );

  INSERT INTO public.notifications (
    id,
    user_id,
    type,
    title,
    message,
    is_read,
    created_at
  ) VALUES (
    gen_random_uuid(),
    p_user_id,
    'credits_added',
    'Credits Added',
    p_description,
    false,
    now()
  );

  RETURN new_balance;
END;
$$;

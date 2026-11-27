
BEGIN;

-- Add a source for volunteer self check-ins.
ALTER TYPE public.attendance_source
ADD VALUE IF NOT EXISTS 'SELF_CHECK_IN';

-- Store the reason for admin attendance actions.
ALTER TABLE public.attendance
ADD COLUMN IF NOT EXISTS correction_reason TEXT;

COMMIT;


-- =====================================================
-- 1. VOLUNTEER SELF CHECK-IN
-- =====================================================

CREATE OR REPLACE FUNCTION public.volunteer_check_in(
    p_session_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID;
    v_volunteer_id UUID;
    v_attendance_id UUID;
    v_session RECORD;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    -- Verify volunteer role.
    IF NOT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = v_user_id
          AND role = 'VOLUNTEER'
    ) THEN
        RAISE EXCEPTION 'Volunteer access required';
    END IF;

    -- Find active volunteer record.
    SELECT id
    INTO v_volunteer_id
    FROM public.volunteers
    WHERE profile_id = v_user_id
      AND status = 'ACTIVE';

    IF v_volunteer_id IS NULL THEN
        RAISE EXCEPTION 'Active volunteer record not found';
    END IF;

    -- Find session.
    SELECT *
    INTO v_session
    FROM public.sessions
    WHERE id = p_session_id;

    IF NOT FOUND OR v_session.status <> 'SCHEDULED' THEN
        RAISE EXCEPTION 'Session is not available for check-in';
    END IF;

    -- Check six-hour window using Bangladesh time.
    IF CURRENT_TIMESTAMP <
       ((v_session.session_date + v_session.start_time)
        AT TIME ZONE 'Asia/Dhaka')
       OR CURRENT_TIMESTAMP >=
       (
           (v_session.session_date + v_session.start_time)
           AT TIME ZONE 'Asia/Dhaka'
       ) + INTERVAL '6 hours'
    THEN
        RAISE EXCEPTION 'Check-in window is closed';
    END IF;

    -- Insert attendance.
    INSERT INTO public.attendance (
        volunteer_id,
        session_id,
        status,
        source,
        marked_by
    )
    VALUES (
        v_volunteer_id,
        p_session_id,
        'PRESENT',
        'SELF_CHECK_IN',
        v_user_id
    )
    RETURNING id INTO v_attendance_id;

    RETURN v_attendance_id;
END;
$$;

REVOKE ALL ON FUNCTION public.volunteer_check_in(UUID)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.volunteer_check_in(UUID)
TO authenticated;


-- =====================================================
-- 2. ADMIN ATTENDANCE CORRECTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.admin_correct_attendance(
    p_attendance_id UUID,
    p_new_status public.attendance_status,
    p_reason TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID;
    v_old_status public.attendance_status;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    -- Verify admin role.
    IF NOT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = v_user_id
          AND role = 'ADMIN'
    ) THEN
        RAISE EXCEPTION 'Admin access required';
    END IF;

    -- Validate new status.
    IF p_new_status IS NULL
       OR p_new_status NOT IN ('PRESENT', 'ABSENT')
    THEN
        RAISE EXCEPTION 'Invalid attendance status';
    END IF;

    -- Require correction reason.
    IF p_reason IS NULL
       OR LENGTH(TRIM(p_reason)) = 0
    THEN
        RAISE EXCEPTION 'Correction reason is required';
    END IF;

    IF LENGTH(TRIM(p_reason)) > 1000 THEN
        RAISE EXCEPTION 'Correction reason is too long';
    END IF;

    -- Find existing attendance record.
    SELECT status
    INTO v_old_status
    FROM public.attendance
    WHERE id = p_attendance_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Attendance record not found';
    END IF;

    IF v_old_status = p_new_status THEN
        RAISE EXCEPTION 'New status is same as current status';
    END IF;

    -- Update attendance.
    -- Existing audit trigger records old and new values.
    UPDATE public.attendance
    SET
        status = p_new_status,
        source = 'MANUAL',
        marked_by = v_user_id,
        correction_reason = TRIM(p_reason)
    WHERE id = p_attendance_id;

    RETURN p_attendance_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_correct_attendance(
    UUID,
    public.attendance_status,
    TEXT
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.admin_correct_attendance(
    UUID,
    public.attendance_status,
    TEXT
) TO authenticated;


-- =====================================================
-- 3. ADMIN MANUAL ATTENDANCE
-- =====================================================

CREATE OR REPLACE FUNCTION public.admin_mark_attendance(
    p_session_id UUID,
    p_volunteer_id UUID,
    p_status public.attendance_status,
    p_reason TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID;
    v_attendance_id UUID;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    -- Verify admin role.
    IF NOT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = v_user_id
          AND role = 'ADMIN'
    ) THEN
        RAISE EXCEPTION 'Admin access required';
    END IF;

    -- Validate attendance status.
    IF p_status IS NULL
       OR p_status NOT IN ('PRESENT', 'ABSENT')
    THEN
        RAISE EXCEPTION 'Invalid attendance status';
    END IF;

    -- Require reason.
    IF p_reason IS NULL
       OR LENGTH(TRIM(p_reason)) = 0
    THEN
        RAISE EXCEPTION 'Reason is required';
    END IF;

    IF LENGTH(TRIM(p_reason)) > 1000 THEN
        RAISE EXCEPTION 'Reason is too long';
    END IF;

    -- Only scheduled sessions allow new manual records.
    IF NOT EXISTS (
        SELECT 1
        FROM public.sessions
        WHERE id = p_session_id
          AND status = 'SCHEDULED'
    ) THEN
        RAISE EXCEPTION 'Session is not available for manual attendance';
    END IF;

    -- Verify active volunteer.
    IF NOT EXISTS (
        SELECT 1
        FROM public.volunteers
        WHERE id = p_volunteer_id
          AND status = 'ACTIVE'
    ) THEN
        RAISE EXCEPTION 'Active volunteer not found';
    END IF;

    -- Insert new attendance record.
    INSERT INTO public.attendance (
        session_id,
        volunteer_id,
        status,
        source,
        marked_by,
        correction_reason
    )
    VALUES (
        p_session_id,
        p_volunteer_id,
        p_status,
        'MANUAL',
        v_user_id,
        TRIM(p_reason)
    )
    RETURNING id INTO v_attendance_id;

    RETURN v_attendance_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_mark_attendance(
    UUID,
    UUID,
    public.attendance_status,
    TEXT
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.admin_mark_attendance(
    UUID,
    UUID,
    public.attendance_status,
    TEXT
) TO authenticated;

-- User roles
CREATE TYPE user_role AS ENUM (
    'ADMIN',
    'VOLUNTEER'
);

-- Recruitment status
CREATE TYPE recruitment_status AS ENUM (
    'UPCOMING',
    'OPEN',
    'CLOSED'
);

-- Application status
CREATE TYPE application_status AS ENUM (
    'PENDING',
    'UNDER_REVIEW',
    'INTERVIEW',
    'SELECTED',
    'REJECTED'
);

-- Volunteer status
CREATE TYPE volunteer_status AS ENUM (
    'ACTIVE',
    'INACTIVE'
);

-- Leave status
CREATE TYPE leave_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);

-- Session type
CREATE TYPE session_type AS ENUM (
    'REGULAR',
    'EDUCATION_CAMP'
);

-- Session status
CREATE TYPE session_status AS ENUM (
    'SCHEDULED',
    'COMPLETED',
    'CANCELLED'
);

-- Attendance status
CREATE TYPE attendance_status AS ENUM (
    'PRESENT',
    'ABSENT'
);

-- Attendance source
CREATE TYPE attendance_source AS ENUM (
    'MANUAL',
    'SYSTEM'
);

-- Justification form status
CREATE TYPE justification_form_status AS ENUM (
    'DRAFT',
    'SUBMITTED'
);

-- Justification reason
CREATE TYPE reason_category AS ENUM (
    'ILLNESS',
    'ACADEMIC_EXAMINATION',
    'FAMILY_EMERGENCY',
    'PERSONAL_ISSUES',
    'TRANSPORTATION_PROBLEMS',
    'OTHER'
);

-- Individual justification status
CREATE TYPE justification_item_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'NEEDS_INFORMATION'
);

-- Review decision
CREATE TYPE review_decision AS ENUM (
    'APPROVED',
    'REJECTED',
    'NEEDS_INFORMATION'
);

-- Evaluation type
CREATE TYPE evaluation_type AS ENUM (
    'WEEKLY',
    'MONTHLY'
);

-- Evaluation category
CREATE TYPE evaluation_category AS ENUM (
    'EXCELLENT',
    'GOOD',
    'AVERAGE',
    'NEEDS_IMPROVEMENT',
    'CRITICAL'
);

-- Notification channel
CREATE TYPE notification_channel AS ENUM (
    'IN_APP',
    'EMAIL'
);

-- Notification status
CREATE TYPE notification_status AS ENUM (
    'PENDING',
    'SENT',
    'FAILED'
);

BEGIN;

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'VOLUNTEER',
    phone VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT profiles_name_not_empty CHECK (LENGTH(TRIM(full_name)) > 0)
);
CREATE UNIQUE INDEX profiles_email_unique ON profiles (LOWER(email));

CREATE TABLE recruitment_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    opens_at TIMESTAMPTZ NOT NULL,
    closes_at TIMESTAMPTZ NOT NULL,
    status recruitment_status NOT NULL DEFAULT 'UPCOMING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT recruitment_dates_valid CHECK (closes_at > opens_at),
    CONSTRAINT recruitment_title_not_empty CHECK (LENGTH(TRIM(title)) > 0)
);

CREATE TABLE volunteer_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruitment_period_id UUID NOT NULL REFERENCES recruitment_periods(id),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    institution VARCHAR(150),
    department VARCHAR(150),
    motivation TEXT NOT NULL,
    experience TEXT,
    status application_status NOT NULL DEFAULT 'PENDING',
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT application_name_not_empty CHECK (LENGTH(TRIM(full_name)) > 0),
    CONSTRAINT application_motivation_not_empty CHECK (LENGTH(TRIM(motivation)) > 0)
);
CREATE UNIQUE INDEX application_unique_email_per_recruitment
ON volunteer_applications (recruitment_period_id, LOWER(email));
CREATE INDEX idx_applications_status ON volunteer_applications(status);
CREATE INDEX idx_applications_recruitment ON volunteer_applications(recruitment_period_id);

CREATE TABLE volunteers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id),
    application_id UUID NOT NULL UNIQUE REFERENCES volunteer_applications(id),
    volunteer_code VARCHAR(30) NOT NULL UNIQUE,
    joining_date DATE NOT NULL,
    inactive_date DATE,
    status volunteer_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT volunteer_dates_valid CHECK (
        inactive_date IS NULL OR inactive_date >= joining_date
    ),
    CONSTRAINT inactive_volunteer_has_date CHECK (
        status <> 'INACTIVE' OR inactive_date IS NOT NULL
    )
);
CREATE INDEX idx_volunteers_status ON volunteers(status);
CREATE INDEX idx_volunteers_profile ON volunteers(profile_id);

CREATE TABLE volunteer_leaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    volunteer_id UUID NOT NULL REFERENCES volunteers(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status leave_status NOT NULL DEFAULT 'PENDING',
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT leave_dates_valid CHECK (end_date >= start_date),
    CONSTRAINT leave_reason_not_empty CHECK (LENGTH(TRIM(reason)) > 0)
);
CREATE INDEX idx_leaves_volunteer_dates
ON volunteer_leaves(volunteer_id, start_date, end_date);

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_type session_type NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(200),
    status session_status NOT NULL DEFAULT 'SCHEDULED',
    finalized_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT session_time_valid CHECK (end_time > start_time),
    CONSTRAINT session_day_valid CHECK (EXTRACT(ISODOW FROM session_date) IN (5, 6)),
    CONSTRAINT session_location_valid CHECK (
        session_type <> 'REGULAR' OR location = 'Curzon Hall'
    ),
    CONSTRAINT unique_session_per_type_per_day UNIQUE (session_date, session_type),
    CONSTRAINT session_must_start_scheduled CHECK (
        status = 'SCHEDULED' AND finalized_at IS NULL
        OR status = 'COMPLETED' AND finalized_at IS NOT NULL
        OR status = 'CANCELLED'
    )
);
CREATE INDEX idx_sessions_date ON sessions(session_date);

CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    volunteer_id UUID NOT NULL REFERENCES volunteers(id),
    session_id UUID NOT NULL REFERENCES sessions(id),
    status attendance_status NOT NULL,
    source attendance_source NOT NULL DEFAULT 'MANUAL',
    marked_by UUID REFERENCES profiles(id),
    marked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_volunteer_session UNIQUE (volunteer_id, session_id)
);
CREATE INDEX idx_attendance_volunteer ON attendance(volunteer_id);
CREATE INDEX idx_attendance_session ON attendance(session_id);

CREATE TABLE weekly_justifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    volunteer_id UUID NOT NULL REFERENCES volunteers(id),
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status justification_form_status NOT NULL DEFAULT 'DRAFT',
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_weekly_justification UNIQUE (volunteer_id, week_start_date),
    CONSTRAINT justification_week_valid CHECK (
        week_end_date = week_start_date + 1
        AND EXTRACT(ISODOW FROM week_start_date) = 5
        AND EXTRACT(ISODOW FROM week_end_date) = 6
    ),
    CONSTRAINT justification_due_date_valid CHECK (due_date >= week_end_date),
    CONSTRAINT justification_submission_timestamp_valid CHECK (
        (status = 'DRAFT' AND submitted_at IS NULL)
        OR (status = 'SUBMITTED' AND submitted_at IS NOT NULL)
    )
);
CREATE INDEX idx_weekly_justifications_volunteer
ON weekly_justifications(volunteer_id);

CREATE TABLE justification_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    justification_id UUID NOT NULL
        REFERENCES weekly_justifications(id) ON DELETE CASCADE,
    attendance_id UUID NOT NULL UNIQUE REFERENCES attendance(id),
    reason_category reason_category NOT NULL,
    explanation TEXT NOT NULL,
    attachment_url TEXT,
    status justification_item_status NOT NULL DEFAULT 'PENDING',
    volunteer_response TEXT,
    response_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT justification_explanation_not_empty CHECK (LENGTH(TRIM(explanation)) > 0)
);
CREATE INDEX idx_justification_items_status ON justification_items(status);

CREATE TABLE justification_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    justification_item_id UUID NOT NULL REFERENCES justification_items(id),
    reviewed_by UUID NOT NULL REFERENCES profiles(id),
    decision review_decision NOT NULL,
    admin_comment TEXT,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_justification_reviews_item
ON justification_reviews(justification_item_id);

CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    volunteer_id UUID NOT NULL REFERENCES volunteers(id),
    evaluation_type evaluation_type NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    attendance_percentage NUMERIC(5,2),
    regular_attendance_percentage NUMERIC(5,2),
    camp_attendance_percentage NUMERIC(5,2),
    score NUMERIC(5,2),
    category evaluation_category,
    comments TEXT,
    evaluated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT evaluation_period_valid CHECK (period_end >= period_start),
    CONSTRAINT evaluation_attendance_valid CHECK (
        (attendance_percentage IS NULL OR attendance_percentage BETWEEN 0 AND 100)
        AND (regular_attendance_percentage IS NULL OR regular_attendance_percentage BETWEEN 0 AND 100)
        AND (camp_attendance_percentage IS NULL OR camp_attendance_percentage BETWEEN 0 AND 100)
    ),
    CONSTRAINT evaluation_score_valid CHECK (score IS NULL OR score BETWEEN 0 AND 100),
    CONSTRAINT unique_evaluation_period UNIQUE (
        volunteer_id, evaluation_type, period_start, period_end
    )
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(100) NOT NULL,
    channel notification_channel NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    status notification_status NOT NULL DEFAULT 'PENDING',
    dedupe_key VARCHAR(255) UNIQUE,
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_profile ON notifications(profile_id);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

COMMIT;
CREATE OR REPLACE FUNCTION validate_volunteer_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    application_status_value public.application_status;
    application_email_value VARCHAR(255);
    profile_email_value VARCHAR(255);
    profile_role_value public.user_role;
BEGIN
    SELECT va.status, va.email
      INTO application_status_value, application_email_value
      FROM public.volunteer_applications va
     WHERE va.id = NEW.application_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Application does not exist';
    END IF;

    IF application_status_value <> 'SELECTED' THEN
        RAISE EXCEPTION 'Only selected applicants can become volunteers';
    END IF;

    SELECT p.email, p.role
      INTO profile_email_value, profile_role_value
      FROM public.profiles p
     WHERE p.id = NEW.profile_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Profile does not exist';
    END IF;

    IF LOWER(application_email_value) <> LOWER(profile_email_value) THEN
        RAISE EXCEPTION 'Application email and profile email do not match';
    END IF;

    IF profile_role_value <> 'VOLUNTEER' THEN
        RAISE EXCEPTION 'Volunteer profile must have VOLUNTEER role';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_volunteer_registration
BEFORE INSERT OR UPDATE OF application_id, profile_id
ON volunteers
FOR EACH ROW EXECUTE FUNCTION validate_volunteer_registration();

CREATE OR REPLACE FUNCTION validate_leave_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF NEW.status = 'APPROVED'
       AND OLD.status IS DISTINCT FROM 'APPROVED' THEN

        IF EXISTS (
            SELECT 1
              FROM public.volunteer_leaves vl
             WHERE vl.volunteer_id = NEW.volunteer_id
               AND vl.id <> NEW.id
               AND vl.status = 'APPROVED'
               AND daterange(vl.start_date, vl.end_date, '[]')
                   && daterange(NEW.start_date, NEW.end_date, '[]')
        ) THEN
            RAISE EXCEPTION 'Approved leave dates overlap another approved leave';
        END IF;

        IF EXISTS (
            SELECT 1
              FROM public.attendance a
              JOIN public.sessions s ON s.id = a.session_id
             WHERE a.volunteer_id = NEW.volunteer_id
               AND s.session_date BETWEEN NEW.start_date AND NEW.end_date
        ) THEN
            RAISE EXCEPTION 'Leave cannot be approved after attendance has been recorded for a covered session';
        END IF;

        NEW.reviewed_at = NOW();
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_leave_approval
BEFORE UPDATE OF status ON volunteer_leaves
FOR EACH ROW EXECUTE FUNCTION validate_leave_approval();

CREATE OR REPLACE FUNCTION guard_session_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.status <> 'SCHEDULED' OR NEW.finalized_at IS NOT NULL THEN
            RAISE EXCEPTION 'A session must be created as SCHEDULED';
        END IF;
        RETURN NEW;
    END IF;

    IF OLD.status = 'COMPLETED' AND (
        NEW.status <> 'COMPLETED'
        OR NEW.session_date IS DISTINCT FROM OLD.session_date
        OR NEW.session_type IS DISTINCT FROM OLD.session_type
        OR NEW.start_time IS DISTINCT FROM OLD.start_time
        OR NEW.end_time IS DISTINCT FROM OLD.end_time
        OR NEW.location IS DISTINCT FROM OLD.location
    ) THEN
        RAISE EXCEPTION 'A completed session cannot be reopened or have its details changed';
    END IF;

    IF OLD.status = 'CANCELLED' AND NEW.status <> 'CANCELLED' THEN
        RAISE EXCEPTION 'A cancelled session cannot be reopened';
    END IF;

    IF NEW.status = 'COMPLETED' AND OLD.status <> 'COMPLETED' THEN
        NEW.finalized_at := NOW();
    ELSIF NEW.status = 'SCHEDULED' THEN
        NEW.finalized_at := NULL;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_guard_session_changes
BEFORE INSERT OR UPDATE ON sessions
FOR EACH ROW EXECUTE FUNCTION guard_session_changes();

CREATE OR REPLACE FUNCTION validate_attendance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    volunteer_record public.volunteers%ROWTYPE;
    session_record public.sessions%ROWTYPE;
BEGIN
    SELECT * INTO volunteer_record
      FROM public.volunteers
     WHERE id = NEW.volunteer_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Volunteer does not exist';
    END IF;

    SELECT * INTO session_record
      FROM public.sessions
     WHERE id = NEW.session_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Session does not exist';
    END IF;

    IF session_record.status = 'CANCELLED' THEN
        RAISE EXCEPTION 'Cannot mark attendance for cancelled session';
    END IF;

    IF session_record.session_date < volunteer_record.joining_date THEN
        RAISE EXCEPTION 'Cannot mark attendance before joining date';
    END IF;

    IF volunteer_record.inactive_date IS NOT NULL
       AND session_record.session_date > volunteer_record.inactive_date THEN
        RAISE EXCEPTION 'Cannot mark attendance after inactive date';
    END IF;

    IF EXISTS (
        SELECT 1
          FROM public.volunteer_leaves vl
         WHERE vl.volunteer_id = NEW.volunteer_id
           AND vl.status = 'APPROVED'
           AND session_record.session_date BETWEEN vl.start_date AND vl.end_date
    ) THEN
        RAISE EXCEPTION 'Volunteer has approved leave for this session';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_attendance
BEFORE INSERT OR UPDATE OF volunteer_id, session_id, status
ON attendance
FOR EACH ROW EXECUTE FUNCTION validate_attendance();

CREATE OR REPLACE FUNCTION generate_missing_absences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NEW.status = 'COMPLETED' AND OLD.status IS DISTINCT FROM 'COMPLETED' THEN
        INSERT INTO public.attendance (volunteer_id, session_id, status, source)
        SELECT v.id, NEW.id, 'ABSENT', 'SYSTEM'
          FROM public.volunteers v
         WHERE v.joining_date <= NEW.session_date
           AND (v.inactive_date IS NULL OR NEW.session_date <= v.inactive_date)
           AND NOT EXISTS (
                SELECT 1
                  FROM public.volunteer_leaves vl
                 WHERE vl.volunteer_id = v.id
                   AND vl.status = 'APPROVED'
                   AND NEW.session_date BETWEEN vl.start_date AND vl.end_date
           )
        ON CONFLICT (volunteer_id, session_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_missing_absences
AFTER UPDATE OF status ON sessions
FOR EACH ROW EXECUTE FUNCTION generate_missing_absences();

CREATE OR REPLACE FUNCTION validate_justification_item()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    form_record public.weekly_justifications%ROWTYPE;
    attendance_record public.attendance%ROWTYPE;
    session_date_value DATE;
    session_status_value public.session_status;
BEGIN
    SELECT * INTO form_record
      FROM public.weekly_justifications
     WHERE id = NEW.justification_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Weekly justification does not exist';
    END IF;

    SELECT * INTO attendance_record
      FROM public.attendance
     WHERE id = NEW.attendance_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Attendance record does not exist';
    END IF;

    IF attendance_record.volunteer_id <> form_record.volunteer_id THEN
        RAISE EXCEPTION 'Attendance belongs to another volunteer';
    END IF;

    IF attendance_record.status <> 'ABSENT' THEN
        RAISE EXCEPTION 'Justification can only be submitted for absent sessions';
    END IF;

    SELECT s.session_date, s.status
      INTO session_date_value, session_status_value
      FROM public.sessions s
     WHERE s.id = attendance_record.session_id;

    IF session_date_value NOT BETWEEN form_record.week_start_date AND form_record.week_end_date THEN
        RAISE EXCEPTION 'Session does not belong to the justification week';
    END IF;

    IF session_status_value <> 'COMPLETED' THEN
        RAISE EXCEPTION 'Session must be completed before justification';
    END IF;

    IF form_record.status <> 'DRAFT' THEN
        RAISE EXCEPTION 'Cannot modify items after justification submission';
    END IF;

    IF TG_OP = 'INSERT' AND NEW.status <> 'PENDING' THEN
        RAISE EXCEPTION 'A new justification item must have PENDING status';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_justification_item
BEFORE INSERT OR UPDATE OF
    justification_id, attendance_id, reason_category, explanation, attachment_url
ON justification_items
FOR EACH ROW EXECUTE FUNCTION validate_justification_item();

CREATE OR REPLACE FUNCTION validate_justification_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    item_count INTEGER;
    absence_count INTEGER;
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.status <> 'DRAFT' OR NEW.submitted_at IS NOT NULL THEN
            RAISE EXCEPTION 'A justification form must first be created as DRAFT';
        END IF;
        RETURN NEW;
    END IF;

    IF OLD.status = 'SUBMITTED' AND NEW.status <> 'SUBMITTED' THEN
        RAISE EXCEPTION 'A submitted justification cannot be changed back to DRAFT';
    END IF;

    IF NEW.status = 'SUBMITTED' AND OLD.status = 'DRAFT' THEN
        SELECT COUNT(*) INTO item_count
          FROM public.justification_items
         WHERE justification_id = NEW.id;

        SELECT COUNT(*) INTO absence_count
          FROM public.attendance a
          JOIN public.sessions s ON s.id = a.session_id
         WHERE a.volunteer_id = NEW.volunteer_id
           AND a.status = 'ABSENT'
           AND s.session_date BETWEEN NEW.week_start_date AND NEW.week_end_date
           AND s.status = 'COMPLETED';

        IF absence_count < 2 THEN
            RAISE EXCEPTION 'Weekly justification is required only when at least two sessions are missed';
        END IF;

        IF item_count <> absence_count THEN
            RAISE EXCEPTION 'Submit one justification item for every missed session in this week';
        END IF;

        IF EXISTS (
            SELECT 1 FROM public.justification_items
             WHERE justification_id = NEW.id AND status <> 'PENDING'
        ) THEN
            RAISE EXCEPTION 'All new justification items must be pending';
        END IF;

        NEW.submitted_at := NOW();
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_justification_submission
BEFORE INSERT OR UPDATE OF status, submitted_at
ON weekly_justifications
FOR EACH ROW EXECUTE FUNCTION validate_justification_submission();

CREATE OR REPLACE FUNCTION apply_justification_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    reviewer_role public.user_role;
    item_form_status public.justification_form_status;
BEGIN
    SELECT role INTO reviewer_role
      FROM public.profiles
     WHERE id = NEW.reviewed_by;

    IF reviewer_role IS DISTINCT FROM 'ADMIN' THEN
        RAISE EXCEPTION 'Only an ADMIN profile can review a justification';
    END IF;

    SELECT wj.status INTO item_form_status
      FROM public.justification_items ji
      JOIN public.weekly_justifications wj ON wj.id = ji.justification_id
     WHERE ji.id = NEW.justification_item_id
     FOR UPDATE OF ji, wj;

    IF item_form_status IS DISTINCT FROM 'SUBMITTED' THEN
        RAISE EXCEPTION 'Only submitted justification items can be reviewed';
    END IF;

    UPDATE public.justification_items
       SET status = CASE NEW.decision
           WHEN 'APPROVED' THEN 'APPROVED'::public.justification_item_status
           WHEN 'REJECTED' THEN 'REJECTED'::public.justification_item_status
           WHEN 'NEEDS_INFORMATION' THEN 'NEEDS_INFORMATION'::public.justification_item_status
       END
     WHERE id = NEW.justification_item_id;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_apply_justification_review
AFTER INSERT ON justification_reviews
FOR EACH ROW EXECUTE FUNCTION apply_justification_review();

CREATE OR REPLACE FUNCTION write_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    old_row JSONB;
    new_row JSONB;
    row_id UUID;
BEGIN
    IF TG_OP IN ('UPDATE', 'DELETE') THEN
        old_row := to_jsonb(OLD);
        row_id := (old_row ->> 'id')::UUID;
    END IF;

    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        new_row := to_jsonb(NEW);
        row_id := (new_row ->> 'id')::UUID;
    END IF;

    INSERT INTO public.audit_logs (
        actor_id, action, entity_type, entity_id, old_values, new_values
    )
    VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        row_id,
        old_row,
        new_row
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_audit_attendance
AFTER INSERT OR UPDATE OR DELETE ON attendance
FOR EACH ROW EXECUTE FUNCTION write_audit_log();

CREATE TRIGGER trg_audit_volunteers
AFTER INSERT OR UPDATE OR DELETE ON volunteers
FOR EACH ROW EXECUTE FUNCTION write_audit_log();

CREATE TRIGGER trg_audit_justification_items
AFTER INSERT OR UPDATE OR DELETE ON justification_items
FOR EACH ROW EXECUTE FUNCTION write_audit_log();

CREATE TRIGGER trg_audit_justification_reviews
AFTER INSERT OR UPDATE OR DELETE ON justification_reviews
FOR EACH ROW EXECUTE FUNCTION write_audit_log();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_volunteers_updated_at
BEFORE UPDATE ON volunteers
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_attendance_updated_at
BEFORE UPDATE ON attendance
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
          FROM public.profiles p
         WHERE p.id = auth.uid()
           AND p.role = 'ADMIN'::public.user_role
    );
$$;

REVOKE ALL ON FUNCTION is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_admin() TO anon, authenticated;

CREATE OR REPLACE VIEW weekly_absence_monitoring
WITH (security_invoker = true)
AS
WITH attendance_week AS (
    SELECT
        a.volunteer_id,
        (s.session_date - ((EXTRACT(ISODOW FROM s.session_date)::INTEGER + 2) % 7))::DATE
            AS week_start,
        a.status AS attendance_status_value,
        ji.status AS justification_status
    FROM attendance a
    JOIN sessions s ON s.id = a.session_id
    LEFT JOIN justification_items ji ON ji.attendance_id = a.id
    WHERE s.status = 'COMPLETED'
)
SELECT
    volunteer_id,
    week_start,
    COUNT(*) FILTER (WHERE attendance_status_value = 'ABSENT') AS total_absences,
    COUNT(*) FILTER (
        WHERE attendance_status_value = 'ABSENT'
          AND justification_status = 'REJECTED'
    ) AS unexcused_absences,
    COUNT(*) FILTER (
        WHERE attendance_status_value = 'ABSENT'
          AND justification_status = 'APPROVED'
    ) AS excused_absences,
    COUNT(*) FILTER (
        WHERE attendance_status_value = 'ABSENT'
          AND (
              justification_status IS NULL
              OR justification_status IN ('PENDING', 'NEEDS_INFORMATION')
          )
    ) AS pending_absences
FROM attendance_week
GROUP BY volunteer_id, week_start
HAVING COUNT(*) FILTER (WHERE attendance_status_value = 'ABSENT') > 0;

CREATE OR REPLACE VIEW volunteer_attendance_summary
WITH (security_invoker = true)
AS
SELECT
    v.id AS volunteer_id,
    v.volunteer_code,

    COUNT(s.id) FILTER (WHERE s.session_type = 'REGULAR') AS regular_total_sessions,
    COUNT(s.id) FILTER (
        WHERE s.session_type = 'REGULAR' AND a.status = 'PRESENT'
    ) AS regular_present_sessions,

    COUNT(s.id) FILTER (WHERE s.session_type = 'EDUCATION_CAMP') AS camp_total_sessions,
    COUNT(s.id) FILTER (
        WHERE s.session_type = 'EDUCATION_CAMP' AND a.status = 'PRESENT'
    ) AS camp_present_sessions,

    COUNT(s.id) AS total_sessions,
    COUNT(s.id) FILTER (WHERE a.status = 'PRESENT') AS total_present_sessions,

    ROUND(
        100.0 * COUNT(s.id) FILTER (WHERE a.status = 'PRESENT')
        / NULLIF(COUNT(s.id), 0),
        2
    ) AS overall_attendance_percentage

FROM volunteers v
LEFT JOIN sessions s
       ON s.status = 'COMPLETED'
      AND s.session_date >= v.joining_date
      AND (v.inactive_date IS NULL OR s.session_date <= v.inactive_date)
      AND NOT EXISTS (
          SELECT 1
            FROM volunteer_leaves vl
           WHERE vl.volunteer_id = v.id
             AND vl.status = 'APPROVED'
             AND s.session_date BETWEEN vl.start_date AND vl.end_date
      )
LEFT JOIN attendance a
       ON a.session_id = s.id
      AND a.volunteer_id = v.id
GROUP BY v.id, v.volunteer_code;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_justifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE justification_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE justification_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own_or_admin
ON profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR public.is_admin());

CREATE POLICY recruitment_public_read
ON recruitment_periods FOR SELECT TO anon, authenticated
USING (
    (
        status = 'OPEN'
        AND NOW() >= opens_at
        AND NOW() < closes_at
    )
    OR public.is_admin()
);

CREATE POLICY applications_admin_read
ON volunteer_applications FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY volunteers_select_own_or_admin
ON volunteers FOR SELECT TO authenticated
USING (profile_id = auth.uid() OR public.is_admin());

CREATE POLICY sessions_authenticated_read
ON sessions FOR SELECT TO authenticated
USING (TRUE);

CREATE POLICY attendance_select_own_or_admin
ON attendance FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM volunteers v
         WHERE v.id = attendance.volunteer_id
           AND v.profile_id = auth.uid()
    )
    OR public.is_admin()
);

CREATE POLICY leaves_select_own_or_admin
ON volunteer_leaves FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM volunteers v
         WHERE v.id = volunteer_leaves.volunteer_id
           AND v.profile_id = auth.uid()
    )
    OR public.is_admin()
);

CREATE POLICY weekly_justifications_select_own_or_admin
ON weekly_justifications FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM volunteers v
         WHERE v.id = weekly_justifications.volunteer_id
           AND v.profile_id = auth.uid()
    )
    OR public.is_admin()
);

CREATE POLICY justification_items_select_own_or_admin
ON justification_items FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1
          FROM weekly_justifications wj
          JOIN volunteers v ON v.id = wj.volunteer_id
         WHERE wj.id = justification_items.justification_id
           AND v.profile_id = auth.uid()
    )
    OR public.is_admin()
);

CREATE POLICY justification_reviews_admin_only
ON justification_reviews FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY evaluations_select_own_or_admin
ON evaluations FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM volunteers v
         WHERE v.id = evaluations.volunteer_id
           AND v.profile_id = auth.uid()
    )
    OR public.is_admin()
);

CREATE POLICY notifications_select_own_or_admin
ON notifications FOR SELECT TO authenticated
USING (profile_id = auth.uid() OR public.is_admin());

CREATE POLICY audit_logs_admin_only
ON audit_logs FOR SELECT TO authenticated
USING (public.is_admin());

SELECT typname FROM pg_type WHERE typname IN
('user_role','recruitment_status','application_status','volunteer_status',
 'leave_status','session_type','session_status','attendance_status',
 'attendance_source','justification_form_status','reason_category',
 'justification_item_status','review_decision','evaluation_type',
 'evaluation_category','notification_channel','notification_status');

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

SELECT table_name, is_updatable FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN ('weekly_absence_monitoring','volunteer_attendance_summary');
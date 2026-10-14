-- Table definition for Staff Attendance
CREATE TABLE IF NOT EXISTS staff_attendance (
    id SERIAL PRIMARY KEY,
    member_id BIGINT,
    staff_id BIGINT,
    status VARCHAR(32) NOT NULL DEFAULT 'PRESENT',
    date TIMESTAMPTZ NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_staff_attendance_member FOREIGN KEY (member_id) REFERENCES member(id) ON DELETE CASCADE,
    CONSTRAINT fk_staff_attendance_staff FOREIGN KEY (staff_id) REFERENCES organization_staff(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_staff_attendance_member_id ON staff_attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_staff_id ON staff_attendance(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_date ON staff_attendance(date);

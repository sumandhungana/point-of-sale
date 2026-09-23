CREATE TABLE staff_salaries (
                                id SERIAL PRIMARY KEY,
                                member_id VARCHAR(255),
                                staff_id INT,
                                month INT,
                                year INT,
                                selected_date TIMESTAMP WITH TIME ZONE,
                                is_slide_on BOOLEAN DEFAULT FALSE NOT NULL,
                                calculation_date TIMESTAMP WITH TIME ZONE,
                                salary_type VARCHAR(50),
                                amount NUMERIC(19, 2),
                                permission VARCHAR(50),
                                created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                                updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Foreign key constraints for @Relation(Relation.Kind.MANY_TO_ONE)
                                CONSTRAINT fk_staff_salaries_member
                                    FOREIGN KEY (member_id)
                                        REFERENCES members (id)
                                        ON DELETE SET NULL,

                                CONSTRAINT fk_staff_salaries_staff
                                    FOREIGN KEY (staff_id)
                                        REFERENCES organization_staffs (id)
                                        ON DELETE SET NULL
);

-- Optional indexes for common lookup patterns
CREATE INDEX idx_staff_salaries_staff_id ON staff_salaries(staff_id);
CREATE INDEX idx_staff_salaries_year_month ON staff_salaries(year, month);
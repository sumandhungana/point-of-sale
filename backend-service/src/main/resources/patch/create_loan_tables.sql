-- Loan Management Tables DDL
CREATE TABLE IF NOT EXISTS loans (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT,
    loan_number VARCHAR(100) NOT NULL,
    lender_name VARCHAR(255) NOT NULL,
    lender_type VARCHAR(50) NOT NULL, -- BANK, PERSON, INSTITUTION, OTHER
    phone_number VARCHAR(50),
    account_number VARCHAR(100),
    principal_amount NUMERIC(19, 2) NOT NULL,
    interest_rate NUMERIC(10, 4) NOT NULL,
    tenure_months INT NOT NULL,
    interest_type VARCHAR(50) NOT NULL, -- REDUCING, FLAT
    start_date DATE NOT NULL,
    monthly_emi NUMERIC(19, 2) NOT NULL,
    total_interest NUMERIC(19, 2) NOT NULL,
    total_payable NUMERIC(19, 2) NOT NULL,
    total_paid NUMERIC(19, 2) DEFAULT 0.00 NOT NULL,
    remaining_balance NUMERIC(19, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL, -- ACTIVE, CLOSED, OVERDUE
    purpose VARCHAR(500),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_loans_member
        FOREIGN KEY (member_id)
            REFERENCES member (id)
            ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_loans_member_id ON loans(member_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_loan_number ON loans(loan_number);

CREATE TABLE IF NOT EXISTS loan_schedules (
    id BIGSERIAL PRIMARY KEY,
    loan_id BIGINT NOT NULL,
    installment_no INT NOT NULL,
    due_date DATE NOT NULL,
    beginning_balance NUMERIC(19, 2) NOT NULL,
    emi_amount NUMERIC(19, 2) NOT NULL,
    principal_component NUMERIC(19, 2) NOT NULL,
    interest_component NUMERIC(19, 2) NOT NULL,
    ending_balance NUMERIC(19, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL, -- PENDING, PAID, OVERDUE
    paid_date DATE,
    paid_amount NUMERIC(19, 2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_loan_schedules_loan
        FOREIGN KEY (loan_id)
            REFERENCES loans (id)
            ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_loan_schedules_loan_id ON loan_schedules(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_schedules_status ON loan_schedules(status);

CREATE TABLE IF NOT EXISTS loan_transactions (
    id BIGSERIAL PRIMARY KEY,
    loan_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    transaction_date DATE NOT NULL,
    type VARCHAR(50) NOT NULL, -- PAYMENT_GIVEN, PAYMENT_RECEIVED
    amount NUMERIC(19, 2) NOT NULL,
    principal_component NUMERIC(19, 2) NOT NULL,
    interest_component NUMERIC(19, 2) NOT NULL,
    payment_mode VARCHAR(50) NOT NULL, -- CASH, BANK_TRANSFER, CHEQUE, DIGITAL
    reference_no VARCHAR(100),
    remarks TEXT,
    balance_after NUMERIC(19, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_loan_transactions_loan
        FOREIGN KEY (loan_id)
            REFERENCES loans (id)
            ON DELETE CASCADE,

    CONSTRAINT fk_loan_transactions_member
        FOREIGN KEY (member_id)
            REFERENCES member (id)
            ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_loan_transactions_loan_id ON loan_transactions(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_transactions_member_id ON loan_transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_loan_transactions_date ON loan_transactions(transaction_date);

-- auto-generated definition
create table member
(
    id                   bigint generated always as identity
        primary key,
    ref_member_id        varchar(255),
    organization_name    varchar(255) not null,
    pan_vat_number       varchar(255) not null,
    organization_type    varchar(255) not null,
    branch               varchar(255) default 'MAIN',
    organization_address varchar(255) not null,
    notes                varchar(255),
    created_at           timestamp,
    updated_at           timestamp,
    created_by           varchar(255) not null,
    updated_by           varchar(255) not null
);

alter table member
    owner to postgres;

ALTER TABLE member ALTER COLUMN ref_member_id DROP NOT NULL;
ALTER TABLE member ALTER COLUMN organization_email DROP NOT NULL;
ALTER TABLE member ALTER COLUMN branch DROP NOT NULL;
ALTER TABLE member ALTER COLUMN notes DROP NOT NULL;
ALTER TABLE member ALTER COLUMN updated_by DROP NOT NULL;

-- Rename column
ALTER TABLE member RENAME COLUMN member_id TO ref_member_id;
ALTER TABLE user_info RENAME COLUMN gmail TO email;
ALTER TABLE user_info
    ADD CONSTRAINT uk_users_user_id UNIQUE (user_id),
    ADD CONSTRAINT uk_users_email UNIQUE (email);
-- Change column data type (using explicit casting)
ALTER TABLE member ALTER COLUMN ref_member_id TYPE bigint USING ref_member_id::bigint;

-- Add new columns
ALTER TABLE member
    ADD COLUMN organization_contact_number VARCHAR(255),
    ADD COLUMN organization_email VARCHAR(255);
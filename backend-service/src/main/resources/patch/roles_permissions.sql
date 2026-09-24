-- Create user_roles table
CREATE TABLE user_roles (
                            id SERIAL PRIMARY KEY,
                            member_id BIGINT,
                            name VARCHAR(255),
                            description TEXT,
                            status VARCHAR(50),
                            created_at TIMESTAMP WITH TIME ZONE,
                            updated_at TIMESTAMP WITH TIME ZONE
);

-- Create user_permissions table
CREATE TABLE user_permissions (
                                  id SERIAL PRIMARY KEY,
                                  role_id INT NOT NULL,
                                  module VARCHAR(255),
                                  permissions JSONB,
                                  created_at TIMESTAMP WITH TIME ZONE,
                                  updated_at TIMESTAMP WITH TIME ZONE,
                                  CONSTRAINT fk_user_permissions_role
                                      FOREIGN KEY (role_id)
                                          REFERENCES user_roles(id)
                                          ON DELETE CASCADE
);
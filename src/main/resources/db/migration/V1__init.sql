CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    content VARCHAR(255) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    user_id BIGINT NOT NULL,

    CONSTRAINT fk_tasks_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

INSERT INTO users(username, password, role)
VALUES (
    'admin',
    '$2a$10$d4ShBRQCt5DiRbjB6hSzW.ngR8HWM5rsw9uHtb36PQLP/muSnOtWO',
    'ADMIN'
);
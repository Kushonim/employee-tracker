-- Pre-populate departments
INSERT INTO department (name) VALUES ('Human Resources'), ('Engineering'), ('Marketing');

-- Pre-populate roles
INSERT INTO role (title, salary, department_id) VALUES 
('HR Manager', 60000, 1),
('Software Engineer', 80000, 2),
('Marketing Specialist', 50000, 3);

-- Pre-populate employees
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('John', 'Doe', 1, NULL),
('Jane', 'Smith', 2, 1),
('Emily', 'Johnson', 3, 1);

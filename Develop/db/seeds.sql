INSERT INTO department (name)
VALUES ('Engineering'),
       ('Finance'),
       ('Legal'),
       ('Sales');

INSERT INTO role (title, salary, department_id)
VALUES ('Software Engineer', 100000, 1),
       ('Accountant', 80000, 2),
       ('Lawyer', 120000, 3),
       ('Salesperson', 60000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Johnny', 'Library', 1, NULL),
       ('Daniel', 'Dickens', 2, 1),
       ('Cee', 'Nova', 3, 1),
       ('Al', 'Black', 4, 1);

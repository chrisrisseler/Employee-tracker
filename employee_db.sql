drop database if exists employee_db;

create database employee_db;
use employee_db;

create table department (
id int auto_increment not null,
name varchar(30),
primary key (id)
);

create table role_table ( 
id int auto_increment not null,
title varchar(30),
salary decimal(10, 2),
department_id int,
primary key(id),
constraint fk_department foreign key(department_id) references department(id) on delete cascade
);

create table employee (
id int auto_increment not null,
first_name varchar(30),
last_name varchar(30),
role_id int,
manager_id int,
primary key(id),
index role_index (role_id),
constraint fk_role foreign key(role_id) references role_table(id) on delete cascade,
index manager_index (manager_id),
constraint fk_manager foreign key(manager_id) references employee(id) on delete set null
);

select employee.id, employee.first_name, employee.last_name, role_table.title, department.name, role_table.salary from employee left join role_table
on employee.role_id = role_table.id left join department
on role_table.department_id = department.id where department.name = "manager";
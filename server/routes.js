const express = require('express');
const router = express.Router();
const pool = require('./dbConnect');

router.get('/employees', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM employees ORDER BY id ASC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка при получении полного списка сотрудников:', err);
        res.sendStatus(500);
    }
});

router.post('/employees', async (req, res) => {
    const { full_name, birth_date, passport, contact, address, department, position, salary, hire_date } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO employees (full_name, birth_date, passport, contact, address, department, position, salary, hire_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [full_name, birth_date, passport, contact, address, department, position, salary, hire_date]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Ошибка при создании сотрудника:', err);
        res.sendStatus(500);
    }
});

router.get('/employees/search', async (req, res) => {
    const { full_name } = req.query;
    try {
        const result = await pool.query(
            'SELECT * FROM employees WHERE full_name ILIKE $1',
            [`%${full_name}%`]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка при поиске сотрудника:', err);
        res.sendStatus(500);
    }
});

router.patch('/employees/fired/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'UPDATE employees SET fired = true WHERE id = $1 AND fired = false RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Сотрудник не найден или уже уволен' });;
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Ошибка при увольнении сотрудника:', err);
        res.sendStatus(500);
    }
});

router.get('/employees/filter', async (req, res) => {
    const { department, position } = req.query
    try {
        let query = 'SELECT * FROM employees WHERE fired = false'
        const params= [];
        if (department){
            params.push(department);
            query += ` AND department = $${params.length}`;
        }
        if (position){
            params.push(position);
            query += ` AND position = $${params.length}`;
        }

        const result = await pool.query (query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка при фильтрации сотрудников:', err);
        res.sendStatus(500);
    }
});

router.put('/employees/:id', async (req, res) => {
    const { id } = req.params;
    const { full_name, birth_date, passport, contact, address, department, position, salary } = req.body;
    try {
        const check = await pool.query(
            'SELECT fired FROM employees WHERE id = $1',
            [id]
        );

        if (check.rows[0].fired) {
            return res.status(400).json({ error: 'Данный сотрудник уволен, обновление данных невозможно' });
        }

        if (check.rows.length === 0) {
            return res.status(404).json({ error: 'Сотрудник не найден' });
        }

        const result = await pool.query(
            `UPDATE employees SET full_name = $1, birth_date = $2, passport = $3, contact = $4, address = $5, department = $6, position = $7, salary = $8 WHERE id = $9 AND fired = false RETURNING *`,
            [full_name, birth_date, passport, contact, address, department, position, salary, id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Ошибка при обновлении данных сотрудника:', err);
        res.sendStatus(500);
    }
});

module.exports = router;
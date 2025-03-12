const express = require('express');
const router = express.Router();
const pool = require('./dbConnect');

router.get('/employees', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM employees WHERE fired = false ORDER BY id ASC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка при получении полного списка сотрудников (не уволенных):', err);
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

module.exports = router;
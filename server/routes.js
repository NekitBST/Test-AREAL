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
        res.status(500);
    }
});

module.exports = router;
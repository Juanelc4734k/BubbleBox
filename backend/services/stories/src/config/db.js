const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'bubblebox2',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/**
 * Ejecutar una consulta con Async/Await
 * @param {string} query - Consulta SQL
 * @param {Array} params - Parámetros opcionales
 * @returns {Promise<Array>} - Resultados de la consulta
 */
const queryAsync = async (query, params = []) => {
    try {
        const [rows] = await pool.execute(query, params);
        return rows;
    } catch (error) {
        console.error("Error en la consulta:", error);
        throw error;
    }
};

/**
 * Ejecutar una consulta con Callbacks
 * @param {string} query - Consulta SQL
 * @param {Array} params - Parámetros opcionales
 * @param {Function} callback - Función callback con error y resultados
 */
const queryCallback = (query, params = [], callback) => {
    // Handle case where params is the callback (2 args case)
    if (typeof params === 'function') {
        callback = params;
        params = [];
    }

    if (typeof callback !== 'function') {
        console.error('Error: callback must be a function');
        return;
    }

    pool.getConnection()
        .then(connection => {
            return connection.execute(query, params)
                .then(([rows]) => {
                    connection.release();
                    callback(null, rows);
                })
                .catch(error => {
                    connection.release();
                    callback(error, null);
                });
        })
        .catch(error => {
            console.error('Error getting connection:', error);
            callback(error, null);
        });
};

// Prueba de conexión
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log("Conectado a la base de datos MySQL");
        connection.release();
    } catch (err) {
        console.error("Error al conectar a la base de datos:", err);
    }
})();

module.exports = {
    pool,
    queryAsync,
    queryCallback
};

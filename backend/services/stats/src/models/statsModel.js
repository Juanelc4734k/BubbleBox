const db = require('../config/db');

const getGrowthStats = (metric) => {
    return new Promise((resolve, reject) => {
        const dateColumn = metric === 'usuarios' ? 'created_at' : 'fecha_creacion';
        
        let query;
        if (metric === 'publicaciones_destacadas') {
            query = `
                WITH DailyCounts AS (
                SELECT 
                    DATE(${dateColumn}) as date,
                    COUNT(*) as count,
                    SUM(CASE 
                        WHEN (SELECT COUNT(*) FROM comentarios c WHERE c.id_contenido = publicaciones.id) >= 10
                        OR (SELECT COUNT(*) FROM reacciones r WHERE r.id_contenido = publicaciones.id) >= 20
                        THEN 1 ELSE 0 
                    END) as featured_count
                FROM publicaciones
                WHERE ${dateColumn} >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                GROUP BY DATE(${dateColumn})
            ),
            DailyGrowth AS (
                SELECT 
                    date,
                    count,
                    featured_count,
                    COALESCE(LAG(count) OVER (ORDER BY date), 0) as previous_day_count,
                    COALESCE(LAG(featured_count) OVER (ORDER BY date), 0) as previous_featured_count
                FROM DailyCounts
            )
            SELECT 
                date,
                count,
                featured_count,
                previous_day_count,
                CASE 
                    WHEN previous_day_count > 0 
                    THEN ROUND(((count - previous_day_count) / previous_day_count * 100), 1)
                    WHEN count > 0 AND previous_day_count = 0
                    THEN 100
                    WHEN count = 0 
                    THEN 0
                    ELSE 0
                END as growth_percentage
            FROM DailyGrowth
            ORDER BY date DESC
            LIMIT 1;`;
        } else {
            query = `
                WITH DailyCounts AS (
                SELECT 
                    DATE(${dateColumn}) as date,
                    COUNT(*) as count
                FROM ${metric}
                WHERE ${dateColumn} >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                GROUP BY DATE(${dateColumn})
            ),
            DailyGrowth AS (
                SELECT 
                    date,
                    count,
                    COALESCE(LAG(count) OVER (ORDER BY date), 0) as previous_day_count
                FROM DailyCounts
            )
            SELECT 
                date,
                count,
                previous_day_count,
                CASE 
                    WHEN previous_day_count > 0 
                    THEN ROUND(((count - previous_day_count) / previous_day_count * 100), 1)
                    WHEN count > 0 AND previous_day_count = 0
                    THEN 100
                    WHEN count = 0 
                    THEN 0
                    ELSE 0
                END as growth_percentage
            FROM DailyGrowth
            ORDER BY date DESC
            LIMIT 1;`;
        }

        db.query(query, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results[0] || { count: 0, growth_percentage: 0, featured_count: 0 });
        });
    });
};

const getDailyStats = async () => {
    try {
        const [users, posts, postsFeatured, communities, comments] = await Promise.all([
            getGrowthStats('usuarios'),
            getGrowthStats('publicaciones'),
            getGrowthStats('publicaciones_destacadas'),
            getGrowthStats('comunidades'),
            getGrowthStats('comentarios'),
        ]);

        return {
            users,
            posts,
            postsFeatured,
            communities,
            comments,
        };
    } catch (error) {
        throw error;
    }
};

const getCountPostsToday = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT COUNT(*) as count
            FROM publicaciones
            WHERE DATE(fecha_creacion) = CURDATE()`;

        db.query(query, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results[0].count);
        });
    });
};

const getPostsFeatured = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT COUNT(*) as count
            FROM publicaciones p
            WHERE (
                SELECT COUNT(*) 
                FROM comentarios c 
                WHERE c.id_contenido = p.id
            ) >= 10
            OR (
                SELECT COUNT(*) 
                FROM reacciones r 
                WHERE r.id_contenido = p.id
            ) >= 20`;

        db.query(query, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results[0].count);
        });
    });
};

const getTotalComents = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT COUNT(*) as count
            FROM comentarios`;

        db.query(query, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results[0].count);
        });
    });
}


const getUsersSummary = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') AS month,
                COUNT(*) AS count,
                COALESCE(COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY DATE_FORMAT(created_at, '%Y-%m')), 0) AS growth
            FROM usuarios
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month ASC`;

        db.query(query, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results);
        });
    });
};

const getGrowthStatsUsuarios = () => {
    return new Promise((resolve, reject) => {
        const query = `
            WITH UserStats AS (
                SELECT 
                    u.id,
                    u.estado,
                    (SELECT COUNT(*) FROM publicaciones WHERE id_usuario = u.id) as post_count,
                    (SELECT COUNT(*) FROM reels WHERE usuario_id = u.id) as reel_count
                FROM usuarios u
            ),
            FeaturedUsers AS (
                SELECT 
                    id,
                    (post_count + reel_count) as content_count
                FROM UserStats
                ORDER BY content_count DESC
                LIMIT 100
            ),
            YesterdayConnected AS (
                SELECT COUNT(*) as count
                FROM usuarios
                WHERE estado = 'conectado'
                AND DATE(lastSeen) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
            ),
            LastWeekTotal AS (
                SELECT COUNT(*) as count
                FROM usuarios
                WHERE created_at <= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            ),
            LastMonthInactive AS (
                SELECT COUNT(*) as count
                FROM usuarios
                WHERE estado = 'desconectado'
                AND (lastSeen IS NULL OR lastSeen <= DATE_SUB(CURDATE(), INTERVAL 30 DAY))
            ),
            LastMonthFeatured AS (
                SELECT COUNT(*) as count
                FROM FeaturedUsers
                WHERE id IN (
                    SELECT id FROM usuarios
                    WHERE created_at <= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                )
            )
            SELECT
                (SELECT COUNT(*) FROM usuarios WHERE estado = 'conectado') as connected,
                (SELECT COUNT(*) FROM usuarios) as total,
                (SELECT COUNT(*) FROM usuarios WHERE estado = 'desconectado') as inactive,
                (SELECT COUNT(*) FROM FeaturedUsers) as featured,
                CASE 
                    WHEN (SELECT count FROM YesterdayConnected) > 0 
                    THEN ROUND((((SELECT COUNT(*) FROM usuarios WHERE estado = 'conectado') - (SELECT count FROM YesterdayConnected)) / (SELECT count FROM YesterdayConnected) * 100), 1)
                    ELSE 0
                END as connected_growth,
                CASE 
                    WHEN (SELECT count FROM LastWeekTotal) > 0 
                    THEN ROUND((((SELECT COUNT(*) FROM usuarios) - (SELECT count FROM LastWeekTotal)) / (SELECT count FROM LastWeekTotal) * 100), 1)
                    ELSE 0
                END as total_growth,
                CASE 
                    WHEN (SELECT count FROM LastMonthInactive) > 0 
                    THEN ROUND((((SELECT COUNT(*) FROM usuarios WHERE estado = 'desconectado') - (SELECT count FROM LastMonthInactive)) / (SELECT count FROM LastMonthInactive) * 100), 1)
                    ELSE 0
                END as inactive_growth,
                CASE 
                    WHEN (SELECT count FROM LastMonthFeatured) > 0 
                    THEN ROUND((((SELECT COUNT(*) FROM FeaturedUsers) - (SELECT count FROM LastMonthFeatured)) / (SELECT count FROM LastMonthFeatured) * 100), 1)
                    ELSE 0
                END as featured_growth
        `;

        db.query(query, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results[0] || { 
                connected: 0, 
                total: 0, 
                inactive: 0, 
                featured: 0,
                connected_growth: 0,
                total_growth: 0,
                inactive_growth: 0,
                featured_growth: 0
            });
        });
    });
};

const getUsersFeatured = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT
                u.id,
                u.nombre,
                u.username,
                u.email,
                u.avatar,
                u.estado,
                (SELECT COUNT(*) FROM publicaciones WHERE id_usuario = u.id) as post_count,
                (SELECT COUNT(*) FROM reels WHERE usuario_id = u.id) as reel_count
            FROM usuarios u
            ORDER BY (post_count + reel_count) DESC
            LIMIT 100`;

        db.query(query, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results);
        });
    });
};


module.exports = {
    getDailyStats,
    getCountPostsToday,
    getTotalComents,
    getPostsFeatured,
    getUsersSummary,
    getGrowthStatsUsuarios,
    getUsersFeatured
};
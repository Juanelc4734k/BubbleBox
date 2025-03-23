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

        db.queryCallback(query, (error, results) => {
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

        db.queryCallback(query, (error, results) => {
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

        db.queryCallback(query, (error, results) => {
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

        db.queryCallback(query, (error, results) => {
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

        db.queryCallback(query, (error, results) => {
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
                WHERE post_count >= 5 OR reel_count >= 3
                ORDER BY content_count DESC
                LIMIT 10
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
                    THEN LEAST(200, ROUND((((SELECT COUNT(*) FROM usuarios WHERE estado = 'conectado') - (SELECT count FROM YesterdayConnected)) / (SELECT count FROM YesterdayConnected) * 100), 1))
                    WHEN (SELECT COUNT(*) FROM usuarios WHERE estado = 'conectado') > 0
                    THEN 100
                    ELSE 0
                END as connected_growth,
                CASE 
                    WHEN (SELECT count FROM LastWeekTotal) > 0 
                    THEN LEAST(200, ROUND((((SELECT COUNT(*) FROM usuarios) - (SELECT count FROM LastWeekTotal)) / (SELECT count FROM LastWeekTotal) * 100), 1))
                    WHEN (SELECT COUNT(*) FROM usuarios) > 0
                    THEN 100
                    ELSE 0
                END as total_growth,
                CASE 
                    WHEN (SELECT count FROM LastMonthInactive) > 0 
                    THEN LEAST(200, ROUND((((SELECT COUNT(*) FROM usuarios WHERE estado = 'desconectado') - (SELECT count FROM LastMonthInactive)) / (SELECT count FROM LastMonthInactive) * 100), 1))
                    WHEN (SELECT COUNT(*) FROM usuarios WHERE estado = 'desconectado') > 0
                    THEN 100
                    ELSE 0
                END as inactive_growth,
                CASE 
                    WHEN (SELECT count FROM LastMonthFeatured) > 0 
                    THEN LEAST(200, ROUND((((SELECT COUNT(*) FROM FeaturedUsers) - (SELECT count FROM LastMonthFeatured)) / (SELECT count FROM LastMonthFeatured) * 100), 1))
                    WHEN (SELECT COUNT(*) FROM FeaturedUsers) > 0
                    THEN 100
                    ELSE 0
                END as featured_growth
        `;

        db.queryCallback(query, (error, results) => {
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

const getGrowthStatsComentarios = () => {
    return new Promise((resolve, reject) => {
        const query = `
            WITH DailyCounts AS (
                SELECT
                    DATE(fecha_creacion) as date,
                    COUNT(*) as count
                FROM comentarios
                WHERE fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                GROUP BY DATE(fecha_creacion)
            ),
            DailyGrowth AS (
                SELECT
                    date,
                    count,
                    COALESCE(LAG(count) OVER (ORDER BY date), 0) as previous_day_count
                FROM DailyCounts
            ),
            TodayComments AS (
                SELECT COUNT(*) as today_count
                FROM comentarios
                WHERE DATE(fecha_creacion) = CURDATE()
            ),
            YesterdayComments AS (
                SELECT COUNT(*) as yesterday_count
                FROM comentarios
                WHERE DATE(fecha_creacion) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
            ),
            Commenters AS (
                SELECT COUNT(DISTINCT id_usuario) as commenters_count
                FROM comentarios
                WHERE DATE(fecha_creacion) = CURDATE()
            ),
            YesterdayCommenters AS (
                SELECT COUNT(DISTINCT id_usuario) as yesterday_commenters
                FROM comentarios
                WHERE DATE(fecha_creacion) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
            ),
            TotalComments AS (
                SELECT COUNT(*) as comments_count
                FROM comentarios
            ),
            YesterdayTotalComments AS (
                SELECT COUNT(*) as yesterday_total
                FROM comentarios
                WHERE fecha_creacion < CURDATE()
            ),
            FeaturedComments AS (
                SELECT
                    c.id
                FROM comentarios c
                LEFT JOIN (
                    SELECT id_contenido, COUNT(*) as comments_count
                    FROM comentarios
                    GROUP BY id_contenido
                ) cc ON c.id_contenido = cc.id_contenido
                LEFT JOIN (
                    SELECT id_contenido, COUNT(*) as reactions_count
                    FROM reacciones
                    GROUP BY id_contenido
                ) rc ON c.id_contenido = rc.id_contenido
                WHERE (
                    (cc.comments_count >= 10 AND rc.reactions_count >= 20)
                    OR (cc.comments_count >= 10 AND rc.reactions_count IS NULL)
                    OR (cc.comments_count IS NULL AND rc.reactions_count >= 20)
                )
            ),
            YesterdayFeaturedComments AS (
                SELECT COUNT(*) as yesterday_featured
                FROM FeaturedComments fc
                JOIN comentarios c ON fc.id = c.id
                WHERE DATE(c.fecha_creacion) < CURDATE()
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
                END as growth_percentage,
                (SELECT today_count FROM TodayComments) as today_count,
                (SELECT commenters_count FROM Commenters) as commenters_count,
                (SELECT comments_count FROM TotalComments) as comments_count,
                (SELECT COUNT(*) FROM FeaturedComments) as featured_count,
                
                -- Calculate growth for today's comments
                CASE
                    WHEN (SELECT yesterday_count FROM YesterdayComments) > 0
                    THEN ROUND((((SELECT today_count FROM TodayComments) - (SELECT yesterday_count FROM YesterdayComments)) / (SELECT yesterday_count FROM YesterdayComments) * 100), 1)
                    WHEN (SELECT today_count FROM TodayComments) > 0
                    THEN 100
                    ELSE 0
                END as today_comments_growth,
                
                -- Calculate growth for commenters
                CASE
                    WHEN (SELECT yesterday_commenters FROM YesterdayCommenters) > 0
                    THEN ROUND((((SELECT commenters_count FROM Commenters) - (SELECT yesterday_commenters FROM YesterdayCommenters)) / (SELECT yesterday_commenters FROM YesterdayCommenters) * 100), 1)
                    WHEN (SELECT commenters_count FROM Commenters) > 0
                    THEN 100
                    ELSE 0
                END as commenters_growth,
                
                -- Calculate growth for total comments
                CASE
                    WHEN (SELECT yesterday_total FROM YesterdayTotalComments) > 0
                    THEN ROUND((((SELECT comments_count FROM TotalComments) - (SELECT yesterday_total FROM YesterdayTotalComments)) / (SELECT yesterday_total FROM YesterdayTotalComments) * 100), 1)
                    WHEN (SELECT comments_count FROM TotalComments) > 0
                    THEN 100
                    ELSE 0
                END as total_comments_growth,
                
                -- Calculate growth for featured comments
                CASE
                    WHEN (SELECT yesterday_featured FROM YesterdayFeaturedComments) > 0
                    THEN ROUND((((SELECT COUNT(*) FROM FeaturedComments) - (SELECT yesterday_featured FROM YesterdayFeaturedComments)) / (SELECT yesterday_featured FROM YesterdayFeaturedComments) * 100), 1)
                    WHEN (SELECT COUNT(*) FROM FeaturedComments) > 0
                    THEN 100
                    ELSE 0
                END as featured_comments_growth
                
            FROM DailyGrowth
            ORDER BY date DESC
            LIMIT 1;`;

        db.queryCallback(query, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results[0] || {
                date: null,
                count: 0,
                previous_day_count: 0,
                growth_percentage: 0,
                today_count: 0,
                commenters_count: 0,
                comments_count: 0,
                featured_count: 0,
                today_comments_growth: 0,
                commenters_growth: 0,
                total_comments_growth: 0,
                featured_comments_growth: 0
            });
        });
    });
};

const getGrowthStatsPublicaciones = () => {
    return new Promise((resolve, reject) => {
        const query = `
            WITH DailyCounts AS (
                SELECT
                    DATE(fecha_creacion) as date,
                    COUNT(*) as count
                FROM publicaciones
                WHERE fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                GROUP BY DATE(fecha_creacion)
            ),
            DailyGrowth AS (
                SELECT
                    date,
                    count,
                    COALESCE(LAG(count) OVER (ORDER BY date), 0) as previous_day_count
                FROM DailyCounts
            ),
            TodayPosts AS (
                SELECT COUNT(*) as today_count
                FROM publicaciones
                WHERE DATE(fecha_creacion) = CURDATE()
            ),
            YesterdayPosts AS (
                SELECT COUNT(*) as yesterday_count
                FROM publicaciones
                WHERE DATE(fecha_creacion) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
            ),
            Publishers AS (
                SELECT COUNT(DISTINCT id_usuario) as publishers_count
                FROM publicaciones
                WHERE DATE(fecha_creacion) = CURDATE()
            ),
            YesterdayPublishers AS (
                SELECT COUNT(DISTINCT id_usuario) as yesterday_publishers
                FROM publicaciones
                WHERE DATE(fecha_creacion) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
            ),
            TotalPosts AS (
                SELECT COUNT(*) as posts_count
                FROM publicaciones
            ),
            YesterdayTotalPosts AS (
                SELECT COUNT(*) as yesterday_total
                FROM publicaciones
                WHERE fecha_creacion < CURDATE()
            ),
            FeaturedPosts AS (
                SELECT
                    p.id
                FROM publicaciones p
                LEFT JOIN (
                    SELECT id_contenido, COUNT(*) as comments_count
                    FROM comentarios
                    WHERE tipo_contenido = 'publicacion'
                    GROUP BY id_contenido
                ) c ON p.id = c.id_contenido
                LEFT JOIN (
                    SELECT id_contenido, COUNT(*) as reactions_count
                    FROM reacciones
                    WHERE tipo_contenido = 'publicacion'
                    GROUP BY id_contenido
                ) r ON p.id = r.id_contenido
                WHERE COALESCE(c.comments_count, 0) >= 10 OR COALESCE(r.reactions_count, 0) >= 20
            ),
            YesterdayFeaturedPosts AS (
                SELECT COUNT(*) as yesterday_featured
                FROM FeaturedPosts fp
                JOIN publicaciones p ON fp.id = p.id
                WHERE DATE(p.fecha_creacion) < CURDATE()
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
                END as growth_percentage,
                (SELECT today_count FROM TodayPosts) as today_count,
                (SELECT publishers_count FROM Publishers) as publishers_count,
                (SELECT posts_count FROM TotalPosts) as posts_count,
                (SELECT COUNT(*) FROM FeaturedPosts) as featured_count,
                
                -- Calculate growth for today's posts
                CASE
                    WHEN (SELECT yesterday_count FROM YesterdayPosts) > 0
                    THEN ROUND((((SELECT today_count FROM TodayPosts) - (SELECT yesterday_count FROM YesterdayPosts)) / (SELECT yesterday_count FROM YesterdayPosts) * 100), 1)
                    WHEN (SELECT today_count FROM TodayPosts) > 0
                    THEN 100
                    ELSE 0
                END as today_posts_growth,
                
                -- Calculate growth for publishers
                CASE
                    WHEN (SELECT yesterday_publishers FROM YesterdayPublishers) > 0
                    THEN ROUND((((SELECT publishers_count FROM Publishers) - (SELECT yesterday_publishers FROM YesterdayPublishers)) / (SELECT yesterday_publishers FROM YesterdayPublishers) * 100), 1)
                    WHEN (SELECT publishers_count FROM Publishers) > 0
                    THEN 100
                    ELSE 0
                END as publishers_growth,
                
                -- Calculate growth for total posts
                CASE
                    WHEN (SELECT yesterday_total FROM YesterdayTotalPosts) > 0
                    THEN ROUND((((SELECT posts_count FROM TotalPosts) - (SELECT yesterday_total FROM YesterdayTotalPosts)) / (SELECT yesterday_total FROM YesterdayTotalPosts) * 100), 1)
                    WHEN (SELECT posts_count FROM TotalPosts) > 0
                    THEN 100
                    ELSE 0
                END as total_posts_growth,
                
                -- Calculate growth for featured posts
                CASE
                    WHEN (SELECT yesterday_featured FROM YesterdayFeaturedPosts) > 0
                    THEN ROUND((((SELECT COUNT(*) FROM FeaturedPosts) - (SELECT yesterday_featured FROM YesterdayFeaturedPosts)) / (SELECT yesterday_featured FROM YesterdayFeaturedPosts) * 100), 1)
                    WHEN (SELECT COUNT(*) FROM FeaturedPosts) > 0
                    THEN 100
                    ELSE 0
                END as featured_posts_growth
                
            FROM DailyGrowth
            ORDER BY date DESC
            LIMIT 1;`;

        db.queryCallback(query, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results[0] || {
                date: null,
                count: 0,
                previous_day_count: 0,
                growth_percentage: 0,
                today_count: 0,
                publishers_count: 0,
                posts_count: 0,
                featured_count: 0,
                today_posts_growth: 0,
                publishers_growth: 0,
                total_posts_growth: 0,
                featured_posts_growth: 0
            });
        });
    });
};

const getPostsMontly = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT
                DATE_FORMAT(fecha_creacion, '%Y-%m') as month,
                COUNT(*) as count
            FROM publicaciones
            WHERE fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)  
            GROUP BY DATE_FORMAT(fecha_creacion, '%Y-%m')
            ORDER BY month DESC`;

        db.queryCallback(query, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results);
        });
    });
};

const getPostCount = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT
                COUNT(*) as count
            FROM publicaciones
            WHERE fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;

        db.queryCallback(query, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results[0].count);
        });
    });
};

const getCountCommentsByType = (type) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT
                DATE(fecha_creacion) as date,
                COUNT(*) as count
            FROM comentarios
            WHERE tipo_contenido = ?
            AND fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE(fecha_creacion)
            ORDER BY date DESC`;

        db.queryCallback(query, [type], (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results);
        });
    });
};

const getCommentsMonthly = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT
                DATE_FORMAT(fecha_creacion, '%Y-%m') as month,
                COUNT(*) as count
            FROM comentarios
            WHERE fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(fecha_creacion, '%Y-%m')
            ORDER BY month ASC`;

        db.queryCallback(query, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results);
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

        db.queryCallback(query, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results);
        });
    });
};

const getReelsGrowthStats = () => {
    return new Promise((resolve, reject) => {
        const query = `
            WITH DailyCounts AS (
                SELECT
                    DATE(fecha_creacion) as date,
                    COUNT(*) as count
                FROM reels
                WHERE fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                GROUP BY DATE(fecha_creacion)
            ),
            DailyGrowth AS (
                SELECT
                    date,
                    count,
                    COALESCE(LAG(count) OVER (ORDER BY date), 0) as previous_day_count
                FROM DailyCounts
            ),
            TodayReels AS (
                SELECT COUNT(*) as today_count
                FROM reels
                WHERE DATE(fecha_creacion) = CURDATE()
            ),
            ReelCommenters AS (
                SELECT COUNT(DISTINCT id_usuario) as commenters_count
                FROM comentarios
                WHERE tipo_contenido = 'reel'
                AND DATE(fecha_creacion) = CURDATE()
            ),
            TotalReelComments AS (
                SELECT COUNT(*) as comments_count
                FROM comentarios
                WHERE tipo_contenido = 'reel'
            ),
            FeaturedReels AS (
                SELECT 
                    r.id
                FROM reels r
                LEFT JOIN (
                    SELECT id_contenido, COUNT(*) as comments_count
                    FROM comentarios
                    WHERE tipo_contenido = 'reel'
                    GROUP BY id_contenido
                ) c ON r.id = c.id_contenido
                LEFT JOIN (
                    SELECT id_contenido, COUNT(*) as reactions_count
                    FROM reacciones
                    WHERE tipo_contenido = 'reel'
                    GROUP BY id_contenido
                ) rc ON r.id = rc.id_contenido
                WHERE COALESCE(c.comments_count, 0) >= 5 OR COALESCE(rc.reactions_count, 0) >= 10
            )
            SELECT
                COALESCE(MAX(dg.date), CURDATE()) as date,
                COALESCE(SUM(dg.count), 0) as count,
                COALESCE(SUM(dg.previous_day_count), 0) as previous_day_count,
                CASE
                    WHEN COALESCE(SUM(dg.previous_day_count), 0) > 0
                    THEN ROUND(((COALESCE(SUM(dg.count), 0) - COALESCE(SUM(dg.previous_day_count), 0)) / COALESCE(SUM(dg.previous_day_count), 0) * 100), 1)
                    WHEN COALESCE(SUM(dg.count), 0) > 0 AND COALESCE(SUM(dg.previous_day_count), 0) = 0
                    THEN 100
                    ELSE 0
                END as growth_percentage,
                (SELECT today_count FROM TodayReels) as today_reels,
                (SELECT commenters_count FROM ReelCommenters) as unique_commenters,
                (SELECT comments_count FROM TotalReelComments) as total_comments,
                (SELECT COUNT(*) FROM FeaturedReels) as featured_reels
            FROM DailyGrowth dg`;

        db.queryCallback(query, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results[0] || { 
                count: 0, 
                growth_percentage: 0, 
                today_reels: 0,
                unique_commenters: 0,
                total_comments: 0,
                featured_reels: 0
            });
        });
    });
};

const getReelsSummary = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                DATE_FORMAT(fecha_creacion, '%Y-%m') AS month,
                COUNT(*) AS count,
                COALESCE(COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY DATE_FORMAT(fecha_creacion, '%Y-%m')), 0) AS growth
            FROM reels
            WHERE fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(fecha_creacion, '%Y-%m')
            ORDER BY month ASC`;

        db.queryCallback(query, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results);
        });
    });
};

const getCommunitiesSummary = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                DATE_FORMAT(fecha_creacion, '%Y-%m') AS month,
                COUNT(*) AS count,
                COALESCE(COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY DATE_FORMAT(fecha_creacion, '%Y-%m')), 0) AS growth,
                ROUND(
                    COALESCE(
                        (COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY DATE_FORMAT(fecha_creacion, '%Y-%m'))) / 
                        NULLIF(LAG(COUNT(*)) OVER (ORDER BY DATE_FORMAT(fecha_creacion, '%Y-%m')), 0) * 100, 
                        0
                    ), 
                1) AS growth_percentage
            FROM comunidades
            WHERE fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(fecha_creacion, '%Y-%m')
            ORDER BY month ASC`;

        db.queryCallback(query, (error, results) => {
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
    getUsersFeatured,
    getReelsGrowthStats,
    getReelsSummary,
    getGrowthStatsComentarios,
    getGrowthStatsPublicaciones,
    getCountCommentsByType,
    getCommentsMonthly,
    getPostsMontly,
    getPostCount,
    getCommunitiesSummary
};
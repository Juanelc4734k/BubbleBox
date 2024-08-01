module.exports = {
    chats: {
        target: 'http://localhost:3001',
        pathRewrite: { '^/chats': '' },
    },
    reels: {
        target: 'http://localhost:3002',
        pathRewrite: { '^/reels': '' },
    },
    stories: {
        target: 'http://localhost:3003',
        pathRewrite: { '^/stories': '' },
    },
    communities: {
        target: 'http://localhost:3004',
        pathRewrite: { '^/communities': '' },
    },
    friendships: {
        target: 'http://localhost:3005',
        pathRewrite: { '^/friendships': '' },
    },
    music_player: {
        target: 'http://localhost:3006',
        pathRewrite: { '^/music-player': '' },
    },
    notifications: {
        target: 'http://localhost:3007',
        pathRewrite: { '^/notifications': '' },
    },
    posts: {
        target: 'http://localhost:3008',
        pathRewrite: { '^/posts': '' },
    },
    users: {
        target: 'http://localhost:3009',
        pathRewrite: { '^/users': '' },
    },
    auth: {
        target: 'http://localhost:3010',
        pathRewrite: { '^/auth': '' },
        changeOrigin: true,
    },
};
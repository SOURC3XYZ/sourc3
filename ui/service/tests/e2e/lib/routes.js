module.exports = {
    wallet: {
        restore: () => '/wallet/restore',
        start: () => '/wallet/start',
        kill: () => '/wallet/kill'
    },
    beam: {
        req: () => '/beam'
    },
    git: {
        getSeeds: () => '/git',
        initRepo: (id) => `/git/${id}`,
        getCurrent: () => '/git/current'
    }
};
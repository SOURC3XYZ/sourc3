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
        getSeedRepos: (id) => `/git/repos/${id}`,
        initRepo: (id) => `/git/${id}`,
        getCurrent: () => '/git/current'
    }
};
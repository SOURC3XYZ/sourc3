const { request } = require('./utils/request')
const { routes } = require('./lib/index');
const fs = require('fs');

describe('restore wallet', () => {
    fs.rmSync('testrepo', { recursive: true, force: true });
    const { wallet, beam, git } = routes;
    let id;
    it('without params', async () => {
        const res = await request(wallet.restore(), { seed: 'qwer' })
        expect(res.message)
            .toBe('you did not send the password or/and seed-phrase');
    });
    it('with bas params', async () => {
        const res = await request(
            wallet.restore(),
            {
                seed: 'eans;green;amateur;manual;clever;gift',
                password: 123
            }
        )
        expect(res.message)
            .toBe('wrong seed-phrase or wallet api is running now');
    });
    it('normal start', async () => {
        const body = {
            seed: 'jeans;green;amateur;manual;clever;gift;absent;vital;human;tourist;lamp;pull;',
            password: 123
        };
        const walletReq = {
            jsonrpc: "2.0",
            id: 6,
            method: "wallet_status"
        }
        const restore = await request(wallet.restore(), body);
        id = restore.restored.id;
        expect(restore.message)
            .toBe('wallet successfully restored');


        const failStart = await request(wallet.start(), { password: 1 });
        expect(failStart.message)
            .toBe('Please check your password');

        const start = await request(wallet.start(), body);
        expect(start)
            .toBe('wallet api started successfully');

        const beamRes = await request(beam.req(), walletReq);

        expect(typeof beamRes.result).toBe('object');

    });
    it('get repos', async () => {
        const repos = await request(git.getSeeds(), {}, 'GET');
        expect(typeof repos.find(el => el.id === id)).toBe('object');
    })
    it('init local repo', async () => {
        let localRepoId;
        const localBody = {
            remote: 'https://github.com/SixStringer91/chess-backend.git',
            local: 'testrepo'
        }

        const init = await request(git.initRepo(id), localBody, 'POST');
        localRepoId = init.repo.id;
        expect(init.isOk).toBe(true);

        const repos = await request(git.getSeeds(), {}, 'GET');
        expect(typeof repos.find(el => el.repos.find(el => el.id === localRepoId)))
            .toBe('object');
    })
})

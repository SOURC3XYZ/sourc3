# git-remote-beam

## Demo
1. Add `git-remote-beam` to system PATH. For Windows it can be added via system settings, for Linux using `export PATH=$PATH:/path/`;
2. Setup beam node;
3. Setup beam wallet;
4. Properly fill `beam-remote.cfg`. `pass` is password for your wallet, without quotes, `node_addr` -- address of node from step 2, i.e. `127.0.0.1:10005`, `wallet_path` -- path to your `wallet.db` file. Ensure that `pass` is a password from your wallet located in `wallet_path`, `shader_app_file`, `shader_contract_file` -- full path for `app.wasm` and `contract.wasm` of git-remote-beam. All paths should not contains quotes;
5. Copy `beam-remote.cfg` to $HOME/.beam;
6. Create new remote repository on Beam;
```powershell
wallet shader --shader_app_file=app.wasm \
--shader_args="role=user,action=create_repo,repo_name=testrepo,cid=fda210a4af51fdd2ce1d2a1c0307734ce6fef30b3eec4c04c4d7494041f2dd10" \
--log_level=debug -n node_address
```
where `wallet` is beam-wallet, i. e. `beam-wallet-masternet`; `node_address` -- node address from 3 step, for example `127.0.0.1:10005`.

7. Create local repository
```
mkdir testrepo
cd testrepo
git init
```
8. Fill local repository with usual stuff
```
git add -A
git commit -m "Some commit message"
```
9. Add __git remote__ to the local repository. Use `beam://name_of_repo`, where `name_of_repo` equals name in `repo_name` shader arguments from step 5
```
git remote add origin beam://testrepo
```
10. Push your changes
```
git push origin master:master
```
11. Navigate to another directory
12. Clone repository from beam. Use the same address, as you used in 8
```
mkdir testrepo_clone
cd testrepo_clone
git clone -v "beam://testrepo" .
```

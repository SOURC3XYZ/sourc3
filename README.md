# SOURC3

## Demo
1. Add `git-remote-sourc3` to system PATH. For Windows it can be added via system settings, for Linux using `export PATH=$PATH:/path/`
2. Setup beam node
3. Setup beam wallet
4. [Setup](https://github.com/BeamMW/beam/wiki/Beam-wallet-protocol-API#running-wallet-api) beam wallet API
5. Properly fill `sourc3-remote.cfg`. `--app-shader-file` should be the full path for `app.wasm` of `git-remote-sourc3`. All paths should not contains quotes
6. Copy `sourc3-remote.cfg` to `$HOME/.sourc3` on Linux `C:\Users\<user name>\.sourc3` on Windows
7. Create new remote repository using SOURC3
```powershell
beam-wallet shader --shader_app_file=app.wasm \
--shader_args="role=user,action=create_repo,repo_name=testrepo,cid=fda210a4af51fdd2ce1d2a1c0307734ce6fef30b3eec4c04c4d7494041f2dd10" \
--log_level=debug -n node_address
```
where `wallet` is beam-wallet, i. e. `beam-wallet-masternet`; `node_address` -- node address, for example `127.0.0.1:10005`.
8. Create local repository
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
9. Add __git remote__ to the local repository. Use `sourc3://<user public key>/name_of_repo`, where `name_of_repo` equals name in `repo_name` shader arguments from step 7
```
git remote add origin sourc3://<user public key>/testrepo
```
10. Push your changes
```
git push origin master:master
```
11. Navigate to another directory
12. Clone repository. Use the same address, as you used in 8
```
mkdir testrepo_clone
cd testrepo_clone
git clone -v "sourc3://<user public key>/testrepo" .
```

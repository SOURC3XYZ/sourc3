# git-remote-beam

## Demo
1. Copy `beam-remote.cfg` to $HOME/.beam
1. add git-beam-remote to system PATH
1. Setup beam node 
1. Setup beam wallet
1. Create new remote repo on Beam
```
beam-wallet-masternet.exe shader --shader_app_file=app.wasm \
--shader_args="role=user,action=create_repo,repo_name=testrepo5,cid=fda210a4af51fdd2ce1d2a1c0307734ce6fef30b3eec4c04c4d7494041f2dd10" \
--log_level=debug -n 127.0.0.1:10505
```
1. Create locarepo
```
mkdir testrepo
cd testrepo
git init
```
1. Fill local repo
```
git add
git commit
```
1. Add git remote to the local repo
```
git remote add beam://testrepo
```
1. Push your changes
```
git push origin master:master
```
1. Navigate to another directory
1. Clone repo from beam
```
mkdir testrepo_clone
cd testrepo_clone
git clone -v "beam://testrepo" .
```

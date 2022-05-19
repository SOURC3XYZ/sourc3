Steps to upgrade contract:

1. Save previous SID in conract.h, rename it and place as last item of array `g_pSid` in `app.cpp`. For example rename to `git_remote_beam::s_SID_{previous version}` and leave `git_remote_beam::s_SID` (which automaticly generates when compiling via shader-sdk).

2. Compile contract.cpp and generate new `s_SID`, then compile app.cpp.

3. In resulting app.wasm array `g_pSid` must have previous SID and new one.

4. Call shader method as following:

- `cid` - Contract ID of previously deployed contract;
- `hTarget` - Height after which contract will be able to upgrade to new bytecode. This Height must be higher sum of than current Height of blockchain and `hMinUpgradeDelay` (which was set in deploy params when contract was deployed, usually 1).

*!Do not forget option `--shader_privilege 2` for cli-wallet because method will not work without it!*

```bash
./beam-wallet-masternet shader --shader_privilege 2 --shader_app_file=app.wasm --shader_args='role=manager,action=schedule_upgrade,cid=cid,hTarget=hTarget,approve_mask=1' --shader_contract_file=contract.wasm
```

5. As blockchain reached height set in previous step `explicit_upgrade` method can be called.

```bash
./beam-wallet-masternet shader --shader_privilege 2 --shader_app_file=app.wasm --shader_args='role=manager,action=explicit_upgrade,cid=fc3a38836e99ee501c679935bbbdc30f1e1ac568b263d7bffb1add2aaf16ce57' --shader_contract_file=contract.wasm
```


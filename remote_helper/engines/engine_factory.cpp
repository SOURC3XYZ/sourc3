// Copyright 2021-2022 SOURC3 Team
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#include "engine_factory.h"

#include "engines/ipfs/ipfs_engine.h"
#include "engines/ipfs-bc/ipfs_bc_engine.h"
#include "wallets/base_client.h"

std::unique_ptr<IEngine> CreateEngine(IWalletClient& client) {
    const auto& options = client.GetOptions();
    if (options.useIPFS && options.useFullIPFS) {
        return std::make_unique<FullIPFSEngine>(client);
    } else {
        return std::make_unique<IPFSBlockChainEngine>(client);
    }
}

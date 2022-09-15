#include "wallets/base_client.h"

std::string IWalletClient::PushObjects(const std::string&,
                                const std::vector<sourc3::Ref>&,
                                bool) {
    return "";
}

std::string IWalletClient::GetAllObjectsMetadata() {
    return "";
}

std::string IWalletClient::GetObjectData(const std::string&) {
    return "";
}

std::string IWalletClient::GetObjectDataAsync(const std::string&, AsyncContext) {
    return "";
}

std::string IWalletClient::GetReferences() {
    return "";
}

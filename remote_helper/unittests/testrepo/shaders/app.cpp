#include "Shaders/common.h"
#include "Shaders/app_common_impl.h"
#include "contract.h"

#include <algorithm>
#include <vector>
#include <utility>
#include <string_view>

namespace SerializationSample
{
#include "contract_sid.i"
}

using Action_func_t = void (*)(const ContractID&);
using Actions_map_t = std::vector<std::pair<std::string_view, Action_func_t>>;
using Roles_map_t = std::vector<std::pair<std::string_view, const Actions_map_t&>>;

constexpr size_t ACTION_BUF_SIZE = 32;
constexpr size_t ROLE_BUF_SIZE = 16;

void On_error(const char* msg)
{
	Env::DocGroup root("");
	{
		Env::DocAddText("error", msg);
	}
}

template <typename T>
auto find_if_contains(const std::string_view str, const std::vector<std::pair<std::string_view, T>>& v) {
	return std::find_if(v.begin(), v.end(), [&str](const auto& p) {
		return str == p.first;
	});
}

void On_action_create_contract(const ContractID& unused)
{
	using namespace SerializationSample;
	SerializationSample::InitialParams params;
	//params.name = "Test name";
	params.anotherName = "literal";
	params.health = 589;
	//params.attributes = { "test", "3", "wertyuiop[ " };

	CountStream cs;
	yas::binary_oarchive<CountStream, YAS_FLAGS> sizeCalc(cs);
	sizeCalc& params;

	auto paramSize = sizeof(Buffer) + cs.m_size;
	std::vector<char> v(paramSize, '\0');
	Buffer* buf = reinterpret_cast<Buffer*>(v.data());
	buf->size = cs.m_size;

	MemStream ms(buf->data, buf->size);
	yas::binary_oarchive<MemStream, YAS_FLAGS> ar(ms);
	ar& params;


	Env::GenerateKernel(nullptr, SerializationSample::InitialParams::METHOD, buf, paramSize, nullptr, 0, nullptr, 0, "Create SerializationSample contract", 0);
}

void On_action_destroy_contract(const ContractID& cid)
{
	Env::GenerateKernel(&cid, 1, nullptr, 0, nullptr, 0, nullptr, 0, "Destroy SerializationSample contract", 0);
}

void On_action_view_contracts(const ContractID& unused)
{
	EnumAndDumpContracts(SerializationSample::s_SID);
}

void On_action_view_contract_params(const ContractID& cid)
{
	Env::Key_T<int> k;
	k.m_Prefix.m_Cid = cid;
	k.m_KeyInContract = 0;

	SerializationSample::InitialParams params;
	if (!Env::VarReader::Read_T(k, params))
		return On_error("Failed to read contract's initial params");

	Env::DocGroup gr("params");
}

BEAM_EXPORT void Method_0()
{
    Env::DocGroup root("");
    {
        Env::DocGroup gr("roles");
        {
            Env::DocGroup grRole("manager");
            {
                Env::DocGroup grMethod("create_contract");
            }
            {
                Env::DocGroup grMethod("destroy_contract");
                Env::DocAddText("cid", "ContractID");
            }
            {
                Env::DocGroup grMethod("view_contracts");
            }
			{
				Env::DocGroup grMethod("view_contract_params");
				Env::DocAddText("cid", "ContractID");
			}
        }
        {
            Env::DocGroup grRole("user");
            {
            }
        }
    }
}

BEAM_EXPORT void Method_1()
{
	const Actions_map_t VALID_USER_ACTIONS = {
	};

	const Actions_map_t VALID_MANAGER_ACTIONS = {
		{"create_contract", On_action_create_contract},
		{"destroy_contract", On_action_destroy_contract},
		{"view_contracts", On_action_view_contracts},
		{"view_contract_params", On_action_view_contract_params},
	};

	/* Add your new role's actions here */

	const Roles_map_t VALID_ROLES = {
		{"user", VALID_USER_ACTIONS},
		{"manager", VALID_MANAGER_ACTIONS},
		/* Add your new role here */
	};

	char action[ACTION_BUF_SIZE], role[ROLE_BUF_SIZE];

	if (!Env::DocGetText("role", role, sizeof(role))) {
		return On_error("Role not specified");
	}
	
	auto it_role = find_if_contains(role, VALID_ROLES);

	if (it_role == VALID_ROLES.end()) {
		return On_error("Invalid role");
	}

	if (!Env::DocGetText("action", action, sizeof(action))) {
		return On_error("Action not specified");
	}

	auto it_action = find_if_contains(action, it_role->second); 

	if (it_action != it_role->second.end()) {
		ContractID cid;
		Env::DocGet("cid", cid); 
		it_action->second(cid);
	} else {
		On_error("Invalid action");
	}
}

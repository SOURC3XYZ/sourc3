#include "Shaders/common.h"
#include "Shaders/app_common_impl.h"
#include "Shaders/Math.h"
#include "contract.h"


using namespace git;

BEAM_EXPORT void Ctor(InitialParams& params)
{
	Env::SaveVar_T(0, params);
}

BEAM_EXPORT void Dtor(void*)
{
	Env::DelVar_T(0);
}

BEAM_EXPORT void Method_2(void*)
{

}

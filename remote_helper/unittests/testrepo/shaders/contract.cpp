#include "Shaders/common.h"
#include "Shaders/app_common_impl.h"
#include "Shaders/Math.h"
#include "contract.h"

using namespace SerializationSample;

BEAM_EXPORT void Ctor(Buffer& paramsBuffer)
{
	InitialParams* params = static_cast<InitialParams*>(Env::StackAlloc(paramsBuffer.size));
	MemStream ms(paramsBuffer.data, paramsBuffer.size);
	yas::binary_iarchive<MemStream, YAS_FLAGS> iar(ms);

	iar& *params;

	Env::SaveVar_T(0, *params);
}

BEAM_EXPORT void Dtor(void*)
{
	Env::DelVar_T(0);
}

BEAM_EXPORT void Method_2(void*)
{

}

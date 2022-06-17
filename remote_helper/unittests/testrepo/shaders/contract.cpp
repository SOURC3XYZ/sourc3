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
